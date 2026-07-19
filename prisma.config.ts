
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: 'prisma/schema',
  migrations: {
    path: 'prisma/migrations',
  },
 datasource: {
    url: (process.env.DIRECT_URL || process.env.DATABASE_URL) as string, // Use DIRECT_URL for migrations, fallback to DATABASE_URL
  },
})