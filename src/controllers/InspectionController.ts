import { Request, Response } from "express";
import { Op } from "sequelize";
import { MoveStatus } from "../enum/move-status.enum";
import { Inspection, InspectionForm, Move } from "../models";
import { getDayUTCRange } from "../utils/dateUtils";

export const getStatsForDay = async (req: Request, res: Response) => {
  try {
    const { date_from, date_to } = req.query;

    if (
      !date_from ||
      typeof date_from !== "string" ||
      !date_to ||
      typeof date_to !== "string"
    ) {
      return res
        .status(400)
        .json({
          message: "All parameters should be provided in the right format",
        });
    }

    const { startUTC } = getDayUTCRange(
      date_from as string,
      "America/New_York"
    );
    const { endUTC } = getDayUTCRange(date_to as string, "America/New_York");

    const inspectionsForDay: Inspection[] = await Inspection.findAll({
      where: {
        created_at: {
          [Op.and]: {
            [Op.gte]: startUTC,
            [Op.lte]: endUTC,
          },
        },
      },
      attributes: [],
      include: [
        { model: InspectionForm, attributes: ["name", "is_light_rail"] },
        {
          model: Move,
          required: true,
        },
      ],
    });

    const lightRailInspections: Inspection[] = inspectionsForDay.filter(
      (inspection: Inspection) => inspection.inspection_form.is_light_rail
    );
    const heavyRailInspections: Inspection[] = inspectionsForDay.filter(
      (inspection: Inspection) => !inspection.inspection_form.is_light_rail
    );

    const totalEviInspectionsForLightRail: number = lightRailInspections.filter(
      (inspection: Inspection) =>
        inspection.inspection_form.name.includes("Exterior Vehicle Inspection")
    ).length;
    const totalEviInspectionsForHeavyRail: number = heavyRailInspections.filter(
      (inspection: Inspection) =>
        inspection.inspection_form.name.includes("Exterior Vehicle Inspection")
    ).length;

    const totalPreTripInspectionsForLightRail: number =
      lightRailInspections.filter((inspection: Inspection) =>
        inspection.inspection_form.name.includes("Pre Trip Inspection")
      ).length;
    const totalPreTripInspectionsForHeavyRail: number =
      heavyRailInspections.filter((inspection: Inspection) =>
        inspection.inspection_form.name.includes("Pre Trip Inspection")
      ).length;

    const totalCarHouseInspectionsForLightRail: number =
      lightRailInspections.filter((inspection: Inspection) =>
        inspection.inspection_form.name.includes("Car House Circle Checklist")
      ).length;
    const totalCarHouseInspectionsForHeavyRail: number =
      heavyRailInspections.filter((inspection: Inspection) =>
        inspection.inspection_form.name.includes("Car House Circle Checklist")
      ).length;

    const totalSafetyInspectionsForLightRail: number =
      lightRailInspections.filter((inspection: Inspection) =>
        inspection.inspection_form.name.includes("Safety Inspection")
      ).length;
    const totalSafetyInspectionsForHeavyRail: number =
      heavyRailInspections.filter((inspection: Inspection) =>
        inspection.inspection_form.name.includes("Safety Inspection")
      ).length;

    const concludedLightRailInspections: number = lightRailInspections.filter(
      (inspection: Inspection) => isInspectionDone(inspection)
    ).length;
    const concludedHeavyRailInspections: number = heavyRailInspections.filter(
      (inspection: Inspection) => isInspectionDone(inspection)
    ).length;

    return res.status(200).json({
      totalInspections: inspectionsForDay.length,
      totalLightRailInspections: lightRailInspections.length,
      totalHeavyInspections: heavyRailInspections.length,
      concludedLightRailInspections,
      concludedHeavyRailInspections,
      totalEviInspectionsForLightRail,
      totalEviInspectionsForHeavyRail,
      totalPreTripInspectionsForLightRail,
      totalPreTripInspectionsForHeavyRail,
      totalCarHouseInspectionsForLightRail,
      totalCarHouseInspectionsForHeavyRail,
      totalSafetyInspectionsForLightRail,
      totalSafetyInspectionsForHeavyRail,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "internal server error", error: err });
  }
};

const isInspectionDone = (inspection: Inspection): boolean => {
  return (
    inspection.move.status === MoveStatus.done ||
    inspection.move.status === MoveStatus.cancelled ||
    inspection.move.status === MoveStatus.pending_move ||
    inspection.move.status === MoveStatus.pending_yardmaster_signature
  );
};
