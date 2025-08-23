/* eslint-disable @typescript-eslint/no-non-null-assertion */
import AppError from "../../errorHelpers/AppError";
import { AgentStatus, IUser, Role } from "./user.interface";
import { Users } from "./user.model";
import httpStatus from "http-status-codes";
import bcryptjs from "bcryptjs";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { userSearchableFields } from "./user.constant";
import { Wallets } from "../wallet/wallet.model";


const createUserService = async (payload: Partial<IUser>) => {
    const { email, password, role, ...rest } = payload;

    const user = await Users.findOne({email});

    if (user) {
        throw new AppError(httpStatus.BAD_REQUEST, "User Already Exists!");
    };

    const hashedPassword = await bcryptjs.hash(password as string, Number(envVars.SALT));

    const newUser = await Users.create({
        email,
        password: hashedPassword,
        agentStatus: role === Role.AGENT ? AgentStatus.REQUESTED : AgentStatus.NOT_APPLIED,
        ...rest
    });

    await Wallets.create({
        ownerId: newUser._id,
        owner_email: newUser.email
    });

    return newUser;
};

const updateUserService = async (userId: string, payload: Partial<IUser>, decodedToken: JwtPayload) => {
    /**
     * email - cannot be updated -> already taken care of using zod schema
     * name, phone, address
     * Only ADMIN can update -> role, isDeleted, activeStatus: BLOCKED
     */

    const user = await Users.findById(userId).select("-password");
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User Not Found!");
    };

    if (decodedToken.role === Role.USER || decodedToken.role === Role.AGENT) {
        if (userId !== decodedToken.userId) {
            throw new AppError(httpStatus.FORBIDDEN, "You are Unauthorized to Update another user's Profile!");
        };
    };

    if (payload.role || payload.agentStatus) {
        if (decodedToken.role === Role.USER || decodedToken.role === Role.AGENT) {
            throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to update Role or Agent-Status!");
        };

        throw new AppError(httpStatus.NOT_ACCEPTABLE, "Role and Agent-Status can Not be Updated through this Route!");
    };

    if (payload.activeStatus || payload.isDeleted /*|| payload.isVerified*/) {
        if (decodedToken.role === Role.USER || decodedToken.role === Role.AGENT) {
            throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to update this property(s)!");
        };
    };

    if (payload.password) {
        throw new AppError(httpStatus.NOT_ACCEPTABLE, "Password Can Not be Updated on this Route! If You Want to Change Your Password then Go to 'auth/change-password' Route");
    };

    const updatedUser = await Users.findByIdAndUpdate(userId, payload, {new: true, runValidators: true});

    return updatedUser;
};

const getAllUsersService = async (query: Record<string, string>) => {

    const queryBuilder = new QueryBuilder(Users.find().select("-password"), query)
    const usersData = queryBuilder
        .filter()
        .search(userSearchableFields)
        .sort()
        .fields()
        .paginate();

    const [data, meta] = await Promise.all([
        usersData.build(),
        queryBuilder.getMeta()
    ])

    return {
        data,
        meta
    }
};

const getAgentRequestsService = async (query: Record<string, string>) => {

    const queryBuilder = new QueryBuilder(Users.find({agentStatus: AgentStatus.REQUESTED}).select("-password"), query)
    const usersData = queryBuilder
        .filter()
        .search(userSearchableFields)
        .sort()
        .fields()
        .paginate();

    const [data, meta] = await Promise.all([
        usersData.build(),
        queryBuilder.getMeta()
    ])

    return {
        data,
        meta
    }
};

const getMeService = async (userId: string) => {
    const user = await Users.findById(userId);
    
    return {
        data: user
    };
};

const agentRequestService = async (id: string) => {
    const user = await Users.findById(id);

    if (user!.agentStatus === AgentStatus.REQUESTED) {
        throw new AppError(httpStatus.BAD_REQUEST, "You have already requested to become an Agent!");
    };

    if (user!.agentStatus === AgentStatus.SUSPENDED) {
        throw new AppError(httpStatus.BAD_REQUEST, "You are currently a SUSPENDED Agent! Please contact Admin for details.");
    };

    user!.agentStatus = AgentStatus.REQUESTED;

    await user!.save();
};

const getSingleUserService = async (id: string) => {
    const user = await Users.findById(id).select("-password");

    return {
        data: user
    };
};

const agentApprovalService = async (userId: string, payload: Partial<IUser>) => {
    const user = await Users.findById(userId);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User Not Found!");
    };

    if (payload.agentStatus === AgentStatus.APPROVED) {
        payload.role = Role.AGENT;
    } else {
        payload.role = Role.USER
    };

    user.role = payload.role;
    user.agentStatus = payload.agentStatus;

    await user.save();
};

export const UserServices = {
    createUserService,
    updateUserService,
    getAllUsersService,
    getAgentRequestsService,
    getMeService,
    agentRequestService,
    getSingleUserService,
    agentApprovalService
};