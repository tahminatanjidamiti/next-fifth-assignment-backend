"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const passport_local_1 = require("passport-local");
const user_interface_1 = require("../modules/user/user.interface");
const user_model_1 = require("../modules/user/user.model");
const env_1 = require("./env");
passport_1.default.use(new passport_local_1.Strategy({
    usernameField: "email",
    passwordField: "password"
}, async (email, password, done) => {
    try {
        const isUserExist = await user_model_1.User.findOne({ email });
        if (!isUserExist) {
            return done("User does not exist");
        }
        if (!isUserExist.isVerified) {
            return done("User is not verified");
        }
        if (isUserExist.isActive === user_interface_1.IsActive.BLOCKED || isUserExist.isActive === user_interface_1.IsActive.INACTIVE) {
            return done(`User is ${isUserExist.isActive}`);
        }
        if (isUserExist.isDeleted) {
            return done("User is deleted");
        }
        const isGoogleAuthenticated = isUserExist.auths.some(providerObjects => providerObjects.provider == "google");
        if (isGoogleAuthenticated && !isUserExist.password) {
            return done(null, false, { message: "You have authenticated through Google. So if you want to login with credentials, then at first login with google and set a password for your Gmail and then you can login with email and password." });
        }
        const isPasswordMatched = await bcryptjs_1.default.compare(password, isUserExist.password);
        if (!isPasswordMatched) {
            return done(null, false, { message: "Password does not match" });
        }
        return done(null, isUserExist);
    }
    catch (error) {
        done(error);
    }
}));
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: env_1.envVars.GOOGLE_CLIENT_ID,
    clientSecret: env_1.envVars.GOOGLE_CLIENT_SECRET,
    callbackURL: env_1.envVars.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails?.[0].value;
        if (!email) {
            return done(null, false, { mesaage: "No email found" });
        }
        let isUserExist = await user_model_1.User.findOne({ email });
        if (isUserExist && !isUserExist.isVerified) {
            return done(null, false, { message: "User is not verified" });
        }
        if (isUserExist && (isUserExist.isActive === user_interface_1.IsActive.BLOCKED || isUserExist.isActive === user_interface_1.IsActive.INACTIVE)) {
            return done(`User is ${isUserExist.isActive}`);
        }
        if (isUserExist && isUserExist.isDeleted) {
            return done(null, false, { message: "User is deleted" });
        }
        if (!isUserExist) {
            isUserExist = await user_model_1.User.create({
                email,
                name: profile.displayName,
                picture: profile.photos?.[0].value,
                role: user_interface_1.Role.RIDER,
                isVerified: true,
                auths: [
                    {
                        provider: "google",
                        providerId: profile.id
                    }
                ]
            });
        }
        return done(null, isUserExist);
    }
    catch (error) {
        return done(error);
    }
}));
passport_1.default.serializeUser((user, done) => {
    done(null, user._id);
});
passport_1.default.deserializeUser(async (id, done) => {
    try {
        const user = await user_model_1.User.findById(id);
        done(null, user);
    }
    catch (error) {
        done(error);
    }
});
