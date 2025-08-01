import { Types } from "mongoose";
import { ActiveStatus } from "../user/user.interface";

export interface IWallet {
    _id?: Types.ObjectId;
    ownerId: Types.ObjectId;
    owner_email: string;
    activeStatus?: ActiveStatus;
    isDeleted?: boolean;
    balance?: number;
};