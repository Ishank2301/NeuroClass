# Multi-Stage Dockerfile for NeuroClass PACS Diagnostic Suite

# Stage 1: Build the React + TypeScript + Vite application
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package.json ./

# Install dependencies cleanly
RUN npm install

# Copy application source code
COPY . .

# Build production bundle
RUN npm run build

# Stage 2: Serve with lightweight Nginx web server
FROM nginx:alpine

# Copy custom nginx configuration for SPA routing
RUN cat << 'EOF' > /etc/nginx/conf.d/default.conf
server {
    listen 3000;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html index.htm;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript application/json image/svg+xml;

    # Static assets caching
    location ~* \.(?:ico|css|js|gif|jpe?g|png|svg|woff2?|eot|ttf|otf|webp)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # SPA routing fallback to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Healthcheck endpoint
    location /healthz {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Copy built static files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose production port
EXPOSE 3000

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/healthz || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
