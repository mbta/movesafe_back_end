import { Request, Response } from "express";
import { Tag } from "../models/index.js";

export const getAll = async (req: Request, res: Response) => {
  try {
    const tags: Tag[] = await Tag.findAll({
      attributes: ["id", "name"],
    });

    return res.json(tags);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "internal server error", error: err });
  }
};
