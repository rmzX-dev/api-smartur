import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import dotenv from 'dotenv'

dotenv.config()

const PORT = process.env.PORT || 3000

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API SMARTUR',
            version: '1.0.0',
            description: 'Documentación de la API REST para SMARTUR - Sistema de Gestión Turística',
            contact: {
                name: 'SMARTUR API Support',
            },
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
                description: 'Servidor de desarrollo',
            },
            {
                url: 'https://api-smartur.com',
                description: 'Servidor de producción',
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
                User: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'ID del usuario',
                        },
                        name: {
                            type: 'string',
                            description: 'Nombre del usuario',
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'Correo electrónico del usuario',
                        },
                        role_id: {
                            type: 'integer',
                            description: 'ID del rol (1: Admin, 2: Usuario)',
                        },
                        registered_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Fecha de registro',
                        },
                    },
                },
                Admin: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'ID del administrador',
                        },
                        name: {
                            type: 'string',
                            description: 'Nombre del administrador',
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'Correo electrónico del administrador',
                        },
                        role_id: {
                            type: 'integer',
                            description: 'ID del rol (1: Admin)',
                        },
                        registered_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Fecha de registro',
                        },
                    },
                },
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'Correo electrónico',
                        },
                        password: {
                            type: 'string',
                            format: 'password',
                            description: 'Contraseña',
                        },
                    },
                },
                RegisterRequest: {
                    type: 'object',
                    required: ['name', 'email', 'password'],
                    properties: {
                        name: {
                            type: 'string',
                            description: 'Nombre completo',
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'Correo electrónico',
                        },
                        password: {
                            type: 'string',
                            format: 'password',
                            description: 'Contraseña',
                        },
                        role_id: {
                            type: 'integer',
                            description: 'ID del rol (opcional)',
                        },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            description: 'Mensaje de error',
                        },
                        error: {
                            type: 'string',
                            description: 'Detalle del error',
                        },
                    },
                },
                Success: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            description: 'Mensaje de éxito',
                        },
                    },
                },
            },
        },
        tags: [
            {
                name: 'Autenticación',
                description: 'Endpoints de autenticación y gestión de sesión',
            },
            {
                name: 'Usuarios',
                description: 'Gestión de usuarios',
            },
            {
                name: 'Administradores',
                description: 'Gestión de administradores',
            },
            {
                name: 'Servicios',
                description: 'Gestión de servicios turísticos',
            },
            {
                name: 'Empresas',
                description: 'Gestión de empresas',
            },
            {
                name: 'Actividades Turísticas',
                description: 'Gestión de actividades turísticas',
            },
            {
                name: 'Plantillas de Evaluación',
                description: 'Gestión de plantillas de evaluación',
            },
            {
                name: 'Perfiles de Viajero',
                description: 'Gestión de perfiles de viajero',
            },
            {
                name: 'Ubicaciones',
                description: 'Gestión de ubicaciones',
            },
            {
                name: 'Criterios',
                description: 'Gestión de criterios de evaluación',
            },
            {
                name: 'Servicios Turísticos',
                description: 'Gestión de servicios turísticos',
            },
            {
                name: 'Evaluaciones de Servicio',
                description: 'Gestión de evaluaciones de servicio',
            },
            {
                name: 'Detalles de Evaluación',
                description: 'Gestión de detalles de evaluación',
            },
            {
                name: 'Certificaciones de Servicio',
                description: 'Gestión de certificaciones de servicio',
            },
            {
                name: 'Puntos de Interés',
                description: 'Gestión de puntos de interés',
            },
            {
                name: 'Gastos Turísticos',
                description: 'Gestión de gastos turísticos',
            },
            {
                name: 'Empleo Turístico',
                description: 'Gestión de empleo turístico',
            },
            {
                name: 'Insumos Turísticos',
                description: 'Gestión de insumos turísticos',
            },
        ],
    },
    apis: ['./routes/*.js', './controllers/*.js'],
}

const swaggerSpec = swaggerJsdoc(options)

export { swaggerSpec, swaggerUi }

