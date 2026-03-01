# Lumen ISSP Protocol — Node Container
# Lightweight Node.js runtime for self-host deployment

FROM node:20-alpine

WORKDIR /app

# Install dependencies first (cache layer)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application
COPY . .

# Non-root user for security
RUN addgroup -g 1001 -S lumen && \
    adduser -S lumen -u 1001 -G lumen && \
    mkdir -p /app/data && \
    chown -R lumen:lumen /app

USER lumen

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "src/telegram/webhook-server.js"]
