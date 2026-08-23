FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
# 1. Install dependencies first (leverages Docker cache)
RUN npm install

# 2. Copy ALL code into the container (including your prisma directory)
COPY . .

# 3. Generate Prisma client NOW that files are present
RUN npx prisma generate
RUN npm run build

# --- Production Stage ---
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

# Copy generated Prisma Client and build files from builder
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/dist ./dist

# CRITICAL FIX: Copy the entire prisma folder so schema.prisma is available at runtime
COPY --from=builder /app/prisma ./prisma

# If you use a Prisma configuration file, copy it as well
COPY --from=builder /app/prisma.config.js ./prisma.config.js

ENV NODE_ENV=production
EXPOSE 5000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/server.js"]
