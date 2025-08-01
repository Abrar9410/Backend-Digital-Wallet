import { Types } from "mongoose";

export enum Role {
    ADMIN = "ADMIN",
    USER = "USER",
    AGENT = "AGENT"
};

export enum ActiveStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    BLOCKED = "BLOCKED"
};

export enum AgentStatus {
    APPROVED = "APPROVED",
    SUSPENDED = "SUSPENDED",
    REQUESTED = "REQUESTED",
    NOT_APPLIED = "N/A",
};

export interface IUser {
    _id?: Types.ObjectId;
    name: string;
    email: string;
    password?: string;
    phone?: string;
    picture?: string;
    address?: string;
    isDeleted?: boolean;
    activeStatus?: ActiveStatus;
    agentStatus?: AgentStatus;
    // isVerified?: boolean;
    role: Role;
};