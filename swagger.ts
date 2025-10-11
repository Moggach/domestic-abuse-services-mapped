import { SwaggerDefinition } from 'swagger-jsdoc';

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'UK domestic abuse services API',
    version: '1.0.1',
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
              name: { type: 'string', example: 'Example Domestic Abuse Service' },
              description: { type: 'string', example: 'Provides support for women and children' },
              address: { type: 'string', example: '123 Example Street, London' },
              postcode: { type: 'string', example: 'SW1A 1AA' },
              email: { type: 'string', example: 'contact@example-service.org' },
              website: { type: 'string', example: 'https://example-service.org' },
              phone: { type: 'string', example: '020 1234 5678' },
              donate: { type: 'string', example: 'https://example-service.org/donate' },
              serviceType: {
                type: 'array',
                items: { type: 'string' },
                example: ['Domestic abuse support', 'Housing support'],
              },
              serviceSpecialism: {
                type: 'array',
                items: { type: 'string' },
                example: ['Polish women', 'LGBTQ survivors'],
              },
              approved: { type: 'boolean', example: true },
              localAuthority: { type: 'string', example: 'Westminster' },
              distance: { 
                type: 'number', 
                description: 'Distance from search postcode in miles (only present when searching by postcode)',
                example: 2.45 
              },
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
                example: [-0.1276, 51.5074],
              },
            },
          },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            example: 'Invalid postcode format',
          },
        },
      },
      Success: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          id: {
            type: 'string',
            example: 'recABC123',
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
