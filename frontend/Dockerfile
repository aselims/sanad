FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies and skip tests
ENV CI=true
ENV SKIP_TESTS=true
RUN npm install

# Copy all files
COPY . .

# Expose the port Vite runs on
EXPOSE 5173

# Start the development server with host set to allow connections from outside
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"] 