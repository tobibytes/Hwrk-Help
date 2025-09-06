# syntax=docker/dockerfile:1.8

FROM node:20-alpine
WORKDIR /app/services/notification-service

# Install dependencies
COPY services/notification-service/package*.json ./
RUN npm install

# Copy source and build
COPY services/notification-service/ ./
RUN npm run build

EXPOSE 4040
CMD ["node", "dist/index.js"]

