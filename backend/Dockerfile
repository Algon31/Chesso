# ==========================================
# Stage 1: Production Dependencies
# ==========================================
FROM node:20-alpine AS deps

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install production-only dependencies
RUN npm ci --omit=dev

# ==========================================
# Stage 2: Final Runtime Image
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package*.json ./

# Copy application source code
COPY . .

# Set non-root permissions for security
USER node

EXPOSE 3000

CMD ["node", "server.js"]
