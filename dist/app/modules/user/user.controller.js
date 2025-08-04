"use strict";
/* eslint-disable @typescript-eslint/no-unused-vars */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserControllers = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const user_service_1 = require("./user.service");
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const userTokens_1 = require("../../utils/userTokens");
const setCookie_1 = require("../../utils/setCookie");
const createUser = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const user = await user_service_1.UserServices.createUser(req.body);
    const userTokens = await (0, userTokens_1.createUserTokens)(user);
    (0, setCookie_1.setAuthCookie)(res, userTokens);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: "User Created Successfully",
        data: {
            accessToken: userTokens.accessToken,
            refreshToken: userTokens.refreshToken,
            user
        }
    });
});
const updateUser = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const userId = req.params.id;
    const verifiedToken = req.user;
    const payload = req.body;
    const user = await user_service_1.UserServices.updateUser(userId, payload, verifiedToken);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: "User Updated Successfully",
        data: user
    });
});
const getAllUsers = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const query = req.query;
    const result = await user_service_1.UserServices.getAllUsers(query);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "ALL Users Retrieved Successfully",
        data: result.data,
        meta: result.meta
    });
});
const getMe = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const decodedToken = req.user;
    const result = await user_service_1.UserServices.getMe(decodedToken.userId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Your profile Retrieved Successfully",
        data: result.data
    });
});
const getSingleUser = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const id = req.params.id;
    const result = await user_service_1.UserServices.getSingleUser(id);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "User Retrieved Successfully",
        data: result.data
    });
});
const deleteUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await user_service_1.UserServices.deleteUser(req.params.id);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "User deleted successfully",
        data: result,
    });
});
exports.UserControllers = {
    createUser,
    updateUser,
    getAllUsers,
    getMe,
    getSingleUser,
    deleteUser
};
