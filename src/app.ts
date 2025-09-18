import cookieParser from "cookie-parser";
import express, { Request, Response } from 'express';
import helmet from "helmet";
import cors from "cors"
import { router } from './app/routes';
import { globalErrorHandler } from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';
import passport from "passport";
import expressSession from "express-session";
import "./app/config/passport"
import { envVars } from "./app/config/env";
import { globalLimiter } from "./app/middlewares/rateLimiter";


const app = express()

app.use(expressSession({
  secret: envVars.EXPRESS_SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(cookieParser())
app.use(express.json())
app.set("trust proxy", 1);
app.use(express.urlencoded({ extended: true }))
app.use(helmet());
app.use(cors({
    origin: envVars.FRONTEND_URL,
    credentials: true
}))
app.use(globalLimiter);

app.use("/api/v1", router)

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to Ride Booking System Backend"
  });

});


app.use(globalErrorHandler)

app.use(notFound);

export default app;