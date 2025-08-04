"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverService = void 0;
const QueryBuilder_1 = require("../../utils/QueryBuilder");
const user_interface_1 = require("../user/user.interface");
const user_model_1 = require("../user/user.model");
const driver_constant_1 = require("./driver.constant");
const driver_model_1 = require("./driver.model");
const createDriver = async (payload) => {
    const driver = await driver_model_1.Driver.create(payload);
    return driver;
};
const getAllDrivers = async (query) => {
    const queryBuilder = new QueryBuilder_1.QueryBuilder(driver_model_1.Driver.find({ role: "driver" }), query);
    const driversData = queryBuilder
        .filter()
        .search(driver_constant_1.driverSearchableFields)
        .sort()
        .fields()
        .paginate();
    const [data, meta] = await Promise.all([
        driversData.build(),
        queryBuilder.getMeta(),
    ]);
    return {
        data,
        meta,
    };
};
const getDriverByNear = async (lng, lat, radius) => {
    // console.log("Service query values:", { lng, lat, radius });
    return await driver_model_1.Driver.findOne({
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
};
const updateDriverStatus = async (id, payload) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateFields = {};
    if (payload.isOnline !== undefined)
        updateFields["driverProfile.isOnline"] = payload.isOnline;
    if (payload.approved !== undefined)
        updateFields["driverProfile.approved"] = payload.approved;
    const updatedDriver = await driver_model_1.Driver.findOneAndUpdate({ _id: id }, { $set: updateFields }, { new: true, runValidators: true });
    // If approved, update user's role to DRIVER
    if (payload.approved === true && updatedDriver?.riderId) {
        await user_model_1.User.findByIdAndUpdate(updatedDriver.riderId, { role: user_interface_1.Role.DRIVER }, { new: true });
    }
    return updatedDriver;
};
const getDriverById = async (id) => {
    const driver = await driver_model_1.Driver.findById(id);
    return {
        data: driver
    };
};
exports.DriverService = {
    createDriver,
    getAllDrivers,
    getDriverByNear,
    getDriverById,
    updateDriverStatus,
};
