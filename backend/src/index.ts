import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import session from "cookie-session"
import { config } from "./config/app.config";
import connectDatabase from "./config/db.config";
import { HTTPSTATUS } from "./config/http.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { asyncHandler } from "./middlewares/asyncHandler.middleware";
import { BadRequestException } from "./utils/appError";

import "./config/passport.config";
import passport from "passport";
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.route";
import isAuthenticated from "./middlewares/isAuthenticated.middleware";

const app = express();
const BASE_PATH = config.BASE_PATH

app.use(express.json());

app.use(express.urlencoded({ extended: true }));  // for parsing application/x-www-form-urlencoded 

app.use(
    session({
        name: "session",
        keys: [config.SESSION_SECRET],
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        secure: config.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "lax",
    })
)

app.use(passport.initialize());
app.use(passport.session());

app.use(
    cors({
        origin: config.FRONTEND_ORIGIN,
        credentials: true,
    }));

app.get("/", asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    throw new BadRequestException("Bad Request");
    res.status(HTTPSTATUS.OK).json({ message: "Hello World!" });
}));

app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/user`, isAuthenticated , userRoutes);

app.use(errorHandler)

app.listen(config.PORT, async () => {
    console.log(`Server is running on port ${config.PORT}`);
    await connectDatabase();
});