#!/usr/bin/env bash
# exit on error
set -o errexit

# 1. Install all dependencies (including devDependencies needed for building)
npm install

# 2. Generate Prisma Client
npx prisma generate

# 3. Build the application (compiles TypeScript to dist/)
npm run build

# 4. Run database migrations safely before launching the app
npx prisma migrate deploy
