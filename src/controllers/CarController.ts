import { Request, Response } from "express";

import { Op, WhereOptions } from "sequelize";
import Car from "../models/Car.js";

export const getAllByLineId = async (req: Request, res: Response) => {
  try {
    const { line_id, series_number } = req.query;

    if (!line_id) {
      return res
        .status(400)
        .json({ message: "Missing line_id query parameter" });
    }

    let where: WhereOptions = { line_id: line_id, is_active: true };

    if (series_number) {
      where = {
        ...where,
        series_number: { [Op.like]: `%${series_number}%` },
      };
    }

    const cars: Car[] = await Car.findAll({
      where: where,
      attributes: ["id", "series_number"],
    });

    return res.json(cars);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "internal server error", error: err });
  }
};
