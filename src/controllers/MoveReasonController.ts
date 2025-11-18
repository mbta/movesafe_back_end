import { Request, Response } from 'express';
import { MoveReason, Tag } from '../models';
import { FindOptions } from 'sequelize';

export const getAll = async (req: Request, res: Response) => {
    try {
        const { is_satellite_yard } = req.query;

        let query: FindOptions<MoveReason> = {
            attributes: ['id', 'name'],
            include: [{ model: Tag, attributes: ['id', 'name'] }]
        }

        if (is_satellite_yard === "true") {
            query = {
                ...query,
                where: {
                    is_available_satellite_yards: true
                },
            }
        }
        const moveReasons: MoveReason[] = await MoveReason.findAll(query);

        return res.json(moveReasons);
    } catch (err) {
        return res.status(500).json({ message: "internal server error", error: err });
    }
}