const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Secure Auth API',
      version: '1.0.0',
      description: 'Production-ready Node.js Express & Prisma Auth API',
    },
    servers: [
      {
        url: 'https://secured-auth-api.onrender.com',
        description: 'Production Server (Render)',
      },
      {
        url: 'http://localhost:5000',
        description: 'Local Development Server',
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};