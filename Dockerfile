# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy all source files first
COPY . .

# Create a dummy .env so prisma.config.ts can load without errors
RUN touch .env

# Install dependencies (skip postinstall to avoid premature prisma generate)
RUN npm install --ignore-scripts

# Generate Prisma client using the directory (reads all .prisma files)
RUN npx prisma generate --schema=./prisma/schema

# Build TypeScript
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm install --omit=dev --ignore-scripts

# Copy built files and prisma client from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# Start the application
CMD ["npm", "start"]
