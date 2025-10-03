import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index, Unique } from 'typeorm';
import { Event } from './Event';

@Entity('bookings')
@Unique(['eventId', 'userId'])
@Index(['eventId'])
@Index(['userId'])
export class Booking {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', name: 'event_id' })
    eventId: number;

    @Column({ type: 'varchar', length: 255, name: 'user_id' })
    userId: string;

    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    createdAt: Date;

    @ManyToOne(() => Event, (event) => event.bookings)
    @JoinColumn({ name: 'event_id' })
    event: Event;
}