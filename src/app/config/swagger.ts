import swaggerJsdoc from 'swagger-jsdoc';
import { envVar } from './envVar';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GROW API Documentation',
      version: '1.0.0',
      description: 'API documentation for the GROW backend application',
    },
    servers: [
      {
        url: `http://localhost:${envVar.PORT || 5000}/api/v1`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/app/modules/**/*.route.ts'],

};

export const swaggerSpec = swaggerJsdoc(options);
