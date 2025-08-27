import { Types } from "mongoose";


export enum TransactionType {
    TOP_UP = "TOP_UP",
    WITHDRAW_MONEY = "WITHDRAW_MONEY",
    CASH_IN = "CASH_IN",
    CASH_OUT = "CASH_OUT",
    SEND_MONEY = "SEND_MONEY",
};

export interface ITransaction {
    _id?: Types.ObjectId;
    type: TransactionType;
    from: string;
    to: string;
    transactionId: string;
    amount: number;
    fee?: number;
    commission?: number;
};