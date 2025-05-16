# Use Node.js base image
FROM node:18

# Install qpdf
RUN apt-get update && apt-get install -y qpdf

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app source
COPY . .

# Expose port
EXPOSE 8080

# Set Node.js to run in production mode with verbose logging
ENV NODE_ENV=production
ENV NODE_DEBUG=*
ENV DEBUG=express:*

# Start command with explicit host binding
CMD [ "node", "--trace-warnings", "index.js" ] 