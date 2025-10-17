export const metricsBookingByUser = {
    tags: ['metrics'],
    summary: 'Get user booking statistics',
    description: 'Returns the total number of bookings made by a specific user',
    params: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                description: 'User ID',
            },
        },
        required: ['id'],
    },
    response: {
        200: {
            description: 'success retrieved booking statistics',
            type: 'object',
            properties: {
                count: { type: 'integer' },
            },
        }
    },

};
