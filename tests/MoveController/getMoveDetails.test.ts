import { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import app from '../../src/app';
import Move from '../../src/models/Move';
import InspectionAnswer from '../../src/models/InspectionAnswer';
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
jest.mock('../../src/models/InspectionAnswer');
jest.mock('../../src/models/User');

jest.mock('../../src/database', () => ({
    transaction: jest.fn().mockResolvedValue({
        commit: jest.fn(),
        rollback: jest.fn(),
    }),
}));


describe('GET /moveDetails', () => {
    beforeEach(() => {
        const user = { id: '1', key_cloak_id: 1 };
        (User.findOne as jest.Mock).mockResolvedValue(user);
    });

    it('should return 400 if move_id is not provided', async () => {
        const res = await request(app).get('/api/move-details');
        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: "All parameters should be provided in the right format" });
    });

    it('should return 400 if move is not found', async () => {
        (Move.findByPk as jest.Mock).mockResolvedValue(null);

        const res = await request(app).get('/api/move-details').query({ move_id: 'some-id' });

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: "Could not find move with provided id" });
    });

    it('should return 200 with move details if move is found', async () => {
        const mockMove = {
            id: 'some-id',
            inspections: [{ id: 'inspection-id' }],
            toJSON: jest.fn().mockReturnValue({ id: 'some-id' }),
        };

        (Move.findByPk as jest.Mock).mockResolvedValue(mockMove);
        (InspectionAnswer.findAll as jest.Mock).mockResolvedValue([]);

        const res = await request(app).get('/api/move-details').query({ move_id: 'some-id' });

        expect(res.status).toBe(200);
        expect(res.body).toEqual(expect.objectContaining({ id: 'some-id' }));
    });

    it('should handle internal server errors', async () => {
        (Move.findByPk as jest.Mock).mockRejectedValue(new Error('Internal Server Error'));

        const res = await request(app).get('/api/move-details').query({ move_id: 'some-id' });

        expect(res.status).toBe(500);
        expect(res.body).toEqual({ message: "internal server error", error: expect.anything() });
    });
});
