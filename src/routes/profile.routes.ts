import { Router } from "express";
import * as ProfileController from "../controllers/profile.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import {
    updateProfileSchema,
    changePasswordSchema,
} from "../validations/profile.validation";

const router = Router();

router.use(authenticate);

router.get(
    "/",
    ProfileController.getProfile
);

router.put(
    "/",
    validate(updateProfileSchema),
    ProfileController.updateProfile
);

router.put(
    "/password",
    validate(changePasswordSchema),
    ProfileController.changePassword
);

export default router;