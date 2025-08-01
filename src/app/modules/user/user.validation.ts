import z from "zod";
import { ActiveStatus, AgentStatus, Role } from "./user.interface";


export const createUserZodSchema = z.object({
    name: z
        .string({ error: "Name must be string" })
        .min(2, "Name must be at least 2 characters long." )
        .max(50, "Name cannot exceed 50 characters." ),
    email: z
        .string({ error: "Email must be string" })
        .email("Invalid email address format."),
    password: z
        .string({ error: "Password must be string" })
        .min(8, "Password must be at least 8 characters long." )
        .regex(/^(?=.*[A-Z])/, {
            message: "Password must contain at least 1 uppercase letter.",
        })
        .regex(/^(?=.*[!@#$%^&*])/, {
            message: "Password must contain at least 1 special character.",
        })
        .regex(/^(?=.*\d)/, {
            message: "Password must contain at least 1 number.",
        }),
    phone: z
        .string({ error: "Phone Number must be string" })
        .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
            message: "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
        })
        .optional(),
    address: z
        .string({ error: "Address must be string" })
        .max(200, "Address cannot exceed 200 characters.")
        .optional()
});


export const updateUserZodSchema = z.object({
    name: z
        .string({ error: "Name must be string" })
        .min(2, "Name must be at least 2 characters long.")
        .max(50, "Name cannot exceed 50 characters.")
        .optional(),
    password: z
        .string({ error: "Password must be string" })
        .min(8, "Password must be at least 8 characters long.")
        .regex(/^(?=.*[A-Z])/, {
            message: "Password must contain at least 1 uppercase letter.",
        })
        .regex(/^(?=.*[!@#$%^&*])/, {
            message: "Password must contain at least 1 special character.",
        })
        .regex(/^(?=.*\d)/, {
            message: "Password must contain at least 1 number.",
        })
        .optional(),
    phone: z
        .string({ error: "Phone Number must be string" })
        .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
            message: "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
        })
        .optional(),
    role: z
        .enum(Object.values(Role) as [string])
        .optional(),
    activeStatus: z
        .enum(Object.values(ActiveStatus) as [string])
        .optional(),
    agentStatus: z
        .enum(Object.values(AgentStatus) as [string])
        .optional(),
    isDeleted: z
        .boolean({ error: "isDeleted must be true or false" })
        .optional(),
    // isVerified: z
    //     .boolean({ error: "isVerified must be true or false" })
    //     .optional(),
    address: z
        .string({ error: "Address must be string" })
        .max(200, "Address cannot exceed 200 characters.")
        .optional()
});