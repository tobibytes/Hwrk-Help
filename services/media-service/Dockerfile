# syntax=docker/dockerfile:1.8

FROM node:20-alpine
WORKDIR /app/services/media-service

# Install dependencies
COPY services/media-service/package*.json ./
RUN npm install

# Copy source and build
COPY services/media-service/ ./
RUN npm run build

EXPOSE 4030
CMD ["node", "dist/index.js"]

