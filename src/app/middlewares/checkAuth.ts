import { NextFunction, Request, Response } from "express";
import AppError from "../errorHelpers/AppError";
import { verifyToken } from "../utils/jwt";
import { envVars } from "../config/env";
import { User } from "../modules/user/user.model";
import httpStatus from "http-status-codes";
import { IsActive } from "../modules/user/user.interface";
import { IJwtUserPayload } from "../interfaces";


export const checkAuth = (...authRoles: string[]) =>  async (req: Request, res: Response, next: NextFunction) => {

  try {

    const accessToken = req.headers.authorization?.split(" ")[1];

    if (!accessToken) {
      throw new AppError(403, "No Token Received")
    }

    const verifiedToken = verifyToken(accessToken, envVars.JWT_ACCESS_SECRET) as IJwtUserPayload

    const isUserExist = await User.findOne({ email: verifiedToken.email })
    
        if (!isUserExist) {
            throw new AppError(httpStatus.BAD_REQUEST, "User does not exist")
        }

        if (!isUserExist.isVerified) {
            throw new AppError(httpStatus.BAD_REQUEST, "User is not verified")
        }
    
        if (isUserExist.isActive === IsActive.BLOCKED || isUserExist.isActive === IsActive.INACTIVE) {
            throw new AppError(httpStatus.BAD_REQUEST, `User is ${isUserExist.isActive}`)
        }
    
        if (isUserExist.isDeleted) {
            throw new AppError(httpStatus.BAD_REQUEST, "User is deleted")
        }
    

    if (!authRoles.includes(verifiedToken.role)) {
      throw new AppError(403, "You are not permitted to view this route!!!")
    }
    req.user = verifiedToken;
    next()
  } catch (error) {
    next(error)
  }
}