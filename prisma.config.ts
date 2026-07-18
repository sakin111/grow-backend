
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: 'prisma/schema',
  migrations: {
    path: 'prisma/migrations',
  },
 datasource: {
    url: process.env.DIRECT_URL as string, // direct connection for migrations
  },
})