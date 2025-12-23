import { NextFunction, Request, Response } from "express";
import request from "supertest";
import app from "../../src/app";
import { AuditLogActions } from "../../src/enum/audit_log_actions.enum";
import { MoveStatus } from "../../src/enum/move-status.enum";
import { SignatureTypes } from "../../src/enum/signature-types.enum";
import AuditLog from "../../src/models/AuditLog";
import Move from "../../src/models/Move";
import Signature from "../../src/models/Signature";
import User from "../../src/models/User";
import * as s3Client from "../../src/utils/s3Client";

jest.mock("../../src/auth/authorizationMiddleware", () => ({
  authorize: jest.fn((allowedRoles) => {
    return (req: Request, _: Response, next: NextFunction) => {
      req.headers.key_cloak_user_id = "mockedUserId";
      req.headers.userGroups = allowedRoles;
      next();
    };
  }),
}));

jest.mock("../../src/utils/s3Client");
jest.mock("../../src/models/Move");
jest.mock("../../src/models/Signature");
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

describe("POST /api/signature", () => {
  beforeEach(() => {
    const user = { id: "1", key_cloak_id: 1 };
    (User.findOne as jest.Mock).mockResolvedValue(user);
  });

  it("should return 400 if any required parameter is missing", async () => {
    const res = await request(app)
      .post("/api/signature")
      .send({ caption: "Test Caption" });

    expect(rollback).toHaveBeenCalled();
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: "All parameters should be provided" });
  });

  it("should return 400 if trying to save yardmaster signature before move is done", async () => {
    const move = {
      status: MoveStatus.pending_move,
      inspections: [],
      signatures: [],
      save: jest.fn(),
    };

    (Move.findByPk as jest.Mock).mockResolvedValue(move);

    const res = await request(app)
      .post("/api/signature")
      .field("caption", "Test Caption")
      .field("move_id", "1")
      .field("user_id", "1")
      .field("signature_type", SignatureTypes.yardmaster)
      .attach("file", Buffer.from("test"), "test.png");

    expect(rollback).toHaveBeenCalled();
    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      message:
        "Can not save yardmaster signature before move done or inspection failed",
    });
  });

  it("should save the signature and return 200 with signature object", async () => {
    const move = {
      status: MoveStatus.pending_yardmaster_signature,
      inspections: [],
      signatures: [],
      save: jest.fn(),
    };

    (Move.findByPk as jest.Mock).mockResolvedValue(move);

    const file = {
      buffer: Buffer.from("test"),
      mimetype: "image/png",
    };

    (s3Client.saveImage as jest.Mock).mockResolvedValue(
      "http://s3-url.com/image.png"
    );
    (Signature.create as jest.Mock).mockResolvedValue({
      move_id: "1",
      user_id: "1",
      uri: "http://s3-url.com/image.png",
      signature_type: "type1",
    });

    const res = await request(app)
      .post("/api/signature")
      .field("caption", "Test Caption")
      .field("move_id", "1")
      .field("user_id", "1")
      .field("signature_type", "type1")
      .attach("file", Buffer.from("test"), "test.png");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      move_id: "1",
      user_id: "1",
      uri: "http://s3-url.com/image.png",
      signature_type: "type1",
    });
    expect(s3Client.saveImage).toHaveBeenCalledWith(
      file.buffer,
      "Test Caption",
      "image/png"
    );
    expect(Signature.create).toHaveBeenCalledWith(
      {
        move_id: "1",
        user_id: "1",
        uri: "http://s3-url.com/image.png",
        signature_type: "type1",
      },
      { transaction: expect.anything() }
    );
    expect(AuditLog.create).toHaveBeenCalledWith(
      {
        move_id: "1",
        user_id: "1",
        action: AuditLogActions.sent_signature,
      },
      { transaction: expect.anything() }
    );
  });

  it("should change move status to done when all conditions are met", async () => {
    const fileBuffer = Buffer.from("test");

    const move = {
      id: "1",
      status: MoveStatus.pending_yardmaster_signature,
      inspections: [
        {
          inspection_form: {
            name: "Exterior Vehicle Inspection",
          },
        },
      ],
      signatures: [
        {
          signature_type: SignatureTypes.inspector,
        },
        {
          signature_type: SignatureTypes.guardside_inspector,
        },
      ],
      save: jest.fn(),
    };

    (s3Client.saveImage as jest.Mock).mockResolvedValue(
      "http://s3-url.com/image.png"
    );
    (Move.findByPk as jest.Mock).mockResolvedValue(move);
    (Signature.create as jest.Mock).mockResolvedValue({
      move_id: "1",
      user_id: "1",
      uri: "http://s3-url.com/image.png",
      signature_type: SignatureTypes.yardmaster,
    });

    const res = await request(app)
      .post("/api/signature")
      .field("caption", "Test Caption")
      .field("move_id", "1")
      .field("user_id", "1")
      .field("signature_type", SignatureTypes.yardmaster)
      .attach("file", fileBuffer, "test.png");

    expect(move.save).toHaveBeenCalled();
    expect(move.status).toBe(MoveStatus.done);
    expect(AuditLog.create).toHaveBeenCalledWith(
      {
        move_id: "1",
        user_id: "1",
        action: AuditLogActions.sent_signature,
      },
      { transaction: expect.anything() }
    );
    expect(res.status).toBe(200);
  });

  it("should return 500 if there is an internal server error", async () => {
    const move = {
      status: MoveStatus.pending_move,
      inspections: [],
      signatures: [],
      save: jest.fn(),
    };

    (Move.findByPk as jest.Mock).mockResolvedValue(move);

    (s3Client.saveImage as jest.Mock).mockRejectedValue(new Error("S3 error"));

    const res = await request(app)
      .post("/api/signature")
      .field("caption", "Test Caption")
      .field("move_id", "1")
      .field("user_id", "1")
      .field("signature_type", "type1")
      .attach("file", Buffer.from("test"), "test.png");

    expect(rollback).toHaveBeenCalled();
    expect(res.status).toBe(500);
    expect(res.body.message).toEqual("internal server error");
  });
});
