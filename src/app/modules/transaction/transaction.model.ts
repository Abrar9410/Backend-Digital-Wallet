import { model, Schema } from "mongoose";
import { ITransaction, TransactionType } from "./transaction.interface";


const transactionSchema = new Schema<ITransaction>({
    type: {
        type: String,
        enum: TransactionType,
        required: true
    },
    from: { type: String, required: true },
    to: { type: String, required: true },
    transactionId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    fee: { type: Number },
    commission: { type: Number }
}, {
    timestamps: true,
    versionKey: false
});


export const Transactions = model<ITransaction>("Transactions", transactionSchema);