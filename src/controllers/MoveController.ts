import { Request, Response } from "express";
import {
  Includeable,
  Op,
  Sequelize,
  Transaction,
  WhereOptions,
} from "sequelize";
import sequelizeConnection from "../database";
import {
  IMoveDetailsDTO,
  IMoveDetailsInspection,
  IMoveDetailsInspectionAnswer,
  IMoveDetailsInspectionFormQuestion,
  IMoveDetailsInspectionFormSection,
} from "../dto/moveDetailsDTO.model";
import { AuditLogActions } from "../enum/audit_log_actions.enum";
import { MoveStatus } from "../enum/move-status.enum";
import { MoveReasons } from "../enum/moveReasons";
import { QuestionTypes } from "../enum/questionTypes.enum";
import { RailOptions } from "../enum/railOptions.enum";
import {
  UserRoles,
  YardMasterRoles,
  YardMotorPersonRoles,
} from "../enum/userRoles.enum";
import {
  AuditLog,
  Car,
  Inspection,
  InspectionAnswer,
  InspectionForm,
  InspectionFormQuestion,
  InspectionFormSection,
  Line,
  Move,
  MoveCar,
  MoveReason,
  MoveTagAssociation,
  Signature,
  Tag,
  User,
  Yard,
} from "../models";
import { getDayUTCRange } from "../utils/dateUtils";

interface MoveCarInput {
  first_car_id: string;
  second_car_id?: string | null;
  pair_order: number;
}

interface CreateMoveAttributes {
  yard_id: string;
  move_reason_id: string;
  guardside_inspection_done_by_user_id?: string | null;
  due_date: string | Date;
  status: MoveStatus;
  priority_order: number;
  move_from: string;
  move_to: string;
  move_cars: MoveCarInput[];
  inspections: Partial<Inspection>[];
  inspections_selected_by_user_id?: string | null;
  yardmaster_user_id?: string;
  inspections_done_by_user_id?: string | null;
  move_done_by_user_id?: string | null;
}

export const create = async (req: Request, res: Response) => {
  const transaction: Transaction = await sequelizeConnection.transaction();
  try {
    const { key_cloak_user_id, userGroups } = req.headers;

    const user: User | null = await User.findOne({
      where: {
        key_cloak_id: key_cloak_user_id,
      },
    });

    if (!user || !Array.isArray(userGroups)) {
      await transaction.rollback();
      return res.status(401).json({ message: "Unauthorized" });
    }

    const isYardMasterUser: boolean = !!userGroups.find((g: string) =>
      YardMasterRoles.includes(g as UserRoles)
    );
    const isYardMotorPersonUser: boolean = !!userGroups.find((g: string) =>
      YardMotorPersonRoles.includes(g as UserRoles)
    );

    const createMoveRequests = req.body;
    const moves: Move[] = [];

    if (!Array.isArray(createMoveRequests))
      return res
        .status(400)
        .json({ message: "Data is not in the right format" });

    for (const createMoveRequest of createMoveRequests) {
      const {
        yard_id,
        move_reason_id,
        move_done_by_user_id,
        guardside_inspection_done_by_user_id,
        due_date,
        priority_order,
        move_from,
        move_to,
        move_cars,
        tag_ids,
        yardMotorperson_user_id,
      } = createMoveRequest;

      if (
        !yard_id ||
        typeof yard_id !== "string" ||
        !move_reason_id ||
        typeof move_reason_id !== "string" ||
        !due_date ||
        !priority_order ||
        !move_cars ||
        !move_cars.length
      ) {
        await transaction.rollback();
        return res.status(400).json({
          message: "All parameters should be provided in the right format",
        });
      }

      const yard: Yard | null = await Yard.findByPk(yard_id, {
        include: [Line],
      });

      if (!yard) {
        await transaction.rollback();
        return res
          .status(400)
          .json({ message: "Could not find yard with given id" });
      }

      const moveReason: MoveReason | null = await MoveReason.findByPk(
        move_reason_id,
        {
          include: [
            {
              model: InspectionForm,
              where: { is_light_rail: yard.line.is_light_rail },
              attributes: ["id", "name"],
              required: false,
            },
          ],
        }
      );

      if (!moveReason) {
        await transaction.rollback();
        return res
          .status(400)
          .json({ message: "Could not find move reason with given id" });
      }

      let moveInspections: Partial<Inspection>[] =
        moveReason.inspection_forms.map((form: InspectionForm) => {
          return { inspection_form_id: form.id };
        });

      const tags: Tag[] = await Tag.findAll({
        where: {
          id: { [Op.in]: tag_ids },
        },
      });

      const hasSpecialRuleTags: boolean =
        !!tags.find((tag) => tag.name === "No Move EVI") ||
        !!tags.find((tag) => tag.name === "No Move PTI");

      if (hasSpecialRuleTags) {
        moveInspections = [];

        if (tags.find((tag) => tag.name === "No Move EVI")) {
          const EVIInspection = await InspectionForm.findOne({
            where: { short_name: "EVI" },
          });
          if (EVIInspection)
            moveInspections.push({ inspection_form_id: EVIInspection.id });
        }

        if (tags.find((tag) => tag.name === "No Move PTI")) {
          const isLightRail = yard.line.is_light_rail;
          const PTIInspection = await InspectionForm.findOne({
            where: {
              short_name: "Pre Trip Inspection",
              is_light_rail: isLightRail,
            },
          });
          if (PTIInspection)
            moveInspections.push({ inspection_form_id: PTIInspection.id });
        }
      }

      const moveStatus: MoveStatus = moveInspections.length
        ? MoveStatus.waiting
        : MoveStatus.pending_move;

      const createMoveObject: CreateMoveAttributes = {
        yard_id,
        move_reason_id,
        guardside_inspection_done_by_user_id,
        due_date,
        status: moveStatus,
        priority_order,
        move_from,
        move_to,
        move_cars,
        inspections: moveInspections,
        inspections_selected_by_user_id: yardMotorperson_user_id,
      };

      if (isYardMasterUser) {
        createMoveObject.yardmaster_user_id = user.id;
        if (move_done_by_user_id && move_done_by_user_id.length) {
          createMoveObject.inspections_done_by_user_id = move_done_by_user_id;
          createMoveObject.move_done_by_user_id = move_done_by_user_id;
        }
      } else if (isYardMotorPersonUser) {
        createMoveObject.inspections_done_by_user_id = user.id;
        createMoveObject.move_done_by_user_id = user.id;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const move: Move = await Move.create(createMoveObject as any, {
        include: [MoveCar, Inspection, Tag],
        transaction: transaction,
      });

      if (tag_ids && tag_ids.length) {
        await Promise.all(
          tag_ids.map((tag_id: string) => {
            return MoveTagAssociation.create(
              { move_id: move.id, tag_id },
              { transaction: transaction }
            );
          })
        );
      }

      await AuditLog.create(
        {
          user_id: user.id,
          move_id: move.id,
          action:
            move_reason_id == MoveReasons.inspection
              ? AuditLogActions.created_inspection
              : AuditLogActions.created_move,
        },
        { transaction: transaction }
      );

      moves.push(move);
    }

    await transaction.commit();
    return res.json(moves);
  } catch (err) {
    await transaction.rollback();
    return res
      .status(500)
      .json({ message: "internal server error", error: err });
  }
};

export const getAllByDate = async (req: Request, res: Response) => {
  try {
    const { date_from, date_to, page, rail_type, is_dashboard } = req.query;

    if (
      !date_from ||
      typeof date_from !== "string" ||
      !date_to ||
      typeof date_to !== "string" ||
      !rail_type ||
      typeof rail_type !== "string" ||
      !is_dashboard
    ) {
      return res.status(400).json({
        message: "All parameters should be provided in the right format",
      });
    }

    const skip: number =
      typeof page === "string" ? (parseInt(page) - 1) * 10 : 0;
    const whereObj: WhereOptions = returnAllByDateWhere(req);
    const includesArray: Includeable[] = returnAllByDateIncludes(req);

    const { rows, count }: { rows: Move[]; count: number } =
      await Move.findAndCountAll({
        where: whereObj,
        include: includesArray,
        attributes: [
          "id",
          "due_date",
          "priority_order",
          "move_from",
          "move_to",
          [
            Sequelize.literal(
              "CONVERT_TZ(Move.created_at, '+00:00', '-01:00')"
            ),
            "created_at",
          ],
          "status",
        ],
        order: [
          ["created_at", "ASC"],
          ["priority_order", "ASC"],
        ],
        limit: 10,
        offset: skip,
        distinct: true,
      });

    return res.json({
      data: rows,
      pageCount: Math.ceil(count / 10),
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "internal server error", error: err });
  }
};

const returnAllByDateWhere = (req: Request): WhereOptions => {
  const { date_from, date_to, is_dashboard, priority_order, from, to, status } =
    req.query;

  const { startUTC } = getDayUTCRange(date_from as string, "America/New_York");
  const { endUTC } = getDayUTCRange(date_to as string, "America/New_York");

  let whereObj: WhereOptions = {
    created_at: {
      [Op.and]: {
        [Op.gte]: startUTC,
        [Op.lte]: endUTC,
      },
    },
  };

  if (is_dashboard === "true") {
    whereObj = {
      ...whereObj,
      status: {
        [Op.in]: [MoveStatus.done, MoveStatus.cancelled],
      },
    };
  }

  if (priority_order) {
    whereObj = {
      ...whereObj,
      priority_order: priority_order,
    };
  }

  if (from) {
    whereObj = {
      ...whereObj,
      move_from: { [Op.like]: `%${from}%` },
    };
  }

  if (to) {
    whereObj = {
      ...whereObj,
      move_to: { [Op.like]: `%${to}%` },
    };
  }

  if (status) {
    whereObj = {
      ...whereObj,
      status: status,
    };
  }

  return whereObj;
};

const returnAllByDateIncludes = (req: Request): Includeable[] => {
  const {
    rail_type,
    yard_id,
    line_id,
    reason_id,
    yardmaster_user_id,
    employee_user_id,
  } = req.query;

  let { tag_ids } = req.query;

  if (tag_ids && typeof tag_ids === "string") {
    tag_ids = tag_ids.split(",");
  }

  const includes: Includeable[] = [
    {
      model: MoveCar,
      include: [
        {
          model: Car,
          as: "first_car",
          attributes: ["id", "series_number"],
        },
        {
          model: Car,
          as: "second_car",
          attributes: ["id", "series_number"],
        },
      ],
      attributes: ["pair_order"],
      separate: true,
    },
    {
      model: Inspection,
      attributes: ["id", "inspection_form_id"],
      separate: true,
      include: [
        {
          model: InspectionForm,
          attributes: ["short_name"],
        },
      ],
    },
    {
      model: MoveReason,
      attributes: ["name"],
    },
    {
      model: Yard,
      attributes: ["name"],
      include: [
        {
          model: Line,
          attributes: ["name"],
        },
      ],
    },
    {
      model: User,
      as: "inspections_done_by_user",
      attributes: ["name", "badge_number"],
    },
    {
      model: User,
      as: "yardmaster_user",
      attributes: ["name", "badge_number"],
    },
    {
      model: Tag,
      attributes: ["name"],
    },
  ];

  if (line_id) {
    includes[3] = {
      ...(includes[3] as object),
      include: [
        {
          model: Line,
          attributes: ["name"],
          where: {
            id: line_id,
          },
          required: true,
        },
      ],
      required: true,
    };
  } else if (rail_type === RailOptions.light_rail) {
    includes[3] = {
      ...(includes[3] as object),
      include: [
        {
          model: Line,
          attributes: ["name"],
          where: {
            is_light_rail: true,
          },
          required: true,
        },
      ],
      required: true,
    };
  } else if (rail_type === RailOptions.heavy_rail) {
    includes[3] = {
      ...(includes[3] as object),
      include: [
        {
          model: Line,
          attributes: ["name"],
          where: {
            is_light_rail: false,
          },
          required: true,
        },
      ],
      required: true,
    };
  }
  if (yard_id) {
    includes[3] = {
      ...(includes[3] as object),
      where: {
        id: yard_id,
      },
      required: true,
    };
  }
  if (reason_id) {
    includes[2] = {
      ...(includes[2] as object),
      where: {
        id: reason_id,
      },
      required: true,
    };
  }
  if (yardmaster_user_id) {
    includes[5] = {
      ...(includes[5] as object),
      where: {
        id: yardmaster_user_id,
      },
      required: true,
    };
  }
  if (employee_user_id) {
    includes[4] = {
      ...(includes[4] as object),
      where: {
        id: employee_user_id,
      },
      required: true,
    };
  }
  if (tag_ids) {
    includes[6] = {
      ...(includes[6] as object),
      where: {
        id: { [Op.in]: tag_ids },
      },
      required: true,
    };
  }

  return includes;
};

export const getAllByDateAndYard = async (req: Request, res: Response) => {
  try {
    const { date, page, yard_id } = req.query;

    if (
      !date ||
      typeof date !== "string" ||
      !yard_id ||
      typeof yard_id !== "string"
    ) {
      return res.status(400).json({
        message: "All parameters should be provided in the right format",
      });
    }

    const { startUTC, endUTC } = getDayUTCRange(date, "America/New_York");

    const skip: number =
      typeof page === "string" ? (parseInt(page) - 1) * 10 : 0;

    const { rows, count }: { rows: Move[]; count: number } =
      await Move.findAndCountAll({
        where: {
          created_at: {
            [Op.and]: {
              [Op.gte]: startUTC,
              [Op.lte]: endUTC,
            },
          },
          yard_id: yard_id,
        },
        include: [
          {
            model: MoveCar,
            include: [
              {
                model: Car,
                as: "first_car",
                attributes: ["id", "series_number"],
              },
              {
                model: Car,
                as: "second_car",
                attributes: ["id", "series_number"],
              },
            ],
            attributes: ["pair_order"],
            separate: true,
          },
          {
            model: Inspection,
            attributes: ["id", "inspection_form_id"],
            separate: true,
          },
          {
            model: MoveReason,
            attributes: ["name"],
          },
          {
            model: Yard,
            attributes: ["name"],
            include: [
              {
                model: Line,
                attributes: ["name"],
              },
            ],
          },
          {
            model: User,
            as: "inspections_done_by_user",
            attributes: ["name", "badge_number"],
          },
          {
            model: User,
            as: "yardmaster_user",
            attributes: ["name", "badge_number"],
          },
          {
            model: Tag,
            attributes: ["name"],
          },
        ],
        attributes: [
          "id",
          "due_date",
          "priority_order",
          "move_from",
          "move_to",
          "status",
          [
            Sequelize.literal(
              "CONVERT_TZ(Move.created_at, '+00:00', '-01:00')"
            ),
            "created_at",
          ],
        ],
        order: [
          ["created_at", "ASC"],
          ["priority_order", "ASC"],
        ],
        limit: 10,
        offset: skip,
        distinct: true,
      });

    return res.json({
      data: rows,
      pageCount: Math.ceil(count / 10),
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "internal server error", error: err });
  }
};

export const getAllUnassigned = async (req: Request, res: Response) => {
  try {
    const { yard_id, page } = req.query;

    if (!yard_id || typeof yard_id !== "string") {
      return res.status(400).json({
        message: "All parameters should be provided in the right format",
      });
    }

    const { key_cloak_user_id } = req.headers;

    const user: User | null = await User.findOne({
      where: {
        key_cloak_id: key_cloak_user_id,
      },
    });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const skip: number =
      typeof page === "string" ? (parseInt(page) - 1) * 10 : 0;

    const { rows, count }: { rows: Move[]; count: number } =
      await Move.findAndCountAll({
        where: {
          status: MoveStatus.waiting,
          inspections_done_by_user_id: { [Op.or]: [user.id, null] },
          yard_id: yard_id,
          inspections_selected_by_user_id: { [Op.or]: [user.id, null] },
        },
        include: [
          {
            model: MoveCar,
            include: [
              {
                model: Car,
                as: "first_car",
                attributes: ["id", "series_number"],
              },
              {
                model: Car,
                as: "second_car",
                attributes: ["id", "series_number"],
              },
            ],
            attributes: ["pair_order"],
            separate: true,
          },
          {
            model: User,
            attributes: ["name", "badge_number"],
            as: "inspections_done_by_user",
          },
          {
            model: User,
            attributes: ["name", "badge_number"],
            as: "inspections_selected_by_user",
          },
          {
            model: Inspection,
            include: [
              {
                model: InspectionForm,
                attributes: [
                  "id",
                  "name",
                  "short_name",
                  "description",
                  "has_guardside_signature",
                  "has_foreperson_signature",
                ],
              },
            ],
            attributes: ["id"],
            separate: true,
          },
          {
            model: MoveReason,
            attributes: ["name"],
          },
          {
            model: Yard,
            attributes: ["name"],
          },
          {
            model: Tag,
            attributes: ["name"],
          },
        ],
        attributes: [
          "id",
          "due_date",
          "priority_order",
          "move_from",
          "move_to",
          "status",
          [
            Sequelize.literal(
              "CONVERT_TZ(Move.created_at, '+00:00', '-01:00')"
            ),
            "created_at",
          ],
        ],
        order: [
          ["created_at", "ASC"],
          ["priority_order", "ASC"],
        ],
        limit: 10,
        offset: skip,
        distinct: true,
      });

    return res.json({
      data: rows,
      pageCount: Math.ceil(count / 10),
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "internal server error", error: err });
  }
};

export const getAllPendingMove = async (req: Request, res: Response) => {
  try {
    const { yard_id, page } = req.query;

    if (!yard_id || typeof yard_id !== "string") {
      return res.status(400).json({
        message: "All parameters should be provided in the right format",
      });
    }

    const { key_cloak_user_id } = req.headers;

    const user: User | null = await User.findOne({
      where: {
        key_cloak_id: key_cloak_user_id,
      },
    });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const skip: number =
      typeof page === "string" ? (parseInt(page) - 1) * 10 : 0;

    const { rows, count }: { rows: Move[]; count: number } =
      await Move.findAndCountAll({
        where: {
          status: MoveStatus.pending_move,
          move_done_by_user_id: { [Op.or]: [user.id, null] },
          yard_id: yard_id,
          inspections_selected_by_user_id: { [Op.or]: [user.id, null] },
        },
        include: [
          {
            model: MoveCar,
            include: [
              {
                model: Car,
                as: "first_car",
                attributes: ["id", "series_number"],
              },
              {
                model: Car,
                as: "second_car",
                attributes: ["id", "series_number"],
              },
            ],
            attributes: ["pair_order"],
            separate: true,
          },
          {
            model: Inspection,
            attributes: ["id", "inspection_form_id"],
            separate: true,
          },
          {
            model: MoveReason,
            attributes: ["name"],
          },
          {
            model: Yard,
            attributes: ["name"],
          },
          {
            model: User,
            attributes: ["name", "badge_number"],
            as: "inspections_selected_by_user",
          },
          {
            model: Tag,
            attributes: ["name"],
          },
        ],
        attributes: [
          "id",
          "due_date",
          "priority_order",
          "move_from",
          "move_to",
          "status",
          [
            Sequelize.literal(
              "CONVERT_TZ(Move.created_at, '+00:00', '-01:00')"
            ),
            "created_at",
          ],
        ],
        order: [
          ["created_at", "ASC"],
          ["priority_order", "ASC"],
        ],
        limit: 10,
        offset: skip,
        distinct: true,
      });

    return res.json({
      data: rows,
      pageCount: Math.ceil(count / 10),
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "internal server error", error: err });
  }
};

export const getMoveHistory = async (req: Request, res: Response) => {
  try {
    const { date, page } = req.query;

    const { key_cloak_user_id } = req.headers;

    const user: User | null = await User.findOne({
      where: {
        key_cloak_id: key_cloak_user_id,
      },
    });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!date) {
      return res.status(400).json({
        message: "All parameters should be provided in the right format",
      });
    }

    const skip: number =
      typeof page === "string" ? (parseInt(page) - 1) * 10 : 0;

    const { startUTC, endUTC } = getDayUTCRange(
      date as string,
      "America/New_York"
    );

    const { rows, count }: { rows: Move[]; count: number } =
      await Move.findAndCountAll({
        where: {
          status: {
            [Op.in]: [
              MoveStatus.done,
              MoveStatus.cancelled,
              MoveStatus.pending_yardmaster_signature,
              MoveStatus.inspection_failed,
              MoveStatus.inspection_failed_pending_signature,
            ],
          },
          last_update: {
            [Op.and]: {
              [Op.gte]: startUTC,
              [Op.lte]: endUTC,
            },
          },
          [Op.or]: [
            { inspections_done_by_user_id: user.id },
            { guardside_inspection_done_by_user_id: user.id },
            { move_done_by_user_id: user.id },
            { inspections_selected_by_user_id: { [Op.or]: [user.id, null] } },
          ],
        },
        include: [
          {
            model: MoveCar,
            include: [
              {
                model: Car,
                as: "first_car",
                attributes: ["id", "series_number"],
              },
              {
                model: Car,
                as: "second_car",
                attributes: ["id", "series_number"],
              },
            ],
            attributes: ["pair_order"],
            separate: true,
          },
          {
            model: User,
            attributes: ["name", "badge_number"],
            as: "inspections_selected_by_user",
          },
          {
            model: MoveReason,
            attributes: ["name"],
          },
          {
            model: Tag,
            attributes: ["name"],
          },
        ],
        attributes: [
          "id",
          "due_date",
          "priority_order",
          "move_from",
          "move_to",
          "status",
          "last_update",
          [
            Sequelize.literal(
              "CONVERT_TZ(Move.created_at, '+00:00', '-01:00')"
            ),
            "created_at",
          ],
        ],
        order: [["last_update", "DESC"]],
        limit: 10,
        offset: skip,
        distinct: true,
      });

    return res.json({
      data: rows,
      pageCount: Math.ceil(count / 10),
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "internal server error", error: err });
  }
};

export const assign = async (req: Request, res: Response) => {
  const transaction: Transaction = await sequelizeConnection.transaction();
  try {
    const { key_cloak_user_id } = req.headers;
    const { move_id } = req.query;

    const user: User | null = await User.findOne({
      where: {
        key_cloak_id: key_cloak_user_id,
      },
    });

    if (!user) {
      await transaction.rollback();
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!move_id || typeof move_id !== "string") {
      await transaction.rollback();
      return res.status(400).json({
        message: "All parameters should be provided in the right format",
      });
    }

    const move: Move | null = await Move.findByPk(move_id);

    if (!move) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ message: "Could not find move with given id" });
    }

    //assigning move that has been created by the own user
    else if (
      move.status === MoveStatus.waiting &&
      move.inspections_done_by_user_id === user.id &&
      move.move_done_by_user_id === user.id
    ) {
      move.status = MoveStatus.pending_checklist;

      await move.save({ transaction: transaction });

      await AuditLog.create(
        {
          user_id: user.id,
          move_id: move.id,
          action: AuditLogActions.assigned_move,
        },
        { transaction: transaction }
      );

      await AuditLog.create(
        {
          user_id: user.id,
          move_id: move.id,
          action: AuditLogActions.assigned_move_inspections,
        },
        { transaction: transaction }
      );

      await transaction.commit();

      const updated_move: Move | null = await Move.findByPk(move_id, {
        include: [
          {
            model: MoveCar,
            include: [
              {
                model: Car,
                as: "first_car",
                attributes: ["id", "series_number"],
              },
              {
                model: Car,
                as: "second_car",
                attributes: ["id", "series_number"],
              },
            ],
            attributes: ["pair_order"],
            separate: true,
          },
          {
            model: Inspection,
            include: [
              {
                model: InspectionForm,
                attributes: [
                  "id",
                  "name",
                  "short_name",
                  "description",
                  "has_guardside_signature",
                  "has_foreperson_signature",
                ],
              },
            ],
            attributes: ["id"],
            separate: true,
          },
          {
            model: MoveReason,
            attributes: ["name"],
          },
          {
            model: Tag,
            attributes: ["name"],
          },
          {
            model: Yard,
            attributes: ["name"],
          },
          {
            model: User,
            as: "inspections_done_by_user",
            attributes: ["name", "badge_number"],
          },
        ],
      });

      return res.json(updated_move);
    }

    //assigning move that has been created by the own user and does not have inspections
    else if (
      move.status === MoveStatus.pending_move &&
      move.move_done_by_user_id === user.id
    ) {
      await AuditLog.create(
        {
          user_id: user.id,
          move_id: move.id,
          action: AuditLogActions.assigned_move,
        },
        { transaction: transaction }
      );

      const updated_move: Move | null = await Move.findByPk(move_id, {
        include: [
          {
            model: MoveCar,
            include: [
              {
                model: Car,
                as: "first_car",
                attributes: ["id", "series_number"],
              },
              {
                model: Car,
                as: "second_car",
                attributes: ["id", "series_number"],
              },
            ],
            attributes: ["pair_order"],
            separate: true,
          },
          {
            model: Inspection,
            include: [
              {
                model: InspectionForm,
                attributes: [
                  "id",
                  "name",
                  "short_name",
                  "description",
                  "has_guardside_signature",
                  "has_foreperson_signature",
                ],
              },
            ],
            attributes: ["id"],
            separate: true,
          },
          {
            model: MoveReason,
            attributes: ["name"],
          },
          {
            model: Yard,
            attributes: ["name"],
          },
          {
            model: User,
            as: "inspections_done_by_user",
            attributes: ["name", "badge_number"],
          },
        ],
      });

      await transaction.commit();
      return res.status(200).json(updated_move);
    } else if (move.inspections_done_by_user_id && move.move_done_by_user_id) {
      await transaction.rollback();
      return res.status(400).json({ message: "Move is already assigned" });
    } else if (
      move.status === MoveStatus.pending_move &&
      !move.move_done_by_user_id
    ) {
      move.move_done_by_user_id = user.id;

      await move.save({ transaction: transaction });

      await AuditLog.create(
        {
          user_id: user.id,
          move_id: move.id,
          action: AuditLogActions.assigned_move,
        },
        { transaction: transaction }
      );

      const updated_move: Move | null = await Move.findByPk(move_id, {
        include: [
          {
            model: MoveCar,
            include: [
              {
                model: Car,
                as: "first_car",
                attributes: ["id", "series_number"],
              },
              {
                model: Car,
                as: "second_car",
                attributes: ["id", "series_number"],
              },
            ],
            attributes: ["pair_order"],
            separate: true,
          },
          {
            model: Inspection,
            include: [
              {
                model: InspectionForm,
                attributes: [
                  "id",
                  "name",
                  "short_name",
                  "description",
                  "has_guardside_signature",
                  "has_foreperson_signature",
                ],
              },
            ],
            attributes: ["id"],
            separate: true,
          },
          {
            model: MoveReason,
            attributes: ["name"],
          },
          {
            model: Yard,
            attributes: ["name"],
          },
          {
            model: User,
            as: "inspections_done_by_user",
            attributes: ["name", "badge_number"],
          },
        ],
      });

      await transaction.commit();
      return res.json(updated_move);
    } else if (
      move.status === MoveStatus.waiting &&
      !move.inspections_done_by_user_id &&
      !move.move_done_by_user_id
    ) {
      move.move_done_by_user_id = user.id;
      move.inspections_done_by_user_id = user.id;
      move.status = MoveStatus.pending_checklist;

      await move.save({ transaction: transaction });

      await AuditLog.create(
        {
          user_id: user.id,
          move_id: move.id,
          action: AuditLogActions.assigned_move,
        },
        { transaction: transaction }
      );

      await AuditLog.create(
        {
          user_id: user.id,
          move_id: move.id,
          action: AuditLogActions.assigned_move_inspections,
        },
        { transaction: transaction }
      );

      await transaction.commit();

      const updated_move: Move | null = await Move.findByPk(move_id, {
        include: [
          {
            model: MoveCar,
            include: [
              {
                model: Car,
                as: "first_car",
                attributes: ["id", "series_number"],
              },
              {
                model: Car,
                as: "second_car",
                attributes: ["id", "series_number"],
              },
            ],
            attributes: ["pair_order"],
            separate: true,
          },
          {
            model: Inspection,
            include: [
              {
                model: InspectionForm,
                attributes: [
                  "id",
                  "name",
                  "short_name",
                  "description",
                  "has_guardside_signature",
                  "has_foreperson_signature",
                ],
              },
            ],
            attributes: ["id"],
            separate: true,
          },
          {
            model: MoveReason,
            attributes: ["name"],
          },
          {
            model: Yard,
            attributes: ["name"],
          },
          {
            model: User,
            as: "inspections_done_by_user",
            attributes: ["name", "badge_number"],
          },
        ],
      });

      return res.json(updated_move);
    } else {
      await transaction.rollback();
      return res.status(400).json({ message: "This move cannot be assigned" });
    }
  } catch (err) {
    await transaction.rollback();
    return res
      .status(500)
      .json({ message: "internal server error", error: err });
  }
};

export const getAssignedMove = async (req: Request, res: Response) => {
  try {
    const { key_cloak_user_id } = req.headers;

    const user: User | null = await User.findOne({
      where: {
        key_cloak_id: key_cloak_user_id,
      },
    });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const move: Move | null = await Move.findOne({
      where: {
        inspections_done_by_user_id: user.id,
        status: {
          [Op.in]: [MoveStatus.pending_checklist, MoveStatus.pending_move],
        },
      },
      include: [
        {
          model: MoveCar,
          include: [
            {
              model: Car,
              as: "first_car",
              attributes: ["id", "series_number"],
            },
            {
              model: Car,
              as: "second_car",
              attributes: ["id", "series_number"],
            },
          ],
          attributes: ["pair_order"],
          separate: true,
        },
        {
          model: Inspection,
          include: [
            {
              model: InspectionForm,
              attributes: [
                "id",
                "name",
                "short_name",
                "description",
                "has_guardside_signature",
                "has_foreperson_signature",
              ],
            },
          ],
          attributes: ["id"],
          separate: true,
        },
        {
          model: MoveReason,
          attributes: ["name"],
        },
        {
          model: Yard,
          attributes: ["name"],
        },
        {
          model: User,
          as: "inspections_done_by_user",
          attributes: ["name", "badge_number"],
        },
        {
          model: Tag,
          attributes: ["name"],
        },
      ],
      attributes: [
        "id",
        "due_date",
        "priority_order",
        "move_from",
        "move_to",
        "status",
        "last_update",
        [
          Sequelize.literal("CONVERT_TZ(Move.created_at, '+00:00', '-01:00')"),
          "created_at",
        ],
      ],
      order: [["last_update", "DESC"]],
    });

    if (!move) {
      return res.status(404).json({ message: "No assigned move found" });
    }

    return res.json(move);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "internal server error", error: err });
  }
};

export const release = async (req: Request, res: Response) => {
  const transaction: Transaction = await sequelizeConnection.transaction();
  try {
    const { move_id } = req.query;

    if (!move_id || typeof move_id !== "string") {
      await transaction.rollback();
      return res.status(400).json({
        message: "All parameters should be provided in the right format",
      });
    }

    const { key_cloak_user_id, userGroups } = req.headers;

    const user: User | null = await User.findOne({
      where: {
        key_cloak_id: key_cloak_user_id,
      },
    });

    if (!user || !Array.isArray(userGroups)) {
      await transaction.rollback();
      return res.status(401).json({ message: "Unauthorized" });
    }

    const move: Move | null = await Move.findByPk(move_id);

    if (!move) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ message: "Could not find move with given id" });
    } else if (move.status === MoveStatus.cancelled) {
      await transaction.rollback();
      return res.status(400).json({ message: "Move is cancelled" });
    } else if (move.status === MoveStatus.pending_move) {
      move.move_done_by_user_id = null;

      const updated_move = await move.save({ transaction: transaction });

      await AuditLog.create(
        {
          user_id: user.id,
          move_id: move.id,
          action: AuditLogActions.unassigned_move,
        },
        { transaction: transaction }
      );

      await transaction.commit();
      return res.json(updated_move);
    } else if (move.status === MoveStatus.pending_checklist) {
      move.move_done_by_user_id = null;
      move.inspections_done_by_user_id = null;
      move.status = MoveStatus.waiting;

      const updated_move = await move.save({ transaction: transaction });

      await AuditLog.create(
        {
          user_id: user.id,
          move_id: move.id,
          action: AuditLogActions.unassigned_move,
        },
        { transaction: transaction }
      );

      await AuditLog.create(
        {
          user_id: user.id,
          move_id: move.id,
          action: AuditLogActions.unassigned_move_inspections,
        },
        { transaction: transaction }
      );

      await transaction.commit();
      return res.json(updated_move);
    } else {
      await transaction.rollback();
      return res.status(400).json({ message: "This move cannot be released" });
    }
  } catch (err) {
    await transaction.rollback();
    return res
      .status(500)
      .json({ message: "internal server error", error: err });
  }
};

export const updateExecuted = async (req: Request, res: Response) => {
  const transaction: Transaction = await sequelizeConnection.transaction();
  try {
    const { move_id } = req.query;

    if (!move_id || typeof move_id !== "string") {
      await transaction.rollback();
      return res.status(400).json({
        message: "All parameters should be provided in the right format",
      });
    }

    const { key_cloak_user_id, userGroups } = req.headers;

    const user: User | null = await User.findOne({
      where: {
        key_cloak_id: key_cloak_user_id,
      },
    });

    if (!user || !Array.isArray(userGroups)) {
      await transaction.rollback();
      return res.status(401).json({ message: "Unauthorized" });
    }

    const move: Move | null = await Move.findByPk(move_id, {
      include: [
        {
          model: Yard,
          attributes: ["id", "is_main_yard"],
        },
      ],
    });

    if (!move) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ message: "Could not find move with given id" });
    } else if (move.status === MoveStatus.cancelled) {
      await transaction.rollback();
      return res.status(400).json({ message: "Move is cancelled" });
    } else if (move.status === MoveStatus.pending_move) {
      const isMainYard: boolean = move.yard.is_main_yard;
      move.status = isMainYard
        ? MoveStatus.pending_yardmaster_signature
        : MoveStatus.done;

      const updated_move = await move.save({ transaction: transaction });

      await AuditLog.create(
        {
          user_id: user.id,
          move_id: move.id,
          action: AuditLogActions.executed_move,
        },
        { transaction: transaction }
      );

      await transaction.commit();
      return res.json(updated_move);
    } else {
      await transaction.rollback();
      return res.status(400).json({ message: "This move cannot be updated" });
    }
  } catch (err) {
    await transaction.rollback();
    return res
      .status(500)
      .json({ message: "internal server error", error: err });
  }
};

export const cancel = async (req: Request, res: Response) => {
  const transaction: Transaction = await sequelizeConnection.transaction();
  try {
    const { move_id } = req.query;

    if (!move_id || typeof move_id !== "string") {
      await transaction.rollback();
      return res.status(400).json({
        message: "All parameters should be provided in the right format",
      });
    }

    const { key_cloak_user_id, userGroups } = req.headers;

    const user: User | null = await User.findOne({
      where: {
        key_cloak_id: key_cloak_user_id,
      },
    });

    if (!user || !Array.isArray(userGroups)) {
      await transaction.rollback();
      return res.status(401).json({ message: "Unauthorized" });
    }

    const move: Move | null = await Move.findByPk(move_id);

    if (!move) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ message: "Could not find move with given id" });
    } else if (move.status === MoveStatus.done) {
      await transaction.rollback();
      return res.status(400).json({ message: "This move is already done" });
    } else {
      move.status = MoveStatus.cancelled;

      const updated_move = await move.save({ transaction: transaction });

      await AuditLog.create(
        {
          user_id: user.id,
          move_id: move.id,
          action: AuditLogActions.cancelled_move,
        },
        { transaction: transaction }
      );

      await transaction.commit();
      return res.json(updated_move);
    }
  } catch (err) {
    await transaction.rollback();
    return res
      .status(500)
      .json({ message: "internal server error", error: err });
  }
};

export const saveResult = async (req: Request, res: Response) => {
  const transaction: Transaction = await sequelizeConnection.transaction();
  try {
    const { answers, move_id } = req.body;

    if (!answers || !move_id) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ message: "All parameters should be provided" });
    }

    const { key_cloak_user_id, userGroups } = req.headers;

    const user: User | null = await User.findOne({
      where: {
        key_cloak_id: key_cloak_user_id,
      },
    });

    if (!user || !Array.isArray(userGroups)) {
      await transaction.rollback();
      return res.status(401).json({ message: "Unauthorized" });
    }

    const move: Move | null = await Move.findByPk(move_id, {
      include: [Yard, Tag],
    });

    if (!move) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ message: "Could not find move with given id" });
    } else if (move.status === MoveStatus.cancelled) {
      await transaction.rollback();
      return res.status(400).json({ message: "Move is cancelled" });
    } else if (move.status !== MoveStatus.pending_checklist) {
      await transaction.rollback();
      return res.status(400).json({ message: "Move can not be updated" });
    }

    const inspection_answers: InspectionAnswer[] = answers;

    await Promise.all(
      inspection_answers.map(async (answer: InspectionAnswer) => {
        const dbAnswer = InspectionAnswer.build({
          inspection_id: answer.inspection_id,
          inspection_form_question_id: answer.inspection_form_question_id,
          has_minor_defect: answer.has_minor_defect,
          has_major_defect: answer.has_major_defect,
          is_guardside: answer.is_guardside ?? false,
          car_id: answer.car_id,
          comments: answer.comments,
        });

        await dbAnswer.save({ transaction: transaction });
      })
    );

    const moveHasDefects: boolean = inspection_answers.some(
      (answer: InspectionAnswer) => answer.has_major_defect
    );
    const isMainYard: boolean = move.yard.is_main_yard;
    const hasNoMoveTags: boolean =
      !!move.tags.find((tag) => tag.name === "No Move EVI") ||
      !!move.tags.find((tag) => tag.name === "No Move PTI");

    if (hasNoMoveTags && moveHasDefects) {
      move.status = MoveStatus.inspection_failed;
    } else if (hasNoMoveTags && !moveHasDefects) {
      move.status = MoveStatus.done;
    } else if (moveHasDefects && isMainYard) {
      move.status = MoveStatus.inspection_failed_pending_signature;
    } else if (moveHasDefects) {
      move.status = MoveStatus.inspection_failed;
    } else {
      move.status = MoveStatus.pending_move;
    }

    const updated_move = await move.save({ transaction: transaction });

    await AuditLog.create(
      {
        user_id: user.id,
        move_id: move.id,
        action: AuditLogActions.sent_move_result,
      },
      { transaction: transaction }
    );

    transaction.commit();
    return res.json(updated_move);
  } catch (err) {
    await transaction.rollback();
    return res
      .status(500)
      .json({ message: "internal server error", error: err });
  }
};

export const getMoveDetails = async (req: Request, res: Response) => {
  try {
    const { move_id } = req.query;

    if (!move_id || typeof move_id !== "string") {
      return res.status(400).json({
        message: "All parameters should be provided in the right format",
      });
    }

    const move: Move | null = await returnMoveAndAllChildren(move_id);

    if (!move) {
      return res
        .status(400)
        .json({ message: "Could not find move with provided id" });
    }

    const inspection_ids: string[] = move?.inspections.map(
      (inspection: Inspection) => inspection.id
    );

    const inspection_answers: InspectionAnswer[] =
      await InspectionAnswer.findAll({
        where: {
          inspection_id: { [Op.in]: inspection_ids },
        },
        attributes: [
          "has_minor_defect",
          "has_major_defect",
          "inspection_form_question_id",
          "is_guardside",
          "comments",
        ],
        include: [
          {
            model: Car,
            attributes: ["series_number"],
          },
        ],
      });

    const moveDetailsWithInspectionsAnswers: IMoveDetailsDTO =
      returnMoveDetailsWithInspectionsAnswers(move, inspection_answers);
    return res.status(200).json(moveDetailsWithInspectionsAnswers);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "internal server error", error: err });
  }
};

const returnMoveAndAllChildren = async (
  move_id: string
): Promise<Move | null> => {
  return await Move.findByPk(move_id, {
    include: [
      {
        model: Yard,
        attributes: ["name"],
      },
      {
        model: MoveReason,
        attributes: ["name"],
      },
      {
        model: MoveCar,
        attributes: ["pair_order"],
        include: [
          {
            model: Car,
            as: "first_car",
            attributes: ["series_number"],
          },
          {
            model: Car,
            as: "second_car",
            attributes: ["series_number"],
          },
        ],
      },
      {
        model: Inspection,
        attributes: ["id"],
        include: [
          {
            model: InspectionForm,
            attributes: ["name", "short_name"],
            include: [
              {
                model: InspectionFormSection,
                attributes: ["name"],
                include: [
                  {
                    model: InspectionFormQuestion,
                    attributes: ["id", "description", "question_type"],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        model: Signature,
        attributes: ["uri", "signature_type"],
        include: [
          {
            model: User,
            attributes: ["name", "badge_number"],
          },
        ],
      },
      {
        model: User,
        as: "move_done_by_user",
        attributes: ["name", "badge_number"],
      },
      {
        model: User,
        as: "inspections_done_by_user",
        attributes: ["name", "badge_number"],
      },
      {
        model: User,
        as: "guardside_inspection_done_by_user",
        attributes: ["name", "badge_number"],
      },
      {
        model: User,
        as: "yardmaster_user",
        attributes: ["name", "badge_number"],
      },
      {
        model: AuditLog,
        attributes: [
          "action",
          [
            Sequelize.literal(
              "CONVERT_TZ(audit_logs.created_at, '+00:00', '-01:00')"
            ),
            "created_at",
          ],
        ],
        include: [
          {
            model: User,
            attributes: ["name", "badge_number"],
          },
        ],
        order: [[AuditLog, "created_at", "DESC"]],
      },
      {
        model: Tag,
        attributes: ["name"],
      },
    ],
    attributes: [
      "due_date",
      "status",
      "priority_order",
      "move_from",
      "move_to",
      [
        Sequelize.literal("CONVERT_TZ(Move.created_at, '+00:00', '-01:00')"),
        "created_at",
      ],
    ],
    subQuery: false,
  });
};

const returnMoveDetailsWithInspectionsAnswers = (
  move: Move,
  inspection_answers: InspectionAnswer[]
): IMoveDetailsDTO => {
  const moveDetails: IMoveDetailsDTO = move.toJSON();

  moveDetails.inspections?.forEach((inspection: IMoveDetailsInspection) => {
    inspection.inspection_form.inspection_form_sections?.forEach(
      (section: IMoveDetailsInspectionFormSection) => {
        section.inspection_form_questions?.forEach(
          (question: IMoveDetailsInspectionFormQuestion) => {
            const questionAnswers: InspectionAnswer[] =
              inspection_answers.filter(
                (answer: InspectionAnswer) =>
                  answer.inspection_form_question_id === question.id
              );

            const questionComments: string | undefined = questionAnswers.find(
              (answer: InspectionAnswer) => !!answer.comments
            )?.comments;

            question.selectedCars = returnMoveDetailQuestionAnswer(
              question,
              questionAnswers
            );
            question.comments = questionComments;
            question.is_answered =
              move.status !== MoveStatus.waiting &&
              move.status !== MoveStatus.pending_checklist;
          }
        );
      }
    );
  });

  return moveDetails;
};

const returnMoveDetailQuestionAnswer = (
  question: IMoveDetailsInspectionFormQuestion,
  answers: InspectionAnswer[]
): IMoveDetailsInspectionAnswer => {
  switch (question.question_type) {
    case QuestionTypes.SingleDefectQuestion:
      return answers
        .filter((answer: InspectionAnswer) => answer.has_major_defect)
        .map((answer: InspectionAnswer) => answer.car.series_number);

    case QuestionTypes.DoubleDefectQuestion: {
      const majorDefects = answers
        .filter((answer: InspectionAnswer) => answer.has_major_defect)
        .map((answer: InspectionAnswer) => answer.car.series_number);
      const minorDefects = answers
        .filter((answer: InspectionAnswer) => answer.has_minor_defect)
        .map((answer: InspectionAnswer) => answer.car.series_number);
      return { minorDefects, majorDefects };
    }

    case QuestionTypes.GuardSideAndMotorPersonQuestion: {
      const guardSdeAnswers = answers
        .filter(
          (answer: InspectionAnswer) =>
            answer.has_major_defect && answer.is_guardside
        )
        .map((answer: InspectionAnswer) => answer.car.series_number);
      const motorPersonAnswers = answers
        .filter(
          (answer: InspectionAnswer) =>
            answer.has_major_defect && !answer.is_guardside
        )
        .map((answer: InspectionAnswer) => answer.car.series_number);
      return {
        guardSide: guardSdeAnswers,
        motorPersonSide: motorPersonAnswers,
      };
    }

    case QuestionTypes.YesOrNoQuestion:
      return answers[0]?.has_major_defect ?? false;

    default:
      return [];
  }
};
