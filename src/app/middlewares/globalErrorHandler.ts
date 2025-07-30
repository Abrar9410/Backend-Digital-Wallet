/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";
import { handleDuplicateError } from "../errorHelpers/handleDuplicateError";
import { handleCastError } from "../errorHelpers/handleCastError";
import { handleValidationError } from "../errorHelpers/handleValidationError";
import { handleZodError } from "../errorHelpers/handleZodError";
import { IErrorSources } from "../interfaces/error.types";



export const globalErrorHandler = async (err: any, req: Request, res: Response, next: NextFunction) => {

    if (envVars.NODE_ENV === "development") {
        console.log(err);
    };
    
    let statusCode = 500;
    let message = `Something went wrong!! ${err.message}`;
    let errorSources: IErrorSources[] = [];

    if (err.code === 11000) {   // Duplicate Error Handling
        const simplifiedError = handleDuplicateError(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
    }
    else if (err.name === "CastError") {    // Object ID Error / Cast Error Handling
        const simplifiedError = handleCastError(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
    }
    else if (err.name === "ValidationError") {    // Validation Error Handling
        const simplifiedError = handleValidationError(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorSources = simplifiedError.errorSources as IErrorSources[];
    }
    else if (err.name === "ZodError") {    // Zod Error Handling
        const simplifiedError = handleZodError(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorSources = simplifiedError.errorSources as IErrorSources[];
    }
    else if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    }
    else if (err instanceof Error) {
        statusCode = 500;
        message = err.message
    };

    res.status(statusCode).send({
        success: false,
        message,
        errorSources,
        err: envVars.NODE_ENV === "development" ? err : null,
        stack: envVars.NODE_ENV === "development" ? err.stack : null
    });
};