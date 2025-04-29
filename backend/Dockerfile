FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy source code
COPY . .

# Set environment
ENV NODE_ENV=production

# Expose port
EXPOSE 5003

# Start the server
CMD ["npm", "start"]
