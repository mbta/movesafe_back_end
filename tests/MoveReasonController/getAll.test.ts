import { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import app from '../../src/app';
import MoveReason from '../../src/models/MoveReason';

jest.mock('../../src/auth/authorizationMiddleware', () => ({
    authorize: jest.fn((allowedRoles) => {
        return (req: Request, _: Response, next: NextFunction) => {
            req.headers.key_cloak_user_id = 'mockedUserId';
            req.headers.userGroups = allowedRoles;
            next();
        };
    }),
}));

jest.mock('../../src/models/MoveReason');

jest.mock('../../src/database', () => ({
    transaction: jest.fn().mockResolvedValue({
        commit: jest.fn(),
        rollback: jest.fn(),
    }),
}));

describe('GET /api/move-reasons', () => {
    it('should return all move reasons if not a satellite yard', async () => {
        const mockMoveReasons = [
            { id: '1', name: 'Reason 1', is_available_satellite_yards: true },
            { id: '2', name: 'Reason 2', is_available_satellite_yards: false },
        ];
        (MoveReason.findAll as jest.Mock).mockResolvedValue(mockMoveReasons);

        const response = await request(app).get('/api/move-reasons');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockMoveReasons);
    });

    it('should return move reasons filtered by satellite yard', async () => {
        const mockMoveReasons = [
            { id: 1, name: 'Reason 1' },
        ];

        (MoveReason.findAll as jest.Mock).mockResolvedValue(mockMoveReasons);

        const response = await request(app).get('/api/move-reasons?is_satellite_yard=true');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockMoveReasons);
        expect(MoveReason.findAll).toHaveBeenCalledWith({
            attributes: ['id', 'name'],
            where: {
                is_available_satellite_yards: true,
            },
        });
    });

    it('should return 500 if there is a server error', async () => {
        (MoveReason.findAll as jest.Mock).mockRejectedValue(new Error('server error'));

        const response = await request(app).get('/api/move-reasons');
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('message', 'internal server error');
    });
});
