/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { WalletServices } from "./wallet.service";
import httpStatus from "http-status-codes";
import { sendResponse } from "../../utils/sendResponse";
import { JwtPayload } from "jsonwebtoken";


const getAllWallets = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;

    const result = await WalletServices.getAllWalletsService(query as Record<string, string>);
    
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Retrieved All Wallets Successfully!",
            data: result.data,
            meta: result.meta
        });
});

const getMyWallet = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const result = await WalletServices.getMyWalletService(decodedToken.userId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Your Wallet Retrieved Successfully!",
        data: result.data
    });
});

const getSingleWallet = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const walletId = req.params.walletId;
    const result = await WalletServices.getSingleWalletService(walletId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Wallet Retrieved Successfully",
        data: result.data
    });
});

const addMoney = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const amount = req.body.amount;
    const result = await WalletServices.addMoneyService(decodedToken.userId, amount);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Top-Up Successful!",
        data: {newBalance: result}
    });
});

const cashIn = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const userEmail = req.params.userEmail;
    const amount = req.body.amount;
    const result = await WalletServices.cashInService(decodedToken, userEmail, amount);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Cash-In Successful!",
        data: { newBalance: result }
    });
});

const cashOut = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const userEmail = req.params.userEmail;
    const amount = req.body.amount;
    const result = await WalletServices.cashOutService(decodedToken, userEmail, amount);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Cash-Out Successful!",
        data: { newBalance: result }
    });
});

const sendMoney = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const receiverEmail = req.params.receiverEmail;
    const amount = req.body.amount;
    const result = await WalletServices.sendMoneyService(decodedToken, receiverEmail, amount);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Money Sent Successfully!",
        data: { newBalance: result }
    });
});

const updateWallet = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const payload = req.body;
    const updatedWallet = await WalletServices.updateWalletService(id, payload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Wallet Updated Successfully!",
        data: updatedWallet
    });
});


export const WalletControllers = {
    getAllWallets,
    getMyWallet,
    getSingleWallet,
    addMoney,
    cashIn,
    cashOut,
    sendMoney,
    updateWallet
};