import { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import app from '../../src/app';
import InspectionForm from '../../src/models/InspectionForm';

jest.mock('../../src/auth/authorizationMiddleware', () => ({
    authorize: jest.fn((allowedRoles) => {
        return (req: Request, _: Response, next: NextFunction) => {
            req.headers.key_cloak_user_id = 'mockedUserId';
            req.headers.userGroups = allowedRoles;
            next();
        };
    }),
}));

jest.mock('../../src/models/InspectionForm');
jest.mock('../../src/models/InspectionFormSection');
jest.mock('../../src/models/InspectionFormQuestion');

jest.mock('../../src/database', () => ({
    transaction: jest.fn().mockResolvedValue({
        commit: jest.fn(),
        rollback: jest.fn(),
    }),
}));

describe('GET /api/inspection-forms', () => {
    it('should return a list of inspection forms with sections and questions', async () => {
        const mockInspectionForms = [
            {
                id: '1',
                name: 'Form 1',
                has_comments: true,
                inspection_form_sections: [
                    {
                        name: 'Section 1',
                        inspection_form_questions: [
                            { id: '1', description: 'Question 1', question_type: 'type1', has_comments: true },
                            { id: '2', description: 'Question 2', question_type: 'type2', has_comments: false },
                        ],
                    },
                    {
                        name: 'Section 2',
                        inspection_form_questions: [
                            { id: '3', description: 'Question 3', question_type: 'type3', has_comments: true },
                        ],
                    },
                ],
            },
            {
                id: '2',
                name: 'Form 2',
                has_comments: false,
                inspection_form_sections: [
                    {
                        name: 'Section 1',
                        inspection_form_questions: [
                            { id: '4', description: 'Question 4', question_type: 'type4', has_comments: true },
                        ],
                    },
                ],
            },
        ];
        (InspectionForm.findAll as jest.Mock).mockResolvedValue(mockInspectionForms);

        const response = await request(app).get('/api/inspection-forms');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockInspectionForms);
    });

    it('should return 500 if there is a server error', async () => {
        (InspectionForm.findAll as jest.Mock).mockRejectedValue(new Error('server error'));

        const response = await request(app).get('/api/inspection-forms');
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('message', 'internal server error');
    });
});
