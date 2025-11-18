import { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import app from '../../src/app';
import Line from '../../src/models/Line';

jest.mock('../../src/auth/authorizationMiddleware', () => ({
    authorize: jest.fn((allowedRoles) => {
        return (req: Request, _: Response, next: NextFunction) => {
            req.headers.key_cloak_user_id = 'mockedUserId';
            req.headers.userGroups = allowedRoles;
            next();
        };
    }),
}));

jest.mock('../../src/models/Line');

jest.mock('../../src/database', () => ({
    transaction: jest.fn().mockResolvedValue({
        commit: jest.fn(),
        rollback: jest.fn(),
    }),
}));

describe('GET /api/lines', () => {
    it('should return a list of lines', async () => {
        const mockLines = [
            { id: '1', name: 'Line 1', is_light_rail: true },
            { id: '2', name: 'Line 2', is_light_rail: false },
        ];
        (Line.findAll as jest.Mock).mockResolvedValue(mockLines);

        const response = await request(app).get('/api/lines');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockLines);
    });

    it('should return 500 if there is a server error', async () => {
        (Line.findAll as jest.Mock).mockRejectedValue(new Error('server error'));

        const response = await request(app).get('/api/lines');
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('message', 'internal server error');
    });
});
