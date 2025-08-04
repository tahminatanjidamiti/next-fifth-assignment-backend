"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SSLService = void 0;
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
const axios_1 = __importDefault(require("axios"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const env_1 = require("../../config/env");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const payment_model_1 = require("../payment/payment.model");
const ride_model_1 = require("../ride/ride.model");
const sslPaymentInit = async (payload) => {
    try {
        const data = {
            store_id: env_1.envVars.SSL.STORE_ID,
            store_passwd: env_1.envVars.SSL.STORE_PASS,
            total_amount: payload.amount,
            currency: "BDT",
            tran_id: payload.transactionId,
            success_url: `${env_1.envVars.SSL.SSL_SUCCESS_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}&status=success`,
            fail_url: `${env_1.envVars.SSL.SSL_FAIL_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}&status=fail`,
            cancel_url: `${env_1.envVars.SSL.SSL_CANCEL_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}&status=cancel`,
            ipn_url: env_1.envVars.SSL.SSL_IPN_URL,
            shipping_method: "N/A",
            product_name: "Ride",
            product_category: "Service",
            product_profile: "general",
            cus_name: payload.name,
            cus_email: payload.email,
            cus_add1: payload.address,
            cus_add2: "N/A",
            cus_city: "Sylhet",
            cus_state: "Sylhet",
            cus_postcode: "1000",
            cus_country: "Bangladesh",
            cus_phone: payload.phoneNumber,
            cus_fax: "01711111111",
            ship_name: "N/A",
            ship_add1: "N/A",
            ship_add2: "N/A",
            ship_city: "N/A",
            ship_state: "N/A",
            ship_postcode: 1000,
            ship_country: "N/A",
        };
        const response = await (0, axios_1.default)({
            method: "POST",
            url: env_1.envVars.SSL.SSL_PAYMENT_API,
            data: data,
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        });
        return response.data;
    }
    catch (error) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, error.message);
    }
};
const validatePayment = async (payload) => {
    try {
        const response = await (0, axios_1.default)({
            method: "GET",
            url: `${env_1.envVars.SSL.SSL_VALIDATION_API}?val_id=${payload.val_id}&store_id=${env_1.envVars.SSL.STORE_ID}&store_passwd=${env_1.envVars.SSL.STORE_PASS}`
        });
        console.log("sslcomeerz validate api response", response.data);
        await payment_model_1.Payment.updateOne({ transactionId: payload.tran_id }, { paymentGatewayData: response.data }, { runValidators: true });
        await ride_model_1.Ride.findOneAndUpdate({ transactionId: payload.tran_id }, { paymentStatus: "paid", status: "completed" });
    }
    catch (error) {
        console.log(error);
        throw new AppError_1.default(401, `Payment Validation Error, ${error.message}`);
    }
};
exports.SSLService = {
    sslPaymentInit,
    validatePayment
};
