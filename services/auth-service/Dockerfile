# syntax=docker/dockerfile:1.8

FROM node:20-alpine
WORKDIR /app/services/auth-service

# Install dependencies
COPY services/auth-service/package*.json ./
RUN npm install

# Copy source and build
COPY services/auth-service/ ./
RUN npm run build

EXPOSE 4001
CMD ["node", "dist/index.js"]
