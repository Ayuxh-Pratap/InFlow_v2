import { HTTPSTATUS } from "../config/http.config";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { Request, Response, NextFunction } from "express";
import { getCurrentUserService } from "../services/user.service";

export const getCurrentUserController = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id;

    const user = await getCurrentUserService(userId);
    res.status(HTTPSTATUS.OK).json({ message: "User fetched successfully", user });
});