"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserServices = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const env_1 = require("../../config/env");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const QueryBuilder_1 = require("../../utils/QueryBuilder");
const user_interface_1 = require("./user.interface");
const user_model_1 = require("./user.model");
const user_constant_1 = require("./user.constant");
const createUser = async (payload) => {
    const { email, password, ...rest } = payload;
    const isUserExist = await user_model_1.User.findOne({ email });
    if (isUserExist) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User Already Exist");
    }
    const hashedPassword = await bcryptjs_1.default.hash(password, Number(env_1.envVars.BCRYPT_SALT_ROUND));
    const authProvider = { provider: "credentials", providerId: email };
    const user = await user_model_1.User.create({
        email,
        password: hashedPassword,
        auths: [authProvider],
        ...rest
    });
    return user;
};
const updateUser = async (userId, payload, decodedToken) => {
    const ifUserExist = await user_model_1.User.findById(userId);
    if (!ifUserExist) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User Not Found");
    }
    if (payload.role) {
        if (decodedToken.role === user_interface_1.Role.RIDER || decodedToken.role === user_interface_1.Role.DRIVER) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not authorized");
        }
    }
    if (payload.isActive || payload.isDeleted || payload.isVerified) {
        if (decodedToken.role === user_interface_1.Role.RIDER || decodedToken.role === user_interface_1.Role.DRIVER) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not authorized");
        }
    }
    const newUpdatedUser = await user_model_1.User.findByIdAndUpdate(userId, payload, { new: true, runValidators: true });
    return newUpdatedUser;
};
const getAllUsers = async (query) => {
    const queryBuilder = new QueryBuilder_1.QueryBuilder(user_model_1.User.find(), query);
    const usersData = queryBuilder
        .filter()
        .search(user_constant_1.userSearchableFields)
        .sort()
        .fields()
        .paginate();
    const [data, meta] = await Promise.all([
        usersData.build(),
        queryBuilder.getMeta()
    ]);
    return {
        data,
        meta
    };
};
const getSingleUser = async (id) => {
    const user = await user_model_1.User.findById(id).select("-password");
    return {
        data: user
    };
};
const getMe = async (userId) => {
    const user = await user_model_1.User.findById(userId).select("-password");
    return {
        data: user
    };
};
const deleteUser = async (id) => {
    const user = await user_model_1.User.findByIdAndDelete(id);
    return user;
};
exports.UserServices = {
    createUser,
    getAllUsers,
    getSingleUser,
    updateUser,
    getMe,
    deleteUser
};
