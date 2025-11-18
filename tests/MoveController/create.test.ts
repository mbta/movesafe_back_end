import { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import app from '../../src/app';
import Yard from '../../src/models/Yard';
import MoveReason from '../../src/models/MoveReason';
import Move from '../../src/models/Move';
import AuditLog from '../../src/models/AuditLog';
import User from '../../src/models/User';
import { AuditLogActions } from '../../src/enum/audit_log_actions.enum';

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
jest.mock('../../src/models/MoveReason');
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

describe('POST /move', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        const user = { id: '1', key_cloak_id: 1 };
        (User.findOne as jest.Mock).mockResolvedValue(user);
    });

    it('should return 400 if parameters are missing', async () => {
        const response = await request(app).post('/api/move').send({});
        expect(rollback).toHaveBeenCalled();
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message', 'All parameters should be provided in the right format');
    });

    it('should return 400 if yard is not found', async () => {
        (Yard.findByPk as jest.Mock).mockResolvedValue(null);
        const response = await request(app).post('/api/move').send(
            { yard_id: '1', move_reason_id: '1', yardmaster_user_id: '1', due_date: new Date(), priority_order: 1, move_from: 'A', move_to: 'B', move_cars: [] }
        );
        expect(rollback).toHaveBeenCalled();
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message', 'Could not find yard with given id');
    });

    it('should return 400 if move reason is not found', async () => {
        (Yard.findByPk as jest.Mock).mockResolvedValue({ id: '1', line: { is_light_rail: true } });
        (MoveReason.findByPk as jest.Mock).mockResolvedValue(null);
        const response = await request(app).post('/api/move').send(
            { yard_id: '1', move_reason_id: '1', yardmaster_user_id: '1', due_date: new Date(), priority_order: 1, move_from: 'A', move_to: 'B', move_cars: [] }
        );
        expect(rollback).toHaveBeenCalled();
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message', 'Could not find move reason with given id');
    });

    it('should create a move successfully', async () => {
        (Yard.findByPk as jest.Mock).mockResolvedValue({ id: '1', line: { is_light_rail: true } });
        (MoveReason.findByPk as jest.Mock).mockResolvedValue({ id: '1', inspection_forms: [] });
        (Move.create as jest.Mock).mockResolvedValue({ id: '1' });

        const response = await request(app).post('/api/move').send(
            { yard_id: '1', move_reason_id: '1', yardmaster_user_id: '1', due_date: new Date(), priority_order: 1, move_from: 'A', move_to: 'B', move_cars: [] }
        );
        expect(AuditLog.create).toHaveBeenCalledWith({
            move_id: '1',
            user_id: '1',
            action: AuditLogActions.created_move
        }, { transaction: expect.anything() });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id', '1');
    });

    it('should return 500 if there is a server error', async () => {
        (Yard.findByPk as jest.Mock).mockRejectedValue(new Error('server error'));

        const response = await request(app).post('/api/move').send(
            { yard_id: '1', move_reason_id: '1', yardmaster_user_id: '1', due_date: new Date(), priority_order: 1, move_from: 'A', move_to: 'B', move_cars: [] }
        );
        expect(rollback).toHaveBeenCalled();
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('message', 'internal server error');
    });
});
