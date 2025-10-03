import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import * as dotenv from 'dotenv';
import { AppDataSource } from './config/database';
import { connectRedis } from './config/redis';
import bookingRoutes from './routes/bookingRoutes';

dotenv.config();

const PORT = parseInt(process.env.PORT || '3000');
const HOST = '0.0.0.0';

const fastify = Fastify({
    logger: {
        transport: {
            target: 'pino-pretty',
            options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
            },
        },
    },
});

async function start() {
    try {
        await fastify.register(cors);

        await fastify.register(rateLimit, {
            max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
            timeWindow: parseInt(process.env.RATE_LIMIT_TIME_WINDOW || '60000'),
        });

        await fastify.register(swagger, {
            openapi: {
                info: {
                    title: 'Booking API',
                    description: 'Event booking system API documentation',
                    version: '1.0.0',
                },
                servers: [
                    {
                        url: `http://localhost:${PORT}`,
                        description: 'Development server',
                    },
                ],
                tags: [
                    { name: 'bookings', description: 'Booking related endpoints' },
                    { name: 'events', description: 'Event related endpoints' },
                ],
            },
        });

        await fastify.register(swaggerUI, {
            routePrefix: '/docs',
            uiConfig: {
                docExpansion: 'list',
                deepLinking: false,
            },
            staticCSP: true,
        });

        await AppDataSource.initialize();
        fastify.log.info('Database connected successfully');

        await connectRedis();
        fastify.log.info('Redis connected successfully');

        await fastify.register(bookingRoutes);

        fastify.get('/health', {
            schema: {
                tags: ['default'],
                summary: 'Health check',
                description: 'Check if the service is running',
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            status: { type: 'string' },
                            timestamp: { type: 'string', format: 'date-time' },
                        },
                    },
                },
            }
        }, async (request, reply) => {
            return { status: 'ok', timestamp: new Date().toISOString() };
        });

        await fastify.listen({ port: PORT, host: HOST });
        fastify.log.info(`Server is running on http://localhost:${PORT}`);
        fastify.log.info(`API Documentation available at http://localhost:${PORT}/docs`);
    } catch (error) {
        fastify.log.error(error);
        process.exit(1);
    }
}

const shutdown = async () => {
    try {
        fastify.log.info('Shutting down gracefully...');
        await fastify.close();
        await AppDataSource.destroy();
        process.exit(0);
    } catch (error) {
        fastify.log.error('Error during shutdown');
        process.exit(1);
    }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start();