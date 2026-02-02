import { Request, Response } from "express";
import { Yard } from "../models/index.js";

export const getAllByLineId = async (req: Request, res: Response) => {
  try {
    const { line_id } = req.query;

    if (!line_id) {
      return res
        .status(400)
        .json({ message: "Missing line_id query parameter" });
    }

    const yards: Yard[] = await Yard.findAll({
      where: { line_id: line_id },
      attributes: ["id", "name", "is_main_yard"],
    });

    return res.json(yards);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "internal server error", error: err });
  }
};
