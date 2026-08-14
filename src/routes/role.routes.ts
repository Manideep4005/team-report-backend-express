import { Router } from "express";

import * as RoleController from "../controllers/role.controller";

import { authenticate } from "../middleware/auth.middleware";
import { requirePermission } from "../middleware/permission.middleware";
import { validate } from "../middleware/validate.middleware";

import {
    createRoleSchema,
    updateRoleSchema,
} from "../validations/role.validation";

const router = Router();

router.use(authenticate);

router.get(
    "/",
    requirePermission("ROLE_VIEW"),
    RoleController.getAll
);

router.get(
    "/:id",
    requirePermission("ROLE_VIEW"),
    RoleController.getById
);

router.post(
    "/",
    requirePermission("ROLE_CREATE"),
    validate(createRoleSchema),
    RoleController.create
);

router.put(
    "/:id",
    requirePermission("ROLE_UPDATE"),
    validate(updateRoleSchema),
    RoleController.update
);

router.delete(
    "/:id",
    requirePermission("ROLE_DELETE"),
    RoleController.remove
);

export default router;