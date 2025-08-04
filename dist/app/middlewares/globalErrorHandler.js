"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
const cloudinary_config_1 = require("../config/cloudinary.config");
const env_1 = require("../config/env");
const AppError_1 = __importDefault(require("../errorHelpers/AppError"));
const handleDuplicateError_1 = require("../helpers/handleDuplicateError");
const handleCastError_1 = require("../helpers/handleCastError");
const handleZodError_1 = require("../helpers/handleZodError");
const handleValidationError_1 = require("../helpers/handleValidationError");
const globalErrorHandler = async (err, req, res, next) => {
    if (req.file) {
        await (0, cloudinary_config_1.deleteImageFromCLoudinary)(req.file.path);
    }
    if (req.files && Array.isArray(req.files) && req.files.length) {
        const imageUrls = req.files.map(file => file.path);
        await Promise.all(imageUrls.map(url => (0, cloudinary_config_1.deleteImageFromCLoudinary)(url)));
    }
    let errorSources = [];
    let statusCode = 500;
    let message = "Something Went Wrong!!";
    if (err.code === 11000) {
        const simplifiedError = (0, handleDuplicateError_1.handleDuplicateError)(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
    }
    else if (err.name === "CastError") {
        const simplifiedError = (0, handleCastError_1.handlerCastError)(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
    }
    else if (err.name === "ZodError") {
        const simplifiedError = (0, handleZodError_1.handleZodError)(err);
        statusCode = simplifiedError.statusCode;
        errorSources = simplifiedError.errorSources;
        message = simplifiedError.message;
    }
    else if (err.name === "ValidationError") {
        const simplifiedError = (0, handleValidationError_1.handleValidationError)(err);
        statusCode = simplifiedError.statusCode;
        errorSources = simplifiedError.errorSources;
        message = simplifiedError.message;
    }
    else if (err instanceof AppError_1.default) {
        statusCode = err.statusCode;
        message = err.message;
    }
    else if (err instanceof Error) {
        statusCode = 500;
        message = err.message;
    }
    res.status(statusCode).json({
        success: false,
        message,
        errorSources,
        err: env_1.envVars.NODE_ENV === "development" ? err : null,
        stack: env_1.envVars.NODE_ENV === "development" ? err.stack : null
    });
};
exports.globalErrorHandler = globalErrorHandler;
