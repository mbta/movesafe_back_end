import { Request, Response } from 'express';

import { Line } from "../models";
import { UserRoles } from '../enum/userRoles.enum';

export const getAll = async (req: Request, res: Response) => {
    try {
        const { userGroups } = req.headers;

        if (!userGroups || !Array.isArray(userGroups) || !userGroups.length) return res.status(401).json({
            error: 'Unauthorized',
            message: 'Authentication is required to access this resource.',
        });

        const allLines: Line[] = await Line.findAll({
            attributes: ['id', 'name', 'is_light_rail']
        });

        if (userGroups?.includes(UserRoles.manager_all_lines)) {
            return res.json(allLines);
        }

        const allowedLines: Line[] = allLines.filter(line => {
            return !!userGroups?.find((g: string) => g.includes(line.name))
        });

        return res.json(allowedLines);
    } catch (err) {
        return res.status(500).json({ message: "internal server error", error: err });
    }
}