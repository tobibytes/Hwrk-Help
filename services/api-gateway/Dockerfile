# syntax=docker/dockerfile:1.8

FROM node:20-alpine
WORKDIR /app/services/api-gateway

# Install dependencies
COPY services/api-gateway/package*.json ./
RUN npm install

# Copy source and build
COPY services/api-gateway/ ./
RUN npm run build

EXPOSE 3001
CMD ["node", "dist/index.js"]
