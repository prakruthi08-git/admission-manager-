# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies for build
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build app
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --production

# Copy built app from builder
COPY --from=builder /app/dist ./dist

EXPOSE 5000
CMD ["node", "dist/index.cjs"]
