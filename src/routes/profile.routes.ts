import { Router } from "express";
import * as ProfileController from "../controllers/profile.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import {
    updateProfileSchema,
    changePasswordSchema,
} from "../validations/profile.validation";
import { avatarUpload } from "../middleware/avatarUpload.middleware";

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

router.put(
    "/avatar",
    avatarUpload.single("avatar"),
    ProfileController.updateAvatar
);

router.delete(
    "/avatar",
    ProfileController.removeAvatar
);

export default router;