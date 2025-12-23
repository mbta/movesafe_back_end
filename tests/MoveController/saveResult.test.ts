import { NextFunction, Request, Response } from "express";
import request from "supertest";
import app from "../../src/app";
import { User } from "../../src/models";
import InspectionAnswer from "../../src/models/InspectionAnswer";
import Move from "../../src/models/Move";

jest.mock("../../src/auth/authorizationMiddleware", () => ({
  authorize: jest.fn((allowedRoles) => {
    return (req: Request, _: Response, next: NextFunction) => {
      req.headers.key_cloak_user_id = "mockedUserId";
      req.headers.userGroups = allowedRoles;
      next();
    };
  }),
}));

import { MoveStatus } from "../../src/enum/move-status.enum";

jest.mock("../../src/models/Move");
jest.mock("../../src/models/InspectionAnswer");
jest.mock("../../src/models/AuditLog");
jest.mock("../../src/models/User");

const commit = jest.fn();
const rollback = jest.fn();

jest.mock("../../src/database", () => ({
  transaction: jest.fn().mockResolvedValue({
    commit: () => commit(),
    rollback: () => rollback(),
  }),
}));

describe("POST /api/move-result", () => {
  beforeEach(() => {
    const user = { id: "1", key_cloak_id: 1 };
    (User.findOne as jest.Mock).mockResolvedValue(user);
  });

  it("should return 400 if inspections or move_id are missing", async () => {
    const response = await request(app).post("/api/move-result").send({});
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("All parameters should be provided");
    expect(rollback).toHaveBeenCalled();
  });

  it("should return 400 if move is not found", async () => {
    (Move.findByPk as jest.Mock).mockResolvedValue(null);

    const response = await request(app).post("/api/move-result").send({
      answers: [],
      move_id: "nonexistent-id",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Could not find move with given id");
    expect(rollback).toHaveBeenCalled();
  });

  it("should return 400 if move status is not pending_checklist", async () => {
    const moveMock = { id: "1", status: "not_pending_checklist" } as Move;
    (Move.findByPk as jest.Mock).mockResolvedValue(moveMock);

    const response = await request(app).post("/api/move-result").send({
      answers: [],
      move_id: "1",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Move can not be updated");
    expect(rollback).toHaveBeenCalled();
  });

  it("should save inspection answers and update move status", async () => {
    let moveMock = {
      id: "1",
      status: MoveStatus.pending_checklist,
      save: jest.fn(),
    } as unknown as Move;
    (Move.findByPk as jest.Mock).mockResolvedValue(moveMock);

    const inspectionAnswersMock = {
      save: jest.fn(),
    } as unknown as InspectionAnswer;
    (InspectionAnswer.build as jest.Mock).mockReturnValue(
      inspectionAnswersMock
    );

    const buildSpy = jest.spyOn(InspectionAnswer, "build");

    const response = await request(app)
      .post("/api/move-result")
      .send({
        answers: [
          {
            inspection_id: "inspection-id",
            inspection_form_question_id: "question-id",
            has_minor_defect: false,
            has_major_defect: false,
            car_id: "car-id",
            comments: "No defects",
          },
        ],
        move_id: "1",
      });

    expect(buildSpy).toHaveBeenCalledWith({
      inspection_id: "inspection-id",
      inspection_form_question_id: "question-id",
      has_minor_defect: false,
      has_major_defect: false,
      is_guardside: false,
      car_id: "car-id",
      comments: "No defects",
    });
  });

  it("should return 500 on internal server error", async () => {
    (Move.findByPk as jest.Mock).mockRejectedValue(new Error("server error"));

    const response = await request(app).post("/api/move-result").send({
      answers: [],
      move_id: "1",
    });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("internal server error");
    expect(rollback).toHaveBeenCalled();
  });
});
