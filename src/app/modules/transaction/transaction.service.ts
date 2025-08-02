/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { JwtPayload } from "jsonwebtoken";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { transactionSearchableFields } from "./transaction.constant";
import { Transactions } from "./transaction.model";
import { Role } from "../user/user.interface";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";



const getAllTransactionsService = async (query: Record<string, string>) => {

    const queryBuilder = new QueryBuilder(Transactions.find(), query)
    const transactionsData = queryBuilder
        .filter()
        .search(transactionSearchableFields)
        .sort()
        .fields()
        .paginate();

    const [data, meta] = await Promise.all([
        transactionsData.build(),
        queryBuilder.getMeta()
    ])

    return {
        data,
        meta
    }
};

const getMyTransactionsService = async (userEmail: string) => {
    const sentTransactions = await Transactions.find({from: userEmail});
    const receivedTransactions = await Transactions.find({to: userEmail});

    const myTransactions = [...sentTransactions, ...receivedTransactions];

    return {
        data: myTransactions
    };
};

const getSingleTransactionService = async (id: string, decodedToken: JwtPayload) => {
    const transaction = await Transactions.findById(id);

    if (decodedToken.role !== Role.ADMIN && decodedToken.email !== transaction!.from && decodedToken.email !== transaction!.to) {
        throw new AppError(httpStatus.FORBIDDEN, "You are Not Allowed to view this Transaction!");
    };

    return transaction;
};


export const TransactionServices = {
    getAllTransactionsService,
    getMyTransactionsService,
    getSingleTransactionService
};