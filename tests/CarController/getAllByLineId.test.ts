import { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import app from '../../src/app';
import Car from '../../src/models/Car';

jest.mock('../../src/auth/authorizationMiddleware', () => ({
    authorize: jest.fn((allowedRoles) => {
        return (req: Request, _: Response, next: NextFunction) => {
            req.headers.key_cloak_user_id = 'mockedUserId';
            req.headers.userGroups = allowedRoles;
            next();
        };
    }),
}));

jest.mock('../../src/models/Car');

jest.mock('../../src/database', () => ({
    transaction: jest.fn().mockResolvedValue({
        commit: jest.fn(),
        rollback: jest.fn(),
    }),
}));

describe('GET /api/cars', () => {
    it('should return 400 if line_id is missing', async () => {
        const response = await request(app).get('/api/cars');
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message', 'Missing line_id query parameter');
    });

    it('should return a list of active cars for the given line_id', async () => {
        const mockCars = [
            { id: '1', series_number: '1001', line_id: '1', is_active: true },
            { id: '2', series_number: '1002', line_id: '1', is_active: true },
        ];
        (Car.findAll as jest.Mock).mockResolvedValue(mockCars);
        const response = await request(app).get('/api/cars').query({ line_id: '1' });
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockCars);
    });

    it('should return 500 if there is a server error', async () => {
        (Car.findAll as jest.Mock).mockRejectedValue(new Error('server error'));
        const response = await request(app).get('/api/cars').query({ line_id: '1' });
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('message', 'internal server error');
    });
});
