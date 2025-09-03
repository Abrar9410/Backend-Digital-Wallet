/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { TransactionServices } from "./transaction.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";



const getAllTransactions = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;

    const result = await TransactionServices.getAllTransactionsService(query as Record<string, string>);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Retrieved All Transactions Successfully!",
        data: result.data,
        meta: result.meta
    });
});

const getMyTransactions = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const decodedToken = req.user as JwtPayload;
    const result = await TransactionServices.getMyTransactionsService(query as Record<string, string>, decodedToken.email);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Your Transactions Retrieved Successfully!",
        data: result.data,
        meta: result.meta
    });
});

const getSingleTransaction = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const decodedToken = req.user as JwtPayload;
    const result = await TransactionServices.getSingleTransactionService(id, decodedToken);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Transaction Retrieved Successfully!",
        data: result
    });
});


export const TransactionControllers = {
    getAllTransactions,
    getMyTransactions,
    getSingleTransaction
};