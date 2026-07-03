
import "@dotenvx/dotenvx/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  // Point to the schema directory so Prisma loads all partial schema files
  schema: 'prisma/schema',
  migrations: {
    path: 'prisma/migrations',
  },
})
