"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverService = void 0;
const QueryBuilder_1 = require("../../utils/QueryBuilder");
const user_interface_1 = require("../user/user.interface");
const user_model_1 = require("../user/user.model");
const driver_constant_1 = require("./driver.constant");
const driver_model_1 = require("./driver.model");
const createDriver = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const driver = yield driver_model_1.Driver.create(payload);
    return driver;
});
const getAllDrivers = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new QueryBuilder_1.QueryBuilder(driver_model_1.Driver.find({ role: "driver" }), query);
    const driversData = queryBuilder
        .filter()
        .search(driver_constant_1.driverSearchableFields)
        .sort()
        .fields()
        .paginate();
    const [data, meta] = yield Promise.all([
        driversData.build(),
        queryBuilder.getMeta(),
    ]);
    return {
        data,
        meta,
    };
});
const getDriverByNear = (lng, lat, radius) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log("Service query values:", { lng, lat, radius });
    return yield driver_model_1.Driver.findOne({
        role: "DRIVER",
        "driverProfile.isOnline": true,
        "driverProfile.approved": true,
        location: {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: [lng, lat], // [longitude, latitude]
                },
                $maxDistance: radius, // meters
            },
        },
    }).sort({ "driverProfile.rating": -1 });
});
const updateDriverStatus = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateFields = {};
    if (payload.isOnline !== undefined)
        updateFields["driverProfile.isOnline"] = payload.isOnline;
    if (payload.approved !== undefined)
        updateFields["driverProfile.approved"] = payload.approved;
    const updatedDriver = yield driver_model_1.Driver.findOneAndUpdate({ _id: id }, { $set: updateFields }, { new: true, runValidators: true });
    // If approved, update user's role to DRIVER
    if (payload.approved === true && (updatedDriver === null || updatedDriver === void 0 ? void 0 : updatedDriver.riderId)) {
        yield user_model_1.User.findByIdAndUpdate(updatedDriver.riderId, { role: user_interface_1.Role.DRIVER }, { new: true });
    }
    return updatedDriver;
});
const getDriverById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const driver = yield driver_model_1.Driver.findById(id);
    return {
        data: driver
    };
});
exports.DriverService = {
    createDriver,
    getAllDrivers,
    getDriverByNear,
    getDriverById,
    updateDriverStatus,
};
