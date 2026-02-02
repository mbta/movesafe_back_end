import { Response } from "express";

const AUTH_ERRORS = {
  401: "Unauthorized",
  403: "Forbidden",
  500: "Internal Server Error",
};

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export const authErrorResponse = (res: Response, error: unknown) => {
  if (error instanceof UnauthorizedError) {
    return res
      .status(401)
      .json({ error: AUTH_ERRORS[401], message: error.message });
  } else if (error instanceof ForbiddenError) {
    return res
      .status(403)
      .json({ error: AUTH_ERRORS[403], message: error.message });
  } else {
    return res.status(500).json({
      error: AUTH_ERRORS[500],
      message: "An unexpected error occurred.",
    });
  }
};
