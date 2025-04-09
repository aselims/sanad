FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
ENV NODE_ENV=production
RUN npm ci && npm cache clean --force

# Copy all files
COPY . .

# Build the application
RUN npm run build

# Production stage with Nginx for serving static files
FROM nginx:stable-alpine

# Copy Nginx configuration
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy our custom Nginx config
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d

# Expose the port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"] 