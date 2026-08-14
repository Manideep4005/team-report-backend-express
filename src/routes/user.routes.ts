import { Router } from "express";

import * as UserController from "../controllers/user.controller";

import { authenticate } from "../middleware/auth.middleware";
import { requirePermission } from "../middleware/permission.middleware";
import { validate } from "../middleware/validate.middleware";

import {
    createUserSchema,
    updateUserSchema,
} from "../validations/user.validation";

const router = Router();

router.use(authenticate);

router.get(
    "/",
    requirePermission("USER_VIEW"),
    UserController.getAll
);

router.get(
    "/:id",
    requirePermission("USER_VIEW"),
    UserController.getById
);

router.post(
    "/",
    requirePermission("USER_CREATE"),
    validate(createUserSchema),
    UserController.create
);

router.put(
    "/:id",
    requirePermission("USER_UPDATE"),
    validate(updateUserSchema),
    UserController.update
);

router.delete(
    "/:id",
    requirePermission("USER_DELETE"),
    UserController.remove
);

export default router;