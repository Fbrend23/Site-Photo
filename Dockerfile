FROM node:20-alpine

WORKDIR /app

# Install vips for sharp (image processing)
RUN apk add --no-cache vips-dev

# Install server dependencies
COPY server/package.json server/package-lock.json ./server/
RUN cd server && npm ci --production

# Copy built client
COPY client/dist ./client/dist

# Copy server source (pre-compiled)
COPY server/dist ./server/dist
COPY server/data ./server/data

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "server/dist/index.js"]
