require('@dotenvx/dotenvx/config');

module.exports = {
  schema: 'prisma/schema',
  migrations: {
    path: 'prisma/migrations',
  },
  datasources: {
    url: process.env.DIRECT_URL,
  },
};
