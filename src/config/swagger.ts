import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Salon & Spa Booking API',
            version: '1.0.0',
            description: 'A comprehensive API for salon and spa booking management with admin panel',
            contact: {
                name: 'Alcobra Salon',
                email: 'admin@alcobrasalon.com',
            },
        },
        servers: [
            {
                url: process.env.NODE_ENV === 'production' ? 'https://alcobra.vercel.app' : `http://localhost:${process.env.PORT || 3000}`,
                description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
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
                Error: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false,
                        },
                        message: {
                            type: 'string',
                            example: 'Error message',
                        },
                        errors: {
                            type: 'array',
                            items: {
                                type: 'object',
                            },
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
                        message: {
                            type: 'string',
                            example: 'Operation successful',
                        },
                        data: {
                            type: 'object',
                        },
                    },
                },
                Service: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            example: 'clfxyz123',
                        },
                        name: {
                            type: 'string',
                            example: 'Haircut & Style',
                        },
                        description: {
                            type: 'string',
                            example: 'Professional haircut with styling',
                        },
                        duration: {
                            type: 'integer',
                            example: 60,
                        },
                        price: {
                            type: 'number',
                            example: 45.00,
                        },
                        category: {
                            type: 'string',
                            example: 'Hair',
                        },
                        imageUrl: {
                            type: 'string',
                            example: 'https://example.com/image.jpg',
                        },
                        isActive: {
                            type: 'boolean',
                            example: true,
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
                Booking: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            example: 'clfabc123',
                        },
                        customerName: {
                            type: 'string',
                            example: 'John Doe',
                        },
                        customerPhone: {
                            type: 'string',
                            example: '+1234567890',
                        },
                        customerEmail: {
                            type: 'string',
                            example: 'john@example.com',
                        },
                        serviceId: {
                            type: 'string',
                            example: 'clfxyz123',
                        },
                        requestedDate: {
                            type: 'string',
                            format: 'date',
                            example: '2023-12-25',
                        },
                        requestedTime: {
                            type: 'string',
                            format: 'time',
                            example: '14:30:00',
                        },
                        status: {
                            type: 'string',
                            enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
                            example: 'PENDING',
                        },
                        notes: {
                            type: 'string',
                            example: 'Customer notes',
                        },
                        adminNotes: {
                            type: 'string',
                            example: 'Admin notes',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: [
        process.env.NODE_ENV === 'production' ? './dist/routes/*.js' : './src/routes/*.ts',
        process.env.NODE_ENV === 'production' ? './dist/controllers/*.js' : './src/controllers/*.ts'
    ],
};

const specs = swaggerJsdoc(options);

export function setupSwagger(app: Application) {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Salon & Spa API Documentation',
    }));
}
