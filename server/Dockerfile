# Use Node.js base image
FROM node:18-slim

# Install qpdf and verify installation
RUN apt-get update && \
    apt-get install -y qpdf && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    qpdf --version

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Create uploads directory with proper permissions
RUN mkdir -p uploads && \
    chmod 755 uploads

# Copy app source
COPY . .

# Verify qpdf is accessible
RUN which qpdf && \
    qpdf --version

# Expose port
EXPOSE 8080

# Set Node.js to run in production mode
ENV NODE_ENV=production
ENV PORT=8080

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Start command
CMD ["node", "index.js"] 