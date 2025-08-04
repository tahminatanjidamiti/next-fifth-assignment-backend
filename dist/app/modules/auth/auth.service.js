"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthServices = void 0;
/* eslint-disable @typescript-eslint/no-non-null-assertion */
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../config/env");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const sendEmail_1 = require("../../utils/sendEmail");
const userTokens_1 = require("../../utils/userTokens");
const user_interface_1 = require("../user/user.interface");
const user_model_1 = require("../user/user.model");
const getNewAccessToken = async (refreshToken) => {
    const newAccessToken = await (0, userTokens_1.createNewAccessTokenWithRefreshToken)(refreshToken);
    return {
        accessToken: newAccessToken
    };
};
const resetPassword = async (payload, decodedToken) => {
    if (payload.id != decodedToken.userId) {
        throw new AppError_1.default(401, "You can not reset your password");
    }
    const isUserExist = await user_model_1.User.findById(decodedToken.userId);
    if (!isUserExist) {
        throw new AppError_1.default(401, "User does not exist");
    }
    const hashedPassword = await bcryptjs_1.default.hash(payload.newPassword, Number(env_1.envVars.BCRYPT_SALT_ROUND));
    isUserExist.password = hashedPassword;
    await isUserExist.save();
};
const forgotPassword = async (email) => {
    const isUserExist = await user_model_1.User.findOne({ email });
    if (!isUserExist) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User does not exist");
    }
    if (!isUserExist.isVerified) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User is not verified");
    }
    if (isUserExist.isActive === user_interface_1.IsActive.BLOCKED || isUserExist.isActive === user_interface_1.IsActive.INACTIVE) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, `User is ${isUserExist.isActive}`);
    }
    if (isUserExist.isDeleted) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User is deleted");
    }
    const jwtPayload = {
        userId: isUserExist._id,
        email: isUserExist.email,
        role: isUserExist.role
    };
    const resetToken = jsonwebtoken_1.default.sign(jwtPayload, env_1.envVars.JWT_ACCESS_SECRET, {
        expiresIn: "10m"
    });
    const resetUILink = `${env_1.envVars.FRONTEND_URL}/reset-password?id=${isUserExist._id}&token=${resetToken}`;
    (0, sendEmail_1.sendEmail)({
        to: isUserExist.email,
        subject: "Password Reset",
        templateName: "forgetPassword",
        templateData: {
            name: isUserExist.name,
            resetUILink
        }
    });
};
const setPassword = async (userId, plainPassword) => {
    const user = await user_model_1.User.findById(userId);
    if (!user) {
        throw new AppError_1.default(404, "User not found");
    }
    if (user.password && user.auths.some(providerObject => providerObject.provider === "google")) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "You have already set you password. Now you can change the password from your profile password update");
    }
    const hashedPassword = await bcryptjs_1.default.hash(plainPassword, Number(env_1.envVars.BCRYPT_SALT_ROUND));
    const credentialProvider = {
        provider: "credentials",
        providerId: user.email
    };
    const auths = [...user.auths, credentialProvider];
    user.password = hashedPassword;
    user.auths = auths;
    await user.save();
};
const changePassword = async (oldPassword, newPassword, decodedToken) => {
    const user = await user_model_1.User.findById(decodedToken.userId);
    const isOldPasswordMatch = await bcryptjs_1.default.compare(oldPassword, user.password);
    if (!isOldPasswordMatch) {
        throw new AppError_1.default(http_status_codes_1.default.UNAUTHORIZED, "Old Password does not match");
    }
    user.password = await bcryptjs_1.default.hash(newPassword, Number(env_1.envVars.BCRYPT_SALT_ROUND));
    user.save();
};
exports.AuthServices = {
    getNewAccessToken,
    changePassword,
    setPassword,
    forgotPassword,
    resetPassword
};
