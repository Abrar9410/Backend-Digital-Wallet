/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Users } from "../user/user.model";
import AppError from "../../errorHelpers/AppError";
import { ActiveStatus, IUser } from "../user/user.interface";
import httpStatus from "http-status-codes";
import bcryptjs from "bcryptjs";
import { createNewTokenWithRefreshToken, createUserTokens } from "../../utils/userTokens";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";


const credentialsLoginService = async (payload: Partial<IUser>) => {
    const { email, password } = payload;

    const user = await Users.findOne({ email });

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User Does Not Exist!");
    };

    // if (!user.isVerified) {
    //     throw new AppError(httpStatus.BAD_REQUEST, "User is Not Verified!");
    // };

    if (user.activeStatus === ActiveStatus.BLOCKED || user.activeStatus === ActiveStatus.INACTIVE) {
        throw new AppError(httpStatus.BAD_REQUEST, `User is ${user.activeStatus}!`);
    };

    if (user.isDeleted) {
        throw new AppError(httpStatus.BAD_REQUEST, "User is Deleted!");
    };

    const isPasswordMatched = await bcryptjs.compare(password as string, user.password as string);

    if (!isPasswordMatched) {
        throw new AppError(httpStatus.BAD_REQUEST, "Incorrect Password!")
    };

    const { token, refreshToken } = createUserTokens(user);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: pass, ...rest } = user.toObject();

    return {
        token,
        refreshToken,
        user: rest
    };
};

const getNewTokenService = async (refreshToken: string) => {

    const newToken = await createNewTokenWithRefreshToken(refreshToken);

    return {
        token: newToken
    };
};

const changePasswordService = async (decodedToken: JwtPayload, oldPassword: string, newPassword: string) => {

    const user = await Users.findById(decodedToken.userId);

    if (user?._id.toString() !== decodedToken.userId) {     //** Not Working Without .toString() */
        throw new AppError(httpStatus.FORBIDDEN, "You are Trying to Change Another User's Password!");
    };

    const isOldPasswordMatched = await bcryptjs.compare(oldPassword, user!.password as string);

    if (!isOldPasswordMatched) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Old Password Does Not Match!");
    };

    if (newPassword.length < 8) {
        throw new AppError(httpStatus.LENGTH_REQUIRED, "Password must be at least 8 characters long.")
    };

    const oneUppercaseLetter = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*\d)/;
    if (!oneUppercaseLetter.test(newPassword)) {
        throw new AppError(
            httpStatus.NOT_ACCEPTABLE,
            "Password must contain at least one Uppercase letter, at least one Special Character and at least one Number!"
        );
    };

    user!.password = await bcryptjs.hash(newPassword, Number(envVars.SALT));
    await user!.save();
};

export const AuthServices = {
    credentialsLoginService,
    getNewTokenService,
    changePasswordService,
};