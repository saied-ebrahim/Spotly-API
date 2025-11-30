import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Spotly API',
      version: '1.0.0',
      description: 'Complete REST API documentation for the Spotly backend. This API provides endpoints for authentication, events management, categories, tags, organizers, and file uploads.',
      contact: {
        name: 'Spotly API Support'
      }
    },
    servers: [
      {
        url: 'http://localhost:' + (process.env.PORT || 5000),
        description: 'Development server'
      },
      { url: 'https://spotly-api.vercel.app', description: 'Production server' }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints'
      },
      {
        name: 'Events',
        description: 'Event management endpoints'
      },
      {
        name: 'Categories',
        description: 'Category management endpoints'
      },
      {
        name: 'Tags',
        description: 'Tag management endpoints'
      },
      {
        name: 'Organizers',
        description: 'Organizer information endpoints'
      },
      {
        name: 'Upload',
        description: 'File upload and retrieval endpoints'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token obtained from login endpoint'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'error'
            },
            message: {
              type: 'string',
              example: 'Error message'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'success'
            }
          }
        }
      }
    }
  },
  apis: [
    './src/routes/*.js',
    './routes/*.js'
  ]
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;


