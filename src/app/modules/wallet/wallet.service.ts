/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorHelpers/AppError";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { ActiveStatus, AgentStatus, Role } from "../user/user.interface";
import { walletSearchableFields } from "./wallet.constant";
import { Wallets } from "./wallet.model";
import httpStatus from "http-status-codes";
import { IWallet } from "./wallet.interface";
import { getTransactionId } from "../../utils/getTransactionId";
import { Transactions } from "../transaction/transaction.model";
import { TransactionType } from "../transaction/transaction.interface";
import { Users } from "../user/user.model";


const getAllWalletsService = async (query: Record<string, string>) => {

    const queryBuilder = new QueryBuilder(Wallets.find(), query)
    const walletsData = queryBuilder
        .filter()
        .search(walletSearchableFields)
        .sort()
        .fields()
        .paginate();

    const [data, meta] = await Promise.all([
        walletsData.build(),
        queryBuilder.getMeta()
    ])

    return {
        data,
        meta
    }
};

const getMyWalletService = async (walletId: string) => {
    const wallet = await Wallets.findById(walletId);

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
    if (amount <= 0) {
        throw new AppError(httpStatus.NOT_ACCEPTABLE, "Please Provide a Positive Amount! Amount Can Not be 0 or negative.");
    };

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

    const transactionId = getTransactionId();

    await Transactions.create({
        type: TransactionType.TOP_UP,
        transactionId,
        from: "Bank",
        to: wallet.owner_email,
        amount
    });

    await wallet.save();

    return wallet.balance;
};

const depositMoneyService = async (userId: string, agentEmail: string, amount: number) => {
    const agent = await Users.findOne({email: agentEmail});

    if (!agent || agent.role !== Role.AGENT) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Sorry! No Agent Found with this Email Address. Please provide an Agent's Email or pay a visit to one."
        );
    };

    if (agent.agentStatus !== AgentStatus.APPROVED) {
        throw new AppError(
            httpStatus.SERVICE_UNAVAILABLE,
            "Sorry! This Agent is currently Not Approved to handle Transaction. Please Contact another Agent for your Service."
        );
    };

    if (amount <= 0) {
        throw new AppError(httpStatus.NOT_ACCEPTABLE, "Please Provide a Positive Amount! Amount Can Not be 0 or negative.");
    };

    const userWallet = await Wallets.findOne({ ownerId: userId });

    if (!userWallet) {
        throw new AppError(httpStatus.NOT_FOUND, "Wallet Not Found! Please Contact Admin Immediately!");
    };

    if (userWallet!.activeStatus === ActiveStatus.BLOCKED) {
        throw new AppError(httpStatus.BAD_REQUEST, "Your Wallet is Blocked! Please Contact Admin for Details.");
    };

    if (userWallet!.isDeleted) {
        throw new AppError(httpStatus.BAD_REQUEST, "Your Wallet is Deleted! Please Contact Admin for Details.");
    };

    const agentWallet = await Wallets.findOne({ owner_email: agentEmail });
    
    if (!agentWallet) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Agent's Wallet Not Found! Please Notify this Agent or Provide another Agent's Email!"
        );
    };

    if (agentWallet!.activeStatus === ActiveStatus.BLOCKED) {
        throw new AppError(
            httpStatus.NOT_ACCEPTABLE,
            "This Agent's Wallet is Blocked! Please Notify this Agent or Provide another Agent's Email!"
        );
    };

    if (agentWallet!.isDeleted) {
        throw new AppError(
            httpStatus.NOT_ACCEPTABLE,
            "This Agent's Wallet is Deleted! Please Notify this Agent or Provide another Agent's Email!"
        );
    };

    if (amount > agentWallet.balance!) {
        throw new AppError(
            httpStatus.NOT_ACCEPTABLE,
            "Sorry! This Agent does not have enough Balance. You can notify this Agent or try another one."
        );
    };

    userWallet!.balance = parseFloat(((userWallet!.balance as number) + amount).toFixed(2));
    agentWallet!.balance = parseFloat(((agentWallet!.balance as number) - amount).toFixed(2));

    const transactionId = getTransactionId();

    await Transactions.create({
        type: TransactionType.CASH_IN,
        transactionId,
        from: agentEmail,
        to: userWallet.owner_email,
        amount
    });

    await userWallet.save();
    await agentWallet.save();

    return userWallet.balance;
};

const withdrawMoneyService = async (userId: string, agentEmail: string, amount: number) => {
    const agent = await Users.findOne({email: agentEmail});

    if (!agent || agent.role !== Role.AGENT) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Sorry! No Agent Found with this Email Address. Please provide an Agent's Email or pay a visit to one."
        );
    };
    
    if (agent.agentStatus !== AgentStatus.APPROVED) {
        throw new AppError(
            httpStatus.SERVICE_UNAVAILABLE,
            "Sorry! This Agent is currently Not Approved to handle Transaction. Please Contact another Agent for your Service."
        );
    };

    if (amount <= 0) {
        throw new AppError(httpStatus.NOT_ACCEPTABLE, "Please Provide a Positive Amount! Amount Can Not be 0 or negative.");
    };

    const userWallet = await Wallets.findOne({ ownerId: userId });

    if (!userWallet) {
        throw new AppError(httpStatus.NOT_FOUND, "Wallet Not Found! Please Contact Admin Immediately!");
    };

    if (userWallet!.activeStatus === ActiveStatus.BLOCKED) {
        throw new AppError(httpStatus.BAD_REQUEST, "Your Wallet is Blocked! Please Contact Admin for Details.");
    };

    if (userWallet!.isDeleted) {
        throw new AppError(httpStatus.BAD_REQUEST, "Your Wallet is Deleted! Please Contact Admin for Details.");
    };
    
    if (amount > userWallet.balance!) {
        throw new AppError(
            httpStatus.NOT_ACCEPTABLE,
            "Insufficient Balance! You are Trying to Withdraw more money than your Account Balance."
        );
    };

    const agentWallet = await Wallets.findOne({ owner_email: agentEmail });
    
    if (!agentWallet) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Agent's Wallet Not Found! Please Notify this Agent or Provide another Agent's Email!"
        );
    };

    if (agentWallet!.activeStatus === ActiveStatus.BLOCKED) {
        throw new AppError(
            httpStatus.NOT_ACCEPTABLE,
            "This Agent's Wallet is Blocked! Please Notify this Agent or Provide another Agent's Email!"
        );
    };

    if (agentWallet!.isDeleted) {
        throw new AppError(
            httpStatus.NOT_ACCEPTABLE,
            "This Agent's Wallet is Deleted! Please Notify this Agent or Provide another Agent's Email!"
        );
    };

    userWallet!.balance = parseFloat(((userWallet!.balance as number) - amount).toFixed(2));
    agentWallet!.balance = parseFloat(((agentWallet!.balance as number) + amount).toFixed(2));

    const transactionId = getTransactionId();

    await Transactions.create({
        type: TransactionType.CASH_OUT,
        transactionId,
        from: userWallet.owner_email,
        to: agentEmail,
        amount
    });

    await userWallet.save();
    await agentWallet.save();

    return userWallet.balance;
};

const cashInService = async (decodedToken: JwtPayload, userEmail: string, amount: number) => {
    if (amount <= 0) {
        throw new AppError(httpStatus.NOT_ACCEPTABLE, "Please Provide a Positive Amount! Amount Can Not be 0 or negative.");
    };

    const agentWallet = await Wallets.findOne({ownerId: decodedToken.userId});

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

    agentWallet!.balance = parseFloat(((agentWallet!.balance as number) - amount).toFixed(2));
    userWallet!.balance = parseFloat(((userWallet!.balance as number) + amount).toFixed(2));

    const transactionId = getTransactionId();

    await Transactions.create({
        type: TransactionType.CASH_IN,
        transactionId,
        from: agentWallet.owner_email,
        to: userWallet.owner_email,
        amount
    });

    await agentWallet.save();
    await userWallet.save();

    return agentWallet.balance;
};

const cashOutService = async (decodedToken: JwtPayload, userEmail: string, amount: number) => {
    if (amount <= 0) {
        throw new AppError(httpStatus.NOT_ACCEPTABLE, "Please Provide a Positive Amount! Amount Can Not be 0 or negative.");
    };

    const agentWallet = await Wallets.findOne({ ownerId: decodedToken.userId });

    if (!agentWallet) {
        throw new AppError(httpStatus.NOT_FOUND, "Wallet Not Found! Please Contact Admin Immediately!");
    };

    if (agentWallet!.activeStatus === ActiveStatus.BLOCKED) {
        throw new AppError(httpStatus.BAD_REQUEST, "Your Wallet is Blocked! Please Contact Admin for Details.");
    };

    if (agentWallet!.isDeleted) {
        throw new AppError(httpStatus.BAD_REQUEST, "Your Wallet is Deleted! Please Contact Admin for Details.");
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

    if (userWallet.balance! < amount) {
        throw new AppError(httpStatus.BAD_REQUEST, "User Does Not Enough Balance!");
    };

    userWallet!.balance = parseFloat(((userWallet!.balance as number) - amount).toFixed(2));
    agentWallet!.balance = parseFloat(((agentWallet!.balance as number) + amount).toFixed(2));

    const transactionId = getTransactionId();

    await Transactions.create({
        type: TransactionType.CASH_OUT,
        transactionId,
        from: userWallet.owner_email,
        to: agentWallet.owner_email,
        amount
    });

    await userWallet.save();
    await agentWallet.save();

    return agentWallet.balance;
};

const sendMoneyService = async (decodedToken: JwtPayload, userEmail: string, amount: number) => {
    if (amount <= 0) {
        throw new AppError(httpStatus.NOT_ACCEPTABLE, "Please Provide a Positive Amount! Amount Can Not be 0 or negative.");
    };

    const senderWallet = await Wallets.findOne({owner_email: decodedToken.email});

    if (!senderWallet) {
        throw new AppError(httpStatus.NOT_FOUND, "Wallet Not Found! Please Contact Admin Immediately!");
    };

    if (senderWallet!.activeStatus === ActiveStatus.BLOCKED) {
        throw new AppError(httpStatus.BAD_REQUEST, "Your Wallet is Blocked! Please Contact Admin for Details.");
    };

    if (senderWallet!.isDeleted) {
        throw new AppError(httpStatus.BAD_REQUEST, "Your Wallet is Deleted! Please Contact Admin for Details.");
    };

    if (senderWallet.balance! < amount) {
        throw new AppError(httpStatus.BAD_REQUEST, "Not Enough Balance! Please Recharge.");
    };

    const receiverWallet = await Wallets.findOne({ owner_email: userEmail });

    if (!receiverWallet) {
        throw new AppError(httpStatus.NOT_FOUND, "Account Does Not Exist! Money Can Not be Sent!");
    };

    if (receiverWallet!.activeStatus === ActiveStatus.BLOCKED) {
        throw new AppError(httpStatus.BAD_REQUEST, "User Wallet is Blocked! Money Can Not be Sent.");
    };

    if (receiverWallet!.isDeleted) {
        throw new AppError(httpStatus.BAD_REQUEST, "User Wallet is Deleted! Money Can Not be Sent.");
    };

    senderWallet!.balance = parseFloat(((senderWallet!.balance as number) - amount).toFixed(2));
    receiverWallet!.balance = parseFloat(((receiverWallet!.balance as number) + amount).toFixed(2));

    const transactionId = getTransactionId();

    await Transactions.create({
        type: TransactionType.SEND_MONEY,
        transactionId,
        from: senderWallet.owner_email,
        to: receiverWallet.owner_email,
        amount
    });

    await senderWallet.save();
    await receiverWallet.save();

    return senderWallet.balance;
};

const updateWalletService = async (id: string, payload: Partial<IWallet>) => {
    const wallet = await Wallets.findById(id);
    if (!wallet) {
        throw new AppError(httpStatus.NOT_FOUND, "Wallet Not Found!");
    };

    const updatedWallet = await Wallets.findByIdAndUpdate(id, payload, { new: true, runValidators: true });

    return updatedWallet;
};


export const WalletServices = {
    getAllWalletsService,
    getMyWalletService,
    getSingleWalletService,
    addMoneyService,
    depositMoneyService,
    withdrawMoneyService,
    cashInService,
    cashOutService,
    sendMoneyService,
    updateWalletService
};