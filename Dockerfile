FROM node:20-alpine

# Install netcat (nc) to wait for MySQL port
RUN apk add --no-cache netcat-openbsd

WORKDIR /app

# Install dependencies separately to leverage Docker layer caching
COPY package.json package-lock.json ./
RUN npm install

# Copy all source files
COPY . .

EXPOSE 3000

# Start script that waits for MySQL database container to boot, 
# then runs drizzle schema push to automatically set up the tables, 
# and finally runs the hot-reloading Next.js dev server!
CMD ["sh", "-c", "until nc -z db 3306; do echo 'Waiting for MySQL database container to accept connections...'; sleep 3; done; npx drizzle-kit push && npm run dev"]
