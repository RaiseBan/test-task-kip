export const reserveSchema = {
    tags: ['bookings'],
    summary: 'Reserve a seat for an event',
    description: 'Creates a new booking for a user on a specific event',
    body: {
        type: 'object',
        required: ['event_id', 'user_id'],
        properties: {
            event_id: { type: 'integer', minimum: 1, description: 'Event ID' },
            user_id: { type: 'string', minLength: 1, maxLength: 255, description: 'User ID' },
        },
    },
    response: {
        201: {
            description: 'Booking created successfully',
            type: 'object',
            properties: {
                id: { type: 'integer' },
                event_id: { type: 'integer' },
                user_id: { type: 'string' },
                created_at: { type: 'string', format: 'date-time' },
            },
        },
        400: {
            description: 'Bad request',
            type: 'object',
            properties: {
                error: { type: 'string' },
            },
        },
    },
};

export const getBookingSchema = {
    tags: ['bookings'],
    summary: 'Get booking by ID',
    description: 'Returns booking details with event information',
    params: {
        type: 'object',
        properties: {
            id: { type: 'integer', minimum: 1, description: 'Booking ID' },
        },
        required: ['id'],
    },
    response: {
        200: {
            description: 'Booking found',
            type: 'object',
            properties: {
                id: { type: 'integer' },
                event_id: { type: 'integer' },
                user_id: { type: 'string' },
                created_at: { type: 'string', format: 'date-time' },
                event: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        name: { type: 'string' },
                        total_seats: { type: 'integer' },
                    },
                },
            },
        },
        404: {
            description: 'Booking not found',
            type: 'object',
            properties: {
                error: { type: 'string' },
            },
        },
    },
};

export const getEventSchema = {
    tags: ['events'],
    summary: 'Get event with available seats',
    description: 'Returns event details and number of available seats',
    params: {
        type: 'object',
        properties: {
            id: { type: 'integer', minimum: 1, description: 'Event ID' },
        },
        required: ['id'],
    },
    response: {
        200: {
            description: 'Event found',
            type: 'object',
            properties: {
                event: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        name: { type: 'string' },
                        total_seats: { type: 'integer' },
                    },
                },
                available_seats: { type: 'integer' },
            },
        },
        404: {
            description: 'Event not found',
            type: 'object',
            properties: {
                error: { type: 'string' },
            },
        },
    },
};

export const deleteBookingSchema = {
    tags: ['bookings'],
    summary: 'Delete booking',
    description: 'Cancels a booking and frees up the seat',
    params: {
        type: 'object',
        properties: {
            id: { type: 'integer', minimum: 1, description: 'Booking ID' },
        },
        required: ['id'],
    },
    response: {
        200: {
            description: 'Booking deleted successfully',
            type: 'object',
            properties: {
                message: { type: 'string' },
            },
        },
        404: {
            description: 'Booking not found',
            type: 'object',
            properties: {
                error: { type: 'string' },
            },
        },
    },
};