import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Secure Authentication API',
      version: '1.0.0',
      description: 'Production-ready authentication system built with Node.js, Express, Zod, Prisma, and PostgreSQL.',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'sessionId',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'], // Scans all route files for JSDoc tags
};

export const swaggerSpec = swaggerJSDoc(options);