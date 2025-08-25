/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { AuthServices } from "./auth.service";
import AppError from "../../errorHelpers/AppError";
import { setAuthCookie } from "../../utils/setCookie";
import { createUserTokens } from "../../utils/userTokens";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";


const credentialsLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    
    const loginInfo = await AuthServices.credentialsLoginService(req.body);

    setAuthCookie(res, loginInfo);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User Logged In Successfully!",
        data: loginInfo
    });
});

const getNewToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        throw new AppError(httpStatus.BAD_REQUEST, "No Refresh Token was received from cookies!")
    };

    const tokenInfo = await AuthServices.getNewTokenService(refreshToken);

    setAuthCookie(res, tokenInfo);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "New Token Received Successfully!",
        data: tokenInfo
    });
});

const logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    
    res.clearCookie("token", {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    });
    
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    });

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User Logged Out Successfully!",
        data: null
    });
});

const changePassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const decodedToken = req.user;
    const oldPassword = req.body.oldPassword || "";
    const newPassword = req.body.newPassword;

    await AuthServices.changePasswordService(decodedToken as JwtPayload, oldPassword, newPassword); 

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Password has been reset Successfully!",
        data: null
    });
});

export const AuthControllers = {
    credentialsLogin,
    getNewToken,
    logout,
    changePassword
};