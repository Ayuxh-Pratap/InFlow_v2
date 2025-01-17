import { ErrorRequestHandler, Response } from "express";
import { HTTPSTATUS } from "../config/http.config";
import { AppError } from "../utils/appError";
import { z, ZodError } from "zod";
import { ErrorCodeEnum } from "../enums/error-code.enum";

const formatZodError = (res: Response, err: z.ZodError) => {
    const errors = err?.issues?.map((err) => ({
        field: err.path.join("."),
        message: err.message,
        code: ErrorCodeEnum.VALIDATION_ERROR,
    }));
    return res.status(HTTPSTATUS.BAD_REQUEST).json({
        message: "validation error",
        errors,
    });
}

export const errorHandler: ErrorRequestHandler = (err, req, res, next): any => {

    console.error(`error occured on path ${req.path}`, err);

    if (err instanceof SyntaxError) {
        return res.status(HTTPSTATUS.BAD_REQUEST).json({
            message: "invalid json",
            error: err.message || "unknown error",
        });
    }

    if (err instanceof ZodError) {
        return formatZodError(res, err);
    }

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            message: err.message,
            errorCode: err.errorCode,
        });
    }

    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
        message: "internal server error",
        error: err.message || "unknown error",
    });
}