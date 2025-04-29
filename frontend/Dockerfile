# Stage 1: dependencies + build
FROM node:18-slim AS builder
WORKDIR /usr/src/app

# Install dependencies (including dev deps)
COPY package*.json ./
RUN npm install

# Copy source and set environment
COPY . .
ENV NEXT_PUBLIC_API_URL=http://localhost:5003/api/v1

# Build application
RUN npm run build

# Stage 2: production image
FROM node:18-slim
WORKDIR /usr/src/app

# Copy build artifacts and production deps
COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/package*.json ./

# Set production env
ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=http://backend:5003/api/v1

EXPOSE 3000
CMD ["npm", "start"]
