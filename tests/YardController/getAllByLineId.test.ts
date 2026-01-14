import { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import app from '../../src/app';
import Yard from '../../src/models/Yard';

jest.mock('../../src/auth/authorizationMiddleware', () => ({
    authorize: jest.fn((allowedRoles) => {
        return (req: Request, _: Response, next: NextFunction) => {
            req.headers.key_cloak_user_id = 'mockedUserId';
            req.headers.userGroups = allowedRoles;
            next();
        };
    }),
}));

jest.mock('../../src/models/Yard');

jest.mock('../../src/database', () => ({
    transaction: jest.fn().mockResolvedValue({
        commit: jest.fn(),
        rollback: jest.fn(),
    }),
}));

describe('GET /api/yards', () => {
    it('should return 400 if line_id is missing', async () => {
        const response = await request(app).get('/api/yards');
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message', 'Missing line_id query parameter');
    });

    it('should return an empty array if no yards are found for the given line_id', async () => {
        (Yard.findAll as jest.Mock).mockResolvedValue([]);
        const response = await request(app).get('/api/yards').query({ line_id: '1' });
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    });

    it('should return a list of yards for the given line_id', async () => {
        const mockYards = [
            { id: '1', name: 'Yard 1', is_main_yard: true, line_id: '1' },
            { id: '2', name: 'Yard 2', is_main_yard: false, line_id: '1' },
        ];
        (Yard.findAll as jest.Mock).mockResolvedValue(mockYards);
        const response = await request(app).get('/api/yards').query({ line_id: '1' });
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockYards);
    });

    it('should return 500 if there is a server error', async () => {
        (Yard.findAll as jest.Mock).mockRejectedValue(new Error('server error'));
        const response = await request(app).get('/api/yards').query({ line_id: '1' });
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('message', 'internal server error');
    });
});
