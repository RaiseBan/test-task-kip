import { FastifyInstance } from 'fastify';
import { BookingService } from '../services/BookingService';
import {deleteBookingSchema, getBookingSchema, getEventSchema, reserveSchema} from "../schemas/booking.schemas";

const bookingService = new BookingService();


export default async function bookingRoutes(fastify: FastifyInstance) {
    fastify.post('/api/bookings/reserve', { schema: reserveSchema }, async (request, reply) => {
        try {
            const { event_id, user_id } = request.body as { event_id: number; user_id: string };
            const booking = await bookingService.reserveSeat(event_id, user_id);

            return reply.status(201).send({
                id: booking.id,
                event_id: booking.eventId,
                user_id: booking.userId,
                created_at: booking.createdAt,
            });
        } catch (error: any) {
            return reply.status(400).send({ error: error.message });
        }
    });

    fastify.get('/api/bookings/:id', { schema: getBookingSchema }, async (request, reply) => {
        try {
            const { id } = request.params as { id: number };
            const booking = await bookingService.getBooking(id);

            if (!booking) {
                return reply.status(404).send({ error: 'Бронирование не найдено' });
            }

            return reply.send({
                id: booking.id,
                event_id: booking.eventId,
                user_id: booking.userId,
                created_at: booking.createdAt,
                event: {
                    id: booking.event.id,
                    name: booking.event.name,
                    total_seats: booking.event.totalSeats,
                },
            });
        } catch (error: any) {
            return reply.status(400).send({ error: error.message });
        }
    });

    fastify.get('/api/events/:id', { schema: getEventSchema }, async (request, reply) => {
        try {
            const { id } = request.params as { id: number };
            const result = await bookingService.getEventWithAvailableSeats(id);

            if (!result) {
                return reply.status(404).send({ error: 'Событие не найдено' });
            }

            return reply.send({
                event: {
                    id: result.event.id,
                    name: result.event.name,
                    total_seats: result.event.totalSeats,
                },
                available_seats: result.availableSeats,
            });
        } catch (error: any) {
            return reply.status(400).send({ error: error.message });
        }
    });

    fastify.delete('/api/bookings/:id', { schema: deleteBookingSchema }, async (request, reply) => {
        try {
            const { id } = request.params as { id: number };
            const deleted = await bookingService.deleteBooking(id);

            if (!deleted) {
                return reply.status(404).send({ error: 'Бронирование не найдено' });
            }

            return reply.send({ message: 'Бронирование успешно удалено' });
        } catch (error: any) {
            return reply.status(400).send({ error: error.message });
        }
    });
}