import { SwaggerDefinition } from 'swagger-jsdoc';

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'UK domestic abuse services API',
    version: '1.0.0',
    description: 'API that returns and manages UK domestic abuse services in GeoJSON format',
  },
  servers: [
    {
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/airtable`,
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
    schemas: {
      GeoJSONFeature: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            example: 'Feature',
          },
          properties: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              description: { type: 'string' },
              address: { type: 'string' },
              postcode: { type: 'string' },
              email: { type: 'string' },
              website: { type: 'string' },
              phone: { type: 'string' },
              donate: { type: 'string' },
              serviceType: {
                type: 'array',
                items: { type: 'string' },
              },
              serviceSpecialism: {
                type: 'array',
                items: { type: 'string' },
              },
              approved: { type: 'boolean' },
              localAuthority: { type: 'string' },
            },
          },
          geometry: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                example: 'Point',
              },
              coordinates: {
                type: 'array',
                items: { type: 'number' },
              },
            },
          },
        },
      },
    },
  },
};

export const swaggerOptions = {
  swaggerDefinition,
  apis: ['./src/app/api/**/*.ts'],
};
