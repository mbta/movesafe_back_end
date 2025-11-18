import { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import app from '../../src/app';
import Move from '../../src/models/Move';
import User from '../../src/models/User';

jest.mock('../../src/auth/authorizationMiddleware', () => ({
    authorize: jest.fn((allowedRoles) => {
        return (req: Request, _: Response, next: NextFunction) => {
            req.headers.key_cloak_user_id = 'mockedUserId';
            req.headers.userGroups = allowedRoles;
            next();
        };
    }),
}));

jest.mock('../../src/models/Move');
jest.mock('../../src/models/User');

jest.mock('../../src/database', () => ({
    transaction: jest.fn().mockResolvedValue({
        commit: jest.fn(),
        rollback: jest.fn(),
    }),
}));

describe('GET /api/pending-moves', () => {
    beforeEach(() => {
        const user = { id: '1', key_cloak_id: 1 };
        (User.findOne as jest.Mock).mockResolvedValue(user);
    });

    it('should return all unassigned moves', async () => {
        (Move.findAndCountAll as jest.Mock).mockResolvedValue({ rows: [{ id: '1' }, { id: '2' }], count: 2 });

        const response = await request(app).get('/api/pending-moves').query({ yard_id: '1' });
        expect(response.status).toBe(200);
        expect(response.body.data).toHaveLength(2);
        expect(response.body.pageCount).toBe(1);
    });

    it('should return 500 if there is a server error', async () => {
        (Move.findAndCountAll as jest.Mock).mockRejectedValue(new Error('server error'));

        const response = await request(app).get('/api/pending-moves').query({ yard_id: '1' });
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('message', 'internal server error');
    });
});
