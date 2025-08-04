"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const env_1 = require("../../config/env");
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const sslCommerz_service_1 = require("../sslCommerz/sslCommerz.service");
const payment_service_1 = require("./payment.service");
const initPayment = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const bookingId = req.params.bookingId;
    const result = await payment_service_1.PaymentService.initPayment(bookingId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: "Payment done successfully",
        data: result,
    });
});
const successPayment = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const query = req.query;
    const result = await payment_service_1.PaymentService.successPayment(query);
    if (result.success) {
        res.redirect(`${env_1.envVars.SSL.SSL_SUCCESS_FRONTEND_URL}?transactionId=${query.transactionId}&message=${result.message}&amount=${query.amount}&status=${query.status}`);
    }
});
const failPayment = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const query = req.query;
    const result = await payment_service_1.PaymentService.failPayment(query);
    if (!result.success) {
        res.redirect(`${env_1.envVars.SSL.SSL_FAIL_FRONTEND_URL}?transactionId=${query.transactionId}&message=${result.message}&amount=${query.amount}&status=${query.status}`);
    }
});
const cancelPayment = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const query = req.query;
    const result = await payment_service_1.PaymentService.cancelPayment(query);
    if (!result.success) {
        res.redirect(`${env_1.envVars.SSL.SSL_CANCEL_FRONTEND_URL}?transactionId=${query.transactionId}&message=${result.message}&amount=${query.amount}&status=${query.status}`);
    }
});
const getInvoiceDownloadUrl = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { paymentId } = req.params;
    const result = await payment_service_1.PaymentService.getInvoiceDownloadUrl(paymentId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Invoice download URL retrieved successfully",
        data: result,
    });
});
const validatePayment = (0, catchAsync_1.catchAsync)(async (req, res) => {
    console.log("sslcommerz ipn url body", req.body);
    await sslCommerz_service_1.SSLService.validatePayment(req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Payment Validated Successfully",
        data: null,
    });
});
exports.PaymentController = {
    initPayment,
    successPayment,
    failPayment,
    cancelPayment,
    getInvoiceDownloadUrl,
    validatePayment
};
