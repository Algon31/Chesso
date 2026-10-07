# ==========================================
# Stage 1: Build Frontend Assets
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies with lockfile
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .

# Support build-time environment variables
ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

RUN npm run build

# ==========================================
# Stage 2: Serve with Lightweight Nginx
# ==========================================
FROM nginx:alpine AS runner

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy build artifacts from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
