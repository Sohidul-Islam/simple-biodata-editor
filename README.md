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

## 🚀 VPS & Cloud Server Deployment

To deploy BioEditor Studio to a VPS (e.g., DigitalOcean, Linode, AWS EC2, Hetzner, Vultr) or Cloud Hosting, you can manage it either **via Docker (Highly Recommended)** or **directly on the Host OS**.

---

### 📋 System & Hardware Requisitions

Due to the advanced AI components (IBM Docling for document parsing, PyTorch CPU libraries, and Ollama for the local LLM), the VPS has the following hardware requirements:

| Component | Minimum Requisition | Recommended Requisition | Rationale |
| :--- | :--- | :--- | :--- |
| **CPU** | **2 Cores** | **4 Cores** | Required for ONNX Runtime OCR and local LLM model execution. |
| **RAM** | **4 GB RAM** | **8 GB RAM** | IBM Docling (1.5GB) + Ollama LLM (2GB+) + Next.js/MySQL (1GB). |
| **Storage** | **20 GB SSD** | **40 GB+ SSD** | To accommodate Docker images, OCR models, and local LLM model weights. |
| **OS** | **Ubuntu 22.04 LTS** | **Ubuntu 24.04 LTS** | Standardized for modern package compatibility and Docker engine. |

---

### 🐳 Option A: Docker-Based Deployment (Recommended)

Managing your application from Docker on a VPS is incredibly clean because **all dependencies (Node, Python 3, Docling, MySQL, Redis, phpMyAdmin, and Ollama) are fully containerized**. The `Dockerfile` has been optimized using a Debian-based `node:20-bookworm-slim` base image to support PyTorch and glibc libraries out of the box.

#### 1. Setup Docker on the VPS
Install the Docker Engine and Docker Compose on your Ubuntu VPS:
```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-v2
sudo systemctl enable --now docker
```

#### 2. Configure Environment Variables
Create a production `.env` file in the root of the project:
```env
DATABASE_URL=mysql://root:secure_production_password@db:3306/simple_biodata_editor
NODE_ENV=production
```

#### 3. Adjust Docker Compose for Production
For a production deployment:
1. Update `docker-compose.yml` environment passwords (`MYSQL_ROOT_PASSWORD`) and PMA configuration to secure values.
2. If you are not using `phpmyadmin` in production, you can comment it out from the services list.

#### 4. Spin Up the Stack
Run Docker Compose in detached mode to launch everything in the background:
```bash
docker compose up -d --build
```
Docker will pull all dependencies, compile the database migrations, and boot the application automatically!

---

### 💻 Option B: Host-Level Deployment (Ubuntu VPS)

If your VPS has limited resources (e.g., 2GB–4GB RAM) and you want to bypass the resource overhead of Docker virtualization, you can install the components directly on the host OS.

#### 1. Install Node.js, MySQL, & Redis
```bash
# Install Node.js (v20)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MySQL & Redis
sudo apt-get install -y mysql-server redis-server
sudo systemctl enable --now mysql redis-server
```

#### 2. Install Python 3, Pip, and IBM Docling
IBM Docling uses deep learning and layout tools that require `libgomp1` (OpenMP runtime library) on Debian/Ubuntu systems:
```bash
# Install system packages
sudo apt-get update
sudo apt-get install -y python3 python3-pip libgomp1

# Install Docling system-wide
sudo pip3 install --break-system-packages docling
```

#### 3. Build & Run Next.js with PM2 (Production Process Manager)
Install PM2 globally to manage the Node server lifecycle, keep it running, and restart it on system reboots:
```bash
# Install PM2
sudo npm install -g pm2

# Build Next.js app
npm install
npx drizzle-kit push
npm run build

# Start with PM2
pm2 start npm --name "bioeditor-studio" -- run start

# Enable startup script
pm2 startup
pm2 save
```

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
