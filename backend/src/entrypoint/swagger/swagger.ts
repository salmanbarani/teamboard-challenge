import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: 'APSIS API ENDPOINTS',
      version: '1.0.0',
      description: 'APSIS API Information',
    },
    servers: ['http://localhost:3000'],
    schemes: ["http"],
    host: "localhost:3080",
    basePath: "/api",
    
  },
  apis: [
    'src/entrypoint/routes/counters.ts',
    'src/entrypoint/routes/teams.ts'
  ], // path to the API docs


};

// Initialize swagger-jsdoc -> returns validated swagger spec in json format
const swaggerSpec = swaggerJsDoc(swaggerOptions);

export function setupSwagger(app: any) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
