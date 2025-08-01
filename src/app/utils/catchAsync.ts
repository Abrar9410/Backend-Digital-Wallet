/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env";


type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

const catchAsync = (fn: AsyncHandler) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err: any) => {
        if (envVars.NODE_ENV === "development") {
            console.log(err);
        };
        next(err)
    });
};

export default catchAsync;