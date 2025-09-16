/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { UserServices } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { JwtPayload } from "jsonwebtoken";
import { createUserTokens } from "../../utils/userTokens";
import { setAuthCookie } from "../../utils/setCookie";
import { IUser } from "./user.interface";



const createUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    
    const user = await UserServices.createUser(req.body)
    const userTokens = await createUserTokens(user)

    setAuthCookie(res, userTokens)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User Created Successfully",
        data:
        {
            accessToken: userTokens.accessToken,
            refreshToken: userTokens.refreshToken,
            user
        }
    })

})

const updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const payload: IUser = {
        ...req.body,
        picture: req.file?.path
    }
    const userId = (req.user as JwtPayload).userId;
    const verifiedToken = req.user;
    const user = await UserServices.updateUser(userId, payload, verifiedToken as JwtPayload)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User Updated Successfully",
        data: user
    })

})

const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await UserServices.getAllUsers(query as Record<string, string>);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "ALL Users Retrieved Successfully",
        data: result.data,
        meta: result.meta
    })
})

const getMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload
    const result = await UserServices.getMe(decodedToken.userId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Your profile Retrieved Successfully",
        data: result.data
    })
})

const getSingleUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const result = await UserServices.getSingleUser(id);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User Retrieved Successfully",
        data: result.data
    })
})

const deleteUser = catchAsync(async (req: Request, res: Response) => {
    const result = await UserServices.deleteUser(req.params.id);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User deleted successfully",
        data: result,
    });
});
export const UserControllers = {
    createUser,
    updateUser,
    getAllUsers,
    getMe,
    getSingleUser,
    deleteUser
}