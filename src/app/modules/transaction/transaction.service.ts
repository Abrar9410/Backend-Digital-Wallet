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
    ]);

    return {
        data,
        meta
    };
};

const getMyTransactionsService = async ( query: Record<string, string>, userEmail: string ) => {
    
    const searchTerm = query.searchTerm || "";
    const sort = query.sort || "-createdAt";
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const type = query.type || "";

    // Base query: transactions where user is either sender or receiver
    const baseQuery: Record<string, unknown> = {
        $or: [{ from: userEmail }, { to: userEmail }],
    };

    let searchCondition = {};
    if (searchTerm) {
        searchCondition = {
            $or: [
                { transactionId: { $regex: searchTerm, $options: "i" } },
                { from: { $regex: searchTerm, $options: "i" } },
                { to: { $regex: searchTerm, $options: "i" } },
            ],
        };
    }

    // Build full filter object
    const filter = { $and: [baseQuery] };

    if (type) {
        filter.$and.push({ type });
    };

    if (searchTerm) {
        filter.$and.push(searchCondition);
    };
    
    const total = await Transactions.countDocuments(filter);
    const skip = (page - 1) * limit;

    const data = await Transactions.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();

    const meta = {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };

    return {
        data,
        meta
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