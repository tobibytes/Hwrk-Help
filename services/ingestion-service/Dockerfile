# syntax=docker/dockerfile:1.8

FROM node:20-alpine
WORKDIR /app/services/ingestion-service

# Install dependencies
COPY services/ingestion-service/package*.json ./
RUN npm install

# Copy source and build
COPY services/ingestion-service/ ./
RUN npm run build

EXPOSE 4010
CMD ["node", "dist/index.js"]

