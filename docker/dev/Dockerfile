FROM node:20-alpine

# Install additional tools for development
RUN apk add --no-cache git

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm ci

# Copy source code
COPY . .

# Expose port for Next.js dev server
EXPOSE 3000

# Expose ports for Node.js debugging
EXPOSE 9230 9231

# Set Node.js debugging options and enable source maps
ENV NODE_OPTIONS="--inspect=0.0.0.0:9230 --enable-source-maps"
ENV NODE_ENV="development"

# Start development server
CMD ["npm", "run", "dev"]
