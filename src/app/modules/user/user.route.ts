import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { UserControllers } from "./user.controller";
import { Role } from "./user.interface";
import { createUserZodSchema, updateUserZodSchema } from "./user.validation";
import { multerUpload } from "../../config/multer.config";

const router = Router()



router.post("/register", validateRequest(createUserZodSchema), UserControllers.createUser)
router.get("/all-users", checkAuth(Role.ADMIN), UserControllers.getAllUsers)
router.get("/me", checkAuth(...Object.values(Role)), UserControllers.getMe)
router.get("/:id", checkAuth(Role.ADMIN), UserControllers.getSingleUser)
router.patch("/update",  multerUpload.single("file"), validateRequest(updateUserZodSchema), checkAuth(...Object.values(Role)), UserControllers.updateUser)
router.delete("/:id", checkAuth(Role.ADMIN), UserControllers.deleteUser);
export const UserRoutes = router;