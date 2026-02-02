import { Request, Response } from "express";

import {
  InspectionForm,
  InspectionFormCategory,
  InspectionFormQuestion,
  InspectionFormSection,
} from "../models/index.js";

export const getAll = async (_: Request, res: Response) => {
  try {
    const inspectionForms: InspectionForm[] = await InspectionForm.findAll({
      attributes: [
        "id",
        "name",
        "short_name",
        "description",
        "has_comments",
        "has_guardside_signature",
        "has_foreperson_signature",
      ],
      include: [
        {
          model: InspectionFormSection,
          attributes: ["name"],
          include: [
            {
              model: InspectionFormQuestion,
              attributes: [
                "id",
                "description",
                "question_type",
                "has_comments",
              ],
              include: [
                {
                  model: InspectionFormCategory,
                  attributes: ["id", "name"],
                },
              ],
            },
          ],
        },
      ],
    });

    return res.json(inspectionForms);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "internal server error", error: err });
  }
};
