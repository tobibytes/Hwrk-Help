# syntax=docker/dockerfile:1.8

FROM node:20-alpine
WORKDIR /app/services/canvas-service

# Install dependencies
COPY services/canvas-service/package*.json ./
RUN npm install

# Copy source and build
COPY services/canvas-service/ ./
RUN npm run build

EXPOSE 4002
CMD ["node", "dist/index.js"]

