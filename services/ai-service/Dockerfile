# syntax=docker/dockerfile:1.8

FROM node:20-alpine
WORKDIR /app/services/ai-service

# Install dependencies
COPY services/ai-service/package*.json ./
RUN npm install

# Copy source and build
COPY services/ai-service/ ./
RUN npm run build

EXPOSE 4020
CMD ["node", "dist/index.js"]

