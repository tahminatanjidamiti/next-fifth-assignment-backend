/* eslint-disable @typescript-eslint/no-unused-vars */
import { envVars } from "../config/env";
import { IAuthProvider, IUser, Role } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import bcryptjs from "bcryptjs"


export const seedAdmin = async () => {

    try {

        const isAdminExist = await User.findOne({ email: envVars.ADMIN_EMAIL })
        if (isAdminExist) {
            // console.log("Admin Already Exists!");
            return;
        }
        // console.log("Try to Create Admin")
        const hashedPassword = await bcryptjs.hash(envVars.ADMIN_PASSWORD, Number(envVars.BCRYPT_SALT_ROUND))

        const authProvider: IAuthProvider = {
            provider: "credentials",
            providerId: envVars.ADMIN_EMAIL
        }
        const payload: IUser = {
            name: "Admin",
            role: Role.ADMIN,
            email: envVars.ADMIN_EMAIL,
            password: hashedPassword,
            isVerified: true,
            auths: [authProvider],
        }
        const admin = await User.create(payload)
        // console.log("Admin Created Successfully")
        // console.log(admin)
    } catch (error) {
        // console.log(error);
    }

}