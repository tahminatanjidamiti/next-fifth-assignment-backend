"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudinaryUpload = exports.deleteImageFromCLoudinary = exports.uploadBufferToCloudinary = void 0;
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
const cloudinary_1 = require("cloudinary");
const stream_1 = __importDefault(require("stream"));
const AppError_1 = __importDefault(require("../errorHelpers/AppError"));
const env_1 = require("./env");
cloudinary_1.v2.config({
    cloud_name: env_1.envVars.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
    api_key: env_1.envVars.CLOUDINARY.CLOUDINARY_API_KEY,
    api_secret: env_1.envVars.CLOUDINARY.CLOUDINARY_API_SECRET
});
const uploadBufferToCloudinary = async (buffer, fileName) => {
    try {
        return new Promise((resolve, reject) => {
            const public_id = `pdf/${fileName}-${Date.now()}`;
            const bufferStream = new stream_1.default.PassThrough();
            bufferStream.end(buffer);
            cloudinary_1.v2.uploader.upload_stream({
                resource_type: "auto",
                public_id: public_id,
                folder: "pdf"
            }, (error, result) => {
                if (error) {
                    return reject(error);
                }
                resolve(result);
            }).end(buffer);
        });
    }
    catch (error) {
        console.log(error);
        throw new AppError_1.default(401, `Error uploading file ${error.message}`);
    }
};
exports.uploadBufferToCloudinary = uploadBufferToCloudinary;
const deleteImageFromCLoudinary = async (url) => {
    try {
        const regex = /\/v\d+\/(.*?)\.(jpg|jpeg|png|gif|webp)$/i;
        const match = url.match(regex);
        if (match && match[1]) {
            const public_id = match[1];
            await cloudinary_1.v2.uploader.destroy(public_id);
        }
    }
    catch (error) {
        throw new AppError_1.default(401, "Cloudinary image deletion failed", error.message);
    }
};
exports.deleteImageFromCLoudinary = deleteImageFromCLoudinary;
exports.cloudinaryUpload = cloudinary_1.v2;
