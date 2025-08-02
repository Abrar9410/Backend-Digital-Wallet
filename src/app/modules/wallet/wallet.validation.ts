import z from "zod";
import { ActiveStatus, AgentStatus, Role } from "../user/user.interface";


export const updateWalletZodSchema = z.object({
    role: z
        .enum(Object.values(Role) as [string])
        .optional(),
    activeStatus: z
        .enum(Object.values(ActiveStatus) as [string])
        .optional(),
    isDeleted: z
        .boolean({ error: "isDeleted must be true or false" })
        .optional(),
    agentStatus: z
        .enum(Object.values(AgentStatus) as [string])
        .optional(),
    balance: z
        .number({error: "Balance must be a Non-negative Number"})
        .gte(0)
        .optional()    
});