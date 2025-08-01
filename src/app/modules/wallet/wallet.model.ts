import { model, Schema } from "mongoose";
import { IWallet } from "./wallet.interface";
import { ActiveStatus } from "../user/user.interface";


const walletSchema = new Schema<IWallet>({
    ownerId: { type: Schema.Types.ObjectId, ref: "Users", required: true, unique: true },
    owner_email: { type: String, required: true, unique: true },
    isDeleted: { type: Boolean, default: false },
    activeStatus: {
        type: String,
        enum: Object.values(ActiveStatus),
        default: ActiveStatus.ACTIVE
    },
    balance: { type: Number, default: parseFloat(parseFloat("50").toFixed(2)) }
}, {
    timestamps: true,
    versionKey: false
});


export const Wallets = model<IWallet>("Wallets", walletSchema);