import { Response } from "express";
import { envVars } from "../config/env";


export interface AuthTokens {
    token?: string;
    refreshToken?: string;
}

export const setAuthCookie = (res: Response, tokenInfo: AuthTokens) => {
    if (tokenInfo.token) {
        res.cookie("token", tokenInfo.token, {
            httpOnly: true,
            secure: envVars.NODE_ENV === "production",
            sameSite: "none"
        });
    };

    if (tokenInfo.refreshToken) {
        res.cookie("refreshToken", tokenInfo.refreshToken, {
            httpOnly: true,
            secure: envVars.NODE_ENV === "production",
            sameSite: "none"
        });
    };
};