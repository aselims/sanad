FROM node:18-alpine

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production

# Install runtime dependencies required for native modules
RUN apk add --no-cache --update python3

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy pre-built application
COPY dist ./dist

# Create a non-root user and set permissions
RUN addgroup -S nodejs && adduser -S nodejs -G nodejs && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose the port
EXPOSE 3000

# Start the application
CMD ["node", "dist/index.js"] 