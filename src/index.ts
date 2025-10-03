import Fastify from 'fastify';
import cors from '@fastify/cors';
import * as dotenv from 'dotenv';
import { AppDataSource } from './config/database';
import { connectRedis } from './config/redis';

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


        await AppDataSource.initialize();
        fastify.log.info('Database connected successfully');

        await connectRedis();
        fastify.log.info('Redis connected successfully');


        fastify.get('/health', async (request, reply) => {
            return { status: 'ok', timestamp: new Date().toISOString() };
        });

        await fastify.listen({ port: PORT, host: HOST });
        fastify.log.info(`Server is running on http://localhost:${PORT}`);
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