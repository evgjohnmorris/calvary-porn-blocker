FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install native build dependencies for sqlite3
RUN apk add --no-cache python3 make g++ 

# Install dependencies
COPY PornBlockerAgent/package.json ./
RUN npm install

# Copy application code
COPY PornBlockerAgent/ ./

# Expose HTTP port and DNS ports
EXPOSE 3456
EXPOSE 53/tcp
EXPOSE 53/udp

# Set production environment
ENV NODE_ENV=production

# Run the agent
CMD ["node", "server.js"]
