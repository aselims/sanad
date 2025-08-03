FROM nginx:stable-alpine

# Copy pre-built frontend files
COPY dist /usr/share/nginx/html

# Copy our custom Nginx config
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d

# Expose the port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"] 