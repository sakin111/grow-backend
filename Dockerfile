FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies and generate Prisma Client
RUN npm install
RUN npx prisma generate

COPY . .
RUN npm run build

# --- Production Stage ---
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
# Install ONLY production dependencies, but ALLOW scripts to run so Prisma sets up
RUN npm install --omit=dev

# Copy generated Prisma Client and build files from builder
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

ENV NODE_ENV=production
EXPOSE 5000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/server.js"]
