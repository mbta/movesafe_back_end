import { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import app from '../../src/app';
import Move from '../../src/models/Move';
import AuditLog from '../../src/models/AuditLog';
import { User } from '../../src/models';

jest.mock('../../src/auth/authorizationMiddleware', () => ({
    authorize: jest.fn((allowedRoles) => {
        return (req: Request, _: Response, next: NextFunction) => {
            req.headers.key_cloak_user_id = 'mockedUserId';
            req.headers.userGroups = allowedRoles;
            next();
        };
    }),
}));

import { AuditLogActions } from '../../src/enum/audit_log_actions.enum';

jest.mock('../../src/models/Move');
jest.mock('../../src/models/AuditLog');
jest.mock('../../src/models/User');

const commit = jest.fn();
const rollback = jest.fn();

jest.mock('../../src/database', () => ({
    transaction: jest.fn().mockResolvedValue({
        commit: () => commit(),
        rollback: () => rollback(),
    }),
}));

describe('POST /api/release-move', () => {
    beforeEach(() => {
        const user = { id: '1', key_cloak_id: 1 };
        (User.findOne as jest.Mock).mockResolvedValue(user);
    });

    it('should return 400 if parameters are missing', async () => {
        const response = await request(app).post('/api/release-move').query({});
        expect(rollback).toHaveBeenCalled();
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message', 'All parameters should be provided in the right format');
    });

    it('should return 400 if move is not found', async () => {
        (Move.findByPk as jest.Mock).mockResolvedValue(null);
        const response = await request(app).post('/api/release-move').query({ move_id: '1' });
        expect(rollback).toHaveBeenCalled();
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message', 'Could not find move with given id');
    });

    it('should release the move successfully', async () => {
        const move: Partial<Move> = { id: '1', status: 'pending_move', save: jest.fn().mockResolvedValue({ id: '1' }) };
        (Move.findByPk as jest.Mock).mockResolvedValue(move);

        const response = await request(app).post('/api/release-move').query({ move_id: '1' });
        expect(AuditLog.create).toHaveBeenCalledWith({
            move_id: '1',
            user_id: "1",
            action: AuditLogActions.unassigned_move
        }, { transaction: expect.anything() });
        expect(move.move_done_by_user_id).toBe(null);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id', '1');
    });

    it('should return 500 if there is a server error', async () => {
        (Move.findByPk as jest.Mock).mockRejectedValue(new Error('server error'));

        const response = await request(app).post('/api/release-move').query({ move_id: '1' });
        expect(rollback).toHaveBeenCalled();
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('message', 'internal server error');
    });
});
