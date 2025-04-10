FROM node:18-alpine AS builder

WORKDIR /app

# Install build dependencies for native modules using build-base metapackage
RUN apk add --no-cache --update build-base python3

# Copy package files
COPY package*.json ./

# Install dependencies with production mode
ENV NODE_ENV=production
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production

# Install runtime dependencies required for native modules
RUN apk add --no-cache --update python3

# Copy only the necessary files from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Create a non-root user and set permissions
RUN addgroup -S nodejs && adduser -S nodejs -G nodejs && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose the port
EXPOSE 3000

# Start the application
CMD ["node", "dist/main.js"] 