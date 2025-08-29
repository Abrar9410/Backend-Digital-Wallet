/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes"
import { UserServices } from "./user.service";
import catchAsync from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { JwtPayload } from "jsonwebtoken";



const createUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserServices.createUserService(req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User Created Successfully!",
        data: user
    });
});

const updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    const verifiedToken = req.user;
    const payload = req.body;
    const updatedUser = await UserServices.updateUserService(userId, payload, verifiedToken as JwtPayload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User Updated Successfully!",
        data: updatedUser
    });
});

const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    
    const result = await UserServices.getAllUsersService(query as Record<string, string>);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Retrieved All Users Successfully!",
        data: result.data,
        meta: result.meta
    });
});

const getAgentRequests = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    
    const result = await UserServices.getAgentRequestsService(query as Record<string, string>);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Retrieved All Agent Requests Successfully!",
        data: result.data,
        meta: result.meta
    });
});

const getMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload
    const result = await UserServices.getMeService(decodedToken.userId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Your profile Retrieved Successfully!",
        data: result.data
    });
});

const agentRequest = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;

    await UserServices.agentRequestService(decodedToken.userId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Your Request to become an Agent is now being Processed!",
        data: null
    });
});

const getSingleUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const result = await UserServices.getSingleUserService(id);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User Retrieved Successfully",
        data: result.data
    })
});

const agentApproval = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    
    await UserServices.agentApprovalService(userId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Agent-Request Approved Successfully!",
        data: null
    });
});

const agentDenial = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    
    await UserServices.agentDenialService(userId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Agent-Request Denied Successfully!",
        data: null
    });
});

export const UserControllers = {
    createUser,
    updateUser,
    getAllUsers,
    getAgentRequests,
    getMe,
    agentRequest,
    getSingleUser,
    agentApproval,
    agentDenial
};