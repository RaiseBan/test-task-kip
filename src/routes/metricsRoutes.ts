import { FastifyInstance } from 'fastify';
import { MetricsService } from '../services/MetricsService'
import {metricsBookingByUser} from "../schemas/metrics.shemas";

export default async function metricsRoutes(fastify: FastifyInstance) {
    const metricsService = new MetricsService();

    fastify.get('/metrics/:id', { schema: metricsBookingByUser }, async (request, reply) => {
        try {
            const { id } = request.params as { id: string };

            const count = await metricsService.getBookingsCountByUserId(id);

            return reply.status(200).send({ count });
        } catch (error: any) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: 'Failed to fetch booking statistics'
            });
        }
    });
}