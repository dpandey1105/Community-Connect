FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Don't overwrite .env.production - it's already copied

# Build the application
RUN npm run build

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 5222

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5222

# Start the application
CMD ["node", "dist/index.js"]