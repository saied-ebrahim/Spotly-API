import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'spotly',
      version: '1.0.0',
      description: 'REST API documentation for the spotly backend.'
    },
    servers: [
      {
        url: 'http://localhost:' + (process.env.PORT || 5000)
      },
      // { url: 'https://spotly-api-b7ci.onrender.com/' }

    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: [
    './routes/*.js'
  ]
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;


