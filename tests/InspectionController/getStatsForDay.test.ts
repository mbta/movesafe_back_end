import { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import app from '../../src/app';
import { Inspection } from '../../src/models';

jest.mock('../../src/auth/authorizationMiddleware', () => ({
    authorize: jest.fn((allowedRoles) => {
        return (req: Request, _: Response, next: NextFunction) => {
            req.headers.key_cloak_user_id = 'mockedUserId';
            req.headers.userGroups = allowedRoles;
            next();
        };
    }),
}));

jest.mock('../../src/models/Inspection');
jest.mock('../../src/models/InspectionForm');

jest.mock('../../src/database', () => ({
    transaction: jest.fn().mockResolvedValue({
        commit: jest.fn(),
        rollback: jest.fn(),
    }),
}));

describe('getStatsForDay', () => {
    it('should return 400 if date is not provided', async () => {
        const res = await request(app).get('/api/inspection-stats-for-day');
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('All parameters should be provided in the right format');
    });

    it('should return the correct stats for the given date', async () => {
        const mockInspections = [
            {
                inspection_form: { name: 'Exterior Vehicle Inspection', is_light_rail: true },
                move: { status: 'waiting' }
            },
            {
                inspection_form: { name: 'Pre Trip Inspection', is_light_rail: true },
                move: { status: 'done' }
            },
            {
                inspection_form: { name: 'Car House Circle Checklist', is_light_rail: false },
                move: { status: 'waiting' }
            },
            {
                inspection_form: { name: 'Safety Inspection', is_light_rail: false },
                move: { status: 'pending_move' }
            },
        ];

        (Inspection.findAll as jest.Mock).mockResolvedValue(mockInspections);

        const res = await request(app).get('/api/inspection-stats-for-day').query({ date_from: '2024-01-01', date_to: '2024-01-02' });

        expect(res.status).toBe(200);
        expect(res.body.totalInspections).toBe(4);
        expect(res.body.totalLightRailInspections).toBe(2);
        expect(res.body.totalHeavyInspections).toBe(2);
        expect(res.body.totalEviInspectionsForLightRail).toBe(1);
        expect(res.body.totalEviInspectionsForHeavyRail).toBe(0);
        expect(res.body.totalPreTripInspectionsForLightRail).toBe(1);
        expect(res.body.totalPreTripInspectionsForHeavyRail).toBe(0);
        expect(res.body.totalCarHouseInspectionsForLightRail).toBe(0);
        expect(res.body.totalCarHouseInspectionsForHeavyRail).toBe(1);
        expect(res.body.totalSafetyInspectionsForLightRail).toBe(0);
        expect(res.body.totalSafetyInspectionsForHeavyRail).toBe(1);
        expect(res.body.concludedLightRailInspections).toBe(1);
        expect(res.body.concludedHeavyRailInspections).toBe(1);
    });

    it('should return 500 if there is a server error', async () => {
        (Inspection.findAll as jest.Mock).mockRejectedValue(new Error('Database error'));

        const res = await request(app).get('/api/inspection-stats-for-day').query({ date_from: '2024-01-01', date_to: '2024-01-02' });

        expect(res.status).toBe(500);
        expect(res.body.message).toBe('internal server error');
        expect(res.body.error).toBeDefined();
    });
});
