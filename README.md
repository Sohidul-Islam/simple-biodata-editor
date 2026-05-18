# BioEditor Studio

> **Premium Full-Stack Wedding Biodata Builder** built with **Next.js 16**, **React 19**, **Drizzle ORM**, and **MySQL**.

BioEditor Studio is a high-end web application that transitions a simple static interactive biodata builder into a complete senior-level enterprise full-stack solution. It enables users to create, manage, reorder, print-to-PDF, and publicly share stunning, high-fidelity wedding biodatas with real-time editing previews.

---

## 🏛️ Senior-Level Full-Stack Architecture

* **Framework & Frontend**: **Next.js 16 App Router** with **React 19** and **TypeScript** for strong, type-safe development.
* **Database & ORM**: **Drizzle ORM** communicating with a **MySQL** server via the `mysql2` promise client. Includes a cached global pool connection manager to prevent hot-reload connection leaks.
* **Resilient Connection Degradation**: Intercepts database connection failures gracefully and presents a developer-friendly diagnostic troubleshooting guide inside the dashboard UI instead of letting the application crash.
* **Pixel-Perfect A4 Live Preview**: Left-side editor controls synchronized instantly with a right-side high-fidelity, zoom-scalable A4 preview paper element.
* **Zero-Cloud Asset Storage**: Uploaded profiles are stored inside the MySQL database as Base64 encoded strings, making the system self-contained with no external S3/CDN requirements.
* **Advanced Layout Customizer**: Toggle templates segment by segment (e.g., Grid, List, Academic for education, Full Paragraph Text) and reorder entire sections dynamically in the preview.

---

## 🐳 Running with Docker (Recommended / Plug-and-Play)

The entire full-stack application environment (Next.js server + MySQL Database + phpMyAdmin control panel) is completely containerized. You can boot up the entire stack with a **single command**!

### 1. Start the Environment

Simply run this command in your project root folder:
```bash
docker compose up --build
```

### 🔍 What happens automatically under-the-hood:
1. **MySQL 8** database container boots up and persists its data in a Docker-named volume (`mysql_data`).
2. **phpMyAdmin** database manager boots up and links securely to the MySQL container.
3. The **Next.js Web Container** starts and automatically waits for the MySQL port to accept TCP connections.
4. Once database connectivity is active, it runs `npx drizzle-kit push` to **automatically compile and build your database tables**, then launches the Next.js dev server with Hot Module Replacement (HMR) active!

---

### 🌐 Access URLs

Once Docker finishes launching, open these links in your browser:

* **Live Web Application**: [http://localhost:3001](http://localhost:3001)
* **phpMyAdmin Database Panel**: [http://localhost:8085](http://localhost:8085)
  * *Username:* `root`
  * *Password:* `rootpassword`
* **Isolated MySQL Host Port**: `localhost:3307` *(To avoid clashes with your existing MySQL container running on port 3306!)*

---

### 🔌 Connecting to an Existing Docker MySQL Instance

If you are already running your own global MySQL server and phpMyAdmin containers and want to use those instead of our pre-packaged ones:

1. Connect your Next.js app to your existing Docker MySQL instance by updating your [.env](file:///home/sishufol/BioEditor/simple-biodata-editor/.env) file:
   ```env
   DATABASE_URL=mysql://YOUR_USER:YOUR_PASSWORD@host.docker.internal:3306/simple_biodata_editor
   ```
2. Start **only** the web service using Docker Compose:
   ```bash
   docker compose up --build web
   ```

---

## 💻 Manual Local Running (Alternative)

If you prefer to run Node.js locally on your host machine without Docker:

### 📋 Prerequisites
* **Node.js** (v18.x or later recommended)
* **MySQL Server** (running locally or accessible remotely)
* **npm** (comes packaged with Node.js)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Verify your MySQL database credentials in the local [.env](file:///home/sishufol/BioEditor/simple-biodata-editor/.env) file:
```env
DATABASE_URL=mysql://YOUR_USER:YOUR_PASSWORD@127.0.0.1:3306/simple_biodata_editor
```

### 3. Create the Database
In your MySQL client or shell:
```sql
CREATE DATABASE simple_biodata_editor;
```

### 4. Push Database Schema
```bash
npx drizzle-kit push
```

### 5. Launch local server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Available NPM Scripts

You can execute the following commands in the project terminal:

| Script | Command | Description |
| :--- | :--- | :--- |
| **`npm run dev`** | `next dev` | Starts the development server locally with HMR. |
| **`npm run build`** | `next build` | Compiles and builds the production Next.js application bundles. |
| **`npm run start`** | `next start` | Starts the production server after a successful build. |
| **`npm run lint`** | `next lint` | Scans the codebase for static syntax and code formatting. |
| **`npx drizzle-kit generate`** | `drizzle-kit generate` | Generates SQL migration files inside the `./drizzle` folder. |
| **`npx drizzle-kit push`** | `drizzle-kit push` | Syncs local schema changes directly to your MySQL database instantly. |
| **`npx tsc --noEmit`** | `tsc --noEmit` | Performs a static TypeScript compiler verification on all files. |

---

## 💡 Developer & IDE Tips

### VS Code Red Underline / TS(2307) Cache Lag
When files are generated dynamically by external tools, VS Code's internal TypeScript server can experience cached virtual memory lag, showing incorrect red squiggly lines under relative imports.

If this happens:
1. Open the Command Palette in VS Code: `Ctrl + Shift + P` (or `Cmd + Shift + P` on macOS).
2. Search and select: **`TypeScript: Restart TS Server`**.
3. All red warning squiggly lines will instantly clear!
