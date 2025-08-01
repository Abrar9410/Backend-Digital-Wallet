import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";
import { verifyToken } from "../utils/jwt";
import { Users } from "../modules/user/user.model";
import httpStatus from "http-status-codes";
import { ActiveStatus } from "../modules/user/user.interface";



export const checkAuth = (...authRoles: string[]) => async (req: Request, res: Response, next: NextFunction) => {

    try {
        const token = req.headers.authorization;

        if (!token) {
            throw new AppError(401, "Unauthorized Access!")
        };

        const verifiedToken = verifyToken(token, envVars.JWT_SECRET) as JwtPayload;

        const user = await Users.findOne({ email: verifiedToken.email });

        if (!user) {
            throw new AppError(httpStatus.BAD_REQUEST, "User Does Not Exist!");
        };

        // if (!user.isVerified) {
        //     throw new AppError(httpStatus.BAD_REQUEST, "User is Not Verified!");
        // };

        if (user.activeStatus === ActiveStatus.BLOCKED || user.activeStatus === ActiveStatus.INACTIVE) {
            throw new AppError(httpStatus.BAD_REQUEST, `User is ${user.activeStatus}!`);
        };

        if (user.isDeleted) {
            throw new AppError(httpStatus.BAD_REQUEST, "User is Deleted!");
        };
        
        if (!authRoles.includes(verifiedToken.role)) {
            throw new AppError(403, "Forbidden!!! You are not permitted to view this route!");
        };
        
        req.user = verifiedToken;
        
        next();
    } catch (error) {
        next(error)
    }
};