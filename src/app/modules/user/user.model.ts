import { model, Schema } from "mongoose";
import { ActiveStatus, AgentStatus, IUser, Role } from "./user.interface";



const userSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: {
        type: String,
        enum: Object.values(Role),
        default: Role.USER
    },
    phone: { type: String },
    picture: { type: String },
    address: { type: String },
    isDeleted: { type: Boolean, default: false },
    activeStatus: {
        type: String,
        enum: Object.values(ActiveStatus),
        default: ActiveStatus.ACTIVE
    },
    agentStatus: {
        type: String,
        enum: Object.values(AgentStatus),
        default: AgentStatus.NOT_APPLIED
    },
    // isVerified: { type: Boolean, default: false },
}, {
    timestamps: true,
    versionKey: false
});


export const Users = model<IUser>("Users", userSchema);