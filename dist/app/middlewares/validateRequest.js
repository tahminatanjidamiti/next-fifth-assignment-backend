"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const validateRequest = (zodSchema) => async (req, res, next) => {
    try {
        if (req.body?.data && typeof req.body.data === "string") {
            req.body = JSON.parse(req.body.data);
        }
        req.body = await zodSchema.parseAsync(req.body);
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.validateRequest = validateRequest;
