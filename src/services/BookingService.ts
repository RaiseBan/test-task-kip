import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Booking } from '../entities/Booking';
import { Event } from '../entities/Event';
import { redisClient } from '../config/redis';

export class BookingService {
    private bookingRepository: Repository<Booking>;
    private eventRepository: Repository<Event>;

    constructor() {
        this.bookingRepository = AppDataSource.getRepository(Booking);
        this.eventRepository = AppDataSource.getRepository(Event);
    }

    async reserveSeat(eventId: number, userId: string): Promise<Booking> {
        return await AppDataSource.transaction(async (transactionalEntityManager) => {
            const event = await transactionalEntityManager.findOne(Event, {
                where: { id: eventId },
                lock: { mode: 'pessimistic_write' },
            });

            if (!event) {
                throw new Error('Событие не найдено');
            }

            const existingBooking = await transactionalEntityManager.findOne(Booking, {
                where: { eventId, userId },
            });

            if (existingBooking) {
                throw new Error('Вы уже забронировали место на это событие');
            }

            const bookedSeats = await transactionalEntityManager.count(Booking, {
                where: { eventId },
            });

            if (bookedSeats >= event.totalSeats) {
                throw new Error('Все места забронированы');
            }

            const booking = this.bookingRepository.create({
                eventId,
                userId,
            });

            const savedBooking = await transactionalEntityManager.save(booking);

            await redisClient.del(`event:${eventId}:available_seats`);

            return savedBooking;
        });
    }

    async getBooking(id: number): Promise<Booking | null> {
        return this.bookingRepository.findOne({
            where: { id },
            relations: ['event'],
        });
    }

    async getEventWithAvailableSeats(eventId: number): Promise<{ event: Event; availableSeats: number } | null> {
        const cacheKey = `event:${eventId}:available_seats`;
        const cached = await redisClient.get(cacheKey);

        if (cached) {
            return JSON.parse(cached);
        }

        const event = await this.eventRepository.findOne({
            where: { id: eventId },
        });

        if (!event) {
            return null;
        }

        const bookedSeats = await this.bookingRepository.count({
            where: { eventId },
        });

        const result = {
            event,
            availableSeats: event.totalSeats - bookedSeats,
        };

        await redisClient.setEx(cacheKey, 60, JSON.stringify(result));

        return result;
    }

    async deleteBooking(id: number): Promise<boolean> {
        const booking = await this.bookingRepository.findOne({ where: { id } });

        if (!booking) {
            return false;
        }

        await this.bookingRepository.remove(booking);
        await redisClient.del(`event:${booking.eventId}:available_seats`);

        return true;
    }
}