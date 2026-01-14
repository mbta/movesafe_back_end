import { Request, Response } from "express";
import { Transaction } from "sequelize";
import sequelizeConnection from "../database/index";
import { AuditLogActions } from "../enum/audit_log_actions.enum";
import { MoveStatus } from "../enum/move-status.enum";
import { SignatureTypes } from "../enum/signature-types.enum";
import {
  AuditLog,
  Inspection,
  InspectionForm,
  Move,
  Signature,
  User,
} from "../models/index";
import * as s3Client from "../utils/s3Client";

export const saveSignature = async (req: Request, res: Response) => {
  const transaction: Transaction = await sequelizeConnection.transaction();
  try {
    const { caption, move_id, signature_type, user_id } = req.body;
    const file = req.file;

    const { key_cloak_user_id } = req.headers;

    if (!file || !caption || !move_id || !signature_type) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ message: "All parameters should be provided" });
    }

    if (
      (signature_type === SignatureTypes.guardside_inspector ||
        signature_type === SignatureTypes.foreperson) &&
      (!user_id || !user_id.length)
    ) {
      await transaction.rollback();
      return res.status(400).json({ message: "user_id should be provided" });
    }

    const user: User | null = await User.findOne({
      where: {
        key_cloak_id: key_cloak_user_id,
      },
    });

    if (!user) {
      await transaction.rollback();
      return res.status(401).json({ message: "Unauthorized" });
    }

    const move: Move | null = await Move.findByPk(move_id, {
      include: [
        {
          model: Signature,
          attributes: ["signature_type"],
        },
        {
          model: Inspection,
          include: [InspectionForm],
        },
      ],
    });

    if (!move) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ message: "Could not find move with provided id" });
    }

    if (
      signature_type === SignatureTypes.yardmaster &&
      move.status !== MoveStatus.pending_yardmaster_signature &&
      move.status !== MoveStatus.inspection_failed_pending_signature
    ) {
      await transaction.rollback();
      //returned message being used in frontend - should update frontend if message changed
      return res
        .status(400)
        .json({
          message:
            "Can not save yardmaster signature before move done or inspection failed",
        });
    }

    const signature: Signature | null = await Signature.findOne({
      where: {
        move_id: move_id,
        signature_type: signature_type,
      },
    });

    if (signature) {
      await transaction.rollback();
      return res.status(200).json(signature);
    }

    const fileBuffer: Buffer = file.buffer;

    const fileUri: string = await s3Client.saveImage(
      fileBuffer,
      caption,
      file.mimetype
    );

    const signaturesUserId: string =
      signature_type === SignatureTypes.guardside_inspector ||
      signature_type === SignatureTypes.foreperson
        ? user_id
        : user.id;

    const newSignature: Signature = await Signature.create(
      {
        move_id: move_id,
        user_id: signaturesUserId,
        uri: fileUri,
        signature_type: signature_type,
      },
      { transaction: transaction }
    );

    await AuditLog.create(
      {
        user_id: user.id,
        move_id: move_id,
        action: AuditLogActions.sent_signature,
      },
      { transaction: transaction }
    );

    if (isMoveSignatureCompleted(newSignature, move)) {
      const moveHasDefects: boolean =
        move.status === MoveStatus.inspection_failed_pending_signature;
      move.status = moveHasDefects
        ? MoveStatus.inspection_failed
        : MoveStatus.done;
      await move.save({ transaction: transaction });

      await AuditLog.create(
        {
          user_id: user.id,
          move_id: move_id,
          action: AuditLogActions.completed_move,
        },
        { transaction: transaction }
      );
    }

    await transaction.commit();
    return res.status(200).json(newSignature);
  } catch (err) {
    await transaction.rollback();
    return res
      .status(500)
      .json({ message: "internal server error", error: err });
  }
};

const isMoveSignatureCompleted = (
  newSignature: Signature,
  move: Move
): boolean => {
  const moveShouldHaveGuardSideSignature: boolean =
    move.inspections.find((inspection: Inspection) =>
      inspection.inspection_form.name.includes("Exterior Vehicle Inspection")
    ) !== undefined;

  const guardSideSignatureCompleted: boolean =
    !moveShouldHaveGuardSideSignature ||
    move.signatures.find(
      (signature: Signature) =>
        signature.signature_type === SignatureTypes.guardside_inspector
    ) !== undefined;

  const moveShouldHaveInspectorSignature: boolean = move.inspections.length > 0;

  const inspectorSignatureCompleted: boolean =
    !moveShouldHaveInspectorSignature ||
    move.signatures.find(
      (signature: Signature) =>
        signature.signature_type === SignatureTypes.inspector
    ) !== undefined;

  const yardmasterSignatureCompleted: boolean =
    newSignature.signature_type === SignatureTypes.yardmaster;

  return (
    inspectorSignatureCompleted &&
    yardmasterSignatureCompleted &&
    guardSideSignatureCompleted
  );
};
