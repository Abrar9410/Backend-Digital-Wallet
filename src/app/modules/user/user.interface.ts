import { Types } from "mongoose";

export enum Role {
    ADMIN = "ADMIN",
    USER = "USER",
    AGENT = "AGENT"
};

export enum activeStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    BLOCKED = "BLOCKED"
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
    activeStatus?: activeStatus;
    isVerified?: boolean;
    role: Role;
    balance: number;
};