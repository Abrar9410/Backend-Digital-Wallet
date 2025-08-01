/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorHelpers/AppError";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { ActiveStatus } from "../user/user.interface";
import { walletSearchableFields } from "./wallet.constant";
import { Wallets } from "./wallet.model";
import httpStatus from "http-status-codes";


const getAllWalletsService = async (query: Record<string, string>) => {

    const queryBuilder = new QueryBuilder(Wallets.find(), query)
    const usersData = queryBuilder
        .filter()
        .search(walletSearchableFields)
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

const getMyWalletService = async (userId: string) => {
    const wallet = await Wallets.findOne({ ownerId: userId });

    return {
        data: wallet
    };
};

const getSingleWalletService = async (ownerEmail: string) => {
    const wallet = await Wallets.findOne({ owner_email: ownerEmail });

    return {
        data: wallet
    };
};

const addMoneyService = async (userId: string, amount: number) => {
    const wallet = await Wallets.findOne({ ownerId: userId });

    if (!wallet) {
        throw new AppError(httpStatus.NOT_FOUND, "Wallet Not Found! Please Contact Admin Immediately!");
    };

    if (wallet!.activeStatus === ActiveStatus.BLOCKED) {
        throw new AppError(httpStatus.BAD_REQUEST, "Your Wallet is Blocked! Please Contact Admin for Details.");
    };

    if (wallet!.isDeleted) {
        throw new AppError(httpStatus.BAD_REQUEST, "Your Wallet is Deleted! Please Contact Admin for Details.");
    };

    wallet!.balance = parseFloat(((wallet!.balance as number) + amount).toFixed(2));

    await wallet.save();

    return wallet.balance;
};

const cashInService = async (decodedToken: JwtPayload, userEmail: string, amount: number) => {
    const agentWallet = await Wallets.findById(decodedToken.userId);

    if (!agentWallet) {
        throw new AppError(httpStatus.NOT_FOUND, "Wallet Not Found! Please Contact Admin Immediately!");
    };

    if (agentWallet!.activeStatus === ActiveStatus.BLOCKED) {
        throw new AppError(httpStatus.BAD_REQUEST, "Your Wallet is Blocked! Please Contact Admin for Details.");
    };

    if (agentWallet!.isDeleted) {
        throw new AppError(httpStatus.BAD_REQUEST, "Your Wallet is Deleted! Please Contact Admin for Details.");
    };

    if (agentWallet.balance! < amount) {
        throw new AppError(httpStatus.BAD_REQUEST, "Not Enough Balance! Please Contact Admin for Recharge.");
    };

    const userWallet = await Wallets.findOne({ owner_email: userEmail });

    if (!userWallet) {
        throw new AppError(httpStatus.NOT_FOUND, "Account Does Not Exist! Money Can Not be Sent!");
    };

    if (userWallet!.activeStatus === ActiveStatus.BLOCKED) {
        throw new AppError(httpStatus.BAD_REQUEST, "User Wallet is Blocked! Money Can Not be Sent.");
    };

    if (userWallet!.isDeleted) {
        throw new AppError(httpStatus.BAD_REQUEST, "User Wallet is Deleted! Money Can Not be Sent.");
    };

    agentWallet!.balance = parseFloat(((userWallet!.balance as number) - amount).toFixed(2));
    userWallet!.balance = parseFloat(((userWallet!.balance as number) + amount).toFixed(2));

    await agentWallet.save();
    await userWallet.save();

    // return wallet.balance;
};


export const WalletServices = {
    getAllWalletsService,
    getMyWalletService,
    getSingleWalletService,
    addMoneyService,
    cashInService,
};