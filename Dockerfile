FROM node:20-bookworm-slim

# Install netcat (nc), python3, pip3, and system libraries required by docling (e.g., libgomp1)
RUN apt-get update && apt-get install -y --no-install-recommends \
    netcat-openbsd \
    python3 \
    python3-pip \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Install docling system-wide for parsing documents
RUN pip3 install --no-cache-dir --break-system-packages docling

WORKDIR /app

# Install dependencies separately to leverage Docker layer caching
COPY package.json package-lock.json ./
RUN npm install

# Copy all source files
COPY . .

EXPOSE 3000

# Start script that waits for MySQL database container to boot, 
# then runs drizzle schema push to automatically set up the tables, 
# and finally runs the Next.js server!
CMD ["sh", "-c", "until nc -z db 3306; do echo 'Waiting for MySQL database container to accept connections...'; sleep 3; done; npx drizzle-kit push && npm run dev"]
