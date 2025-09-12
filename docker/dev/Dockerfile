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
EXPOSE 9229 9230

# Force development mode and set debugging options
ENV NODE_ENV="development"

# Start development server with debugging
CMD ["npm", "run", "dev:debug"]
