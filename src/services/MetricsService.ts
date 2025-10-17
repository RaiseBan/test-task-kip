import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Booking } from '../entities/Booking';

export class MetricsService {
    private bookingRepository: Repository<Booking>;

    constructor() {
        this.bookingRepository = AppDataSource.getRepository(Booking);
    }

    async getBookingsCountByUserId(userId: string): Promise<number> {

        return await this.bookingRepository.count({
            where: { userId }
        });

    }


}