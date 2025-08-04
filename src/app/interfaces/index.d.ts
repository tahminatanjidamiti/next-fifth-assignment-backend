import { JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";
import { Role } from "../modules/user/user.interface";


declare global {
  namespace Express {
    interface Request {
      user: IJwtUserPayload;
    }
  }
}

export interface IJwtUserPayload extends JwtPayload {
  _id: Types.ObjectId;
  email: string;
  role: Role;
}