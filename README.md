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

## 🔰 Complete Beginner's Friendly Guide

Welcome to BioEditor Studio! If you are new to programming, full-stack development, or AI pipelines, this simple guide will explain how to start the application, use its core features, and inspect its activities with ease.

### 🌟 1. The Three Core Features Explained
When you open the web application, you will find three main ways to create a beautiful wedding biodata:
1. **Blank Slate (No previous data)**:
   * **What it does**: Initializes a brand new biodata instantly.
   * **When to use**: If you are starting fresh and do not have an existing resume/biodata. Just enter the full name, click generate, and start editing!
2. **AI Import (If you have a file)**:
   * **What it does**: Lets you upload an existing resume/biodata file in **PDF, DOCX, TXT, MD, or Image** format.
   * **When to use**: If you already have a structured CV or a scan of a biodata document. The app automatically extracts and structures everything for you.
3. **AI Prompt (If you want to copy-paste or write a description)**:
   * **What it does**: Provides a text area where you can type or paste a direct description of yourself or someone else.
   * **When to use**: If you don't have a document file, but want the local AI to draft a beautiful layout from raw, unstructured notes (e.g., *"My name is Rahim, studying at BUET, my dad is a teacher..."*).

---

### 🚀 2. Absolute Beginner's Launch Guide (Step-by-Step)
You do not need to install local databases, Node environments, or Python packages! Everything is pre-configured to run with Docker in a single click:

1. **Prerequisites**: Make sure you have **Docker Desktop** installed on your system ([Download Docker here](https://www.docker.com/products/docker-desktop/)).
2. **Start the Application**: Open your computer's terminal (or shell) in this project directory, and type:
   ```bash
   docker compose up -d --build
   ```
   *(The `-d` option runs the processes in the background, keeping your terminal window free!)*
3. **Access the Application**: Open your web browser and go to:
   * 🌐 **Live Web App**: [http://localhost:3001](http://localhost:3001)

---

### 👁️ 3. How to Watch the AI's Brain (Inspecting Logs)
Our document parsing pipeline uses two high-end AI components inside the Docker network: **IBM Docling** and **Google Gemma 3**. If you want to see exactly how they parse layouts, clean formatting, and structure your biodata:
1. Open a terminal and run this command:
   ```bash
   docker logs -f bioeditor-web
   ```
2. Now, go to the Web App and start an **AI Import** or **AI Prompt** task.
3. You will see live print statements in your terminal showing:
   * `[Docling] Invoking Docling conversion...` (OCR and layout extraction)
   * `[Ollama] Querying model gemma3...` (AI structuring in action)
   * `[Worker] Successfully saved parsed biodata...` (MySQL database insertion)

---

### 🗄️ 4. Managing Your Database Visually (Zero SQL Needed)
If you want to see where all biodatas, items, and settings are saved without writing databases queries:
1. Go to **phpMyAdmin** in your browser: [http://localhost:8085](http://localhost:8085)
2. Log in with the credentials:
   * *Username:* `root`
   * *Password:* `rootpassword`
3. Click on the database name **`simple_biodata_editor`** on the left menu.
4. Click on the **`biodata`** table to view, edit, or delete created profiles inside a user-friendly spreadsheet view!

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

## 🧠 Ollama Local LLM & Model Switching Guide

BioEditor Studio utilizes a local **Ollama** LLM server to process and format extracted resumes into structured, high-fidelity wedding biodatas. The default model is **Google Gemma 3** (`gemma3`), which provides an excellent balance of structure-adherence, linguistic courtesy, and lightweight execution on standard VPS CPUs.

You can switch to any other LLM supported by Ollama (e.g., `qwen2.5:3b`, `llama3.2`, `gemma2`) depending on your hardware limits and accuracy requirements.

### ⚙️ Model Switching Criteria & Steps

To switch models, you need to **pull the weights inside Ollama** and **configure the Next.js app environment variable**.

#### Option A: Docker-Based Deployment (Recommended)

1. **Pull the model weights** inside the running Ollama container (e.g., to pull `gemma3`):
   ```bash
   docker exec -it bioeditor-ollama ollama pull gemma3
   ```
   *(Note: For VPS deployments, ensure the container name matches. If you run a custom setup, pull the model weights inside your active Ollama instance).*

2. **Configure the application model environment variable** by editing [docker-compose.yml](file:///home/sishufol/BioEditor/simple-biodata-editor/docker-compose.yml):
   Add the `OLLAMA_MODEL` environment variable inside the `web` service's `environment:` block:
   ```yaml
   services:
     web:
       ...
       environment:
         - DATABASE_URL=mysql://root:rootpassword@db:3306/simple_biodata_editor
         - NODE_ENV=development
         - REDIS_HOST=redis
         - OLLAMA_HOST=http://ollama:11434
         - OLLAMA_MODEL=gemma3 # <-- Add or customize your model name here!
   ```

3. **Restart the Next.js container** to apply the configuration changes:
   ```bash
   docker compose restart web
   ```

---

#### Option B: Host-Level Deployment (Ubuntu VPS / Local)

1. **Pull the model weights** in your active terminal:
   ```bash
   ollama pull gemma3
   ```

2. **Configure the environment variable** inside your local [.env](file:///home/sishufol/BioEditor/simple-biodata-editor/.env) file:
   ```env
   OLLAMA_MODEL=gemma3
   ```

3. **Restart your PM2 process or local server** to load the updated environment variables:
   ```bash
   # If running with PM2:
   pm2 restart bioeditor-studio

   # If running locally:
   npm run dev
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
