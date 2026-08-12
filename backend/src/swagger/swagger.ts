import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Feedback Collection System API',
      version: '1.0.0',
      description:
        'Production-grade RESTful API for Feedback Form Builder, Public Submissions, RBAC Workspace Management, and Analytics.',
      contact: {
        name: 'Pavan Kalyan R',
        url: 'https://github.com/pavankalyanr02/Feedback-Collection-System',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development Server',
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
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);
