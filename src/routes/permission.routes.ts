import { Router } from "express";

import * as PermissionController from "../controllers/permission.controller";

import { authenticate } from "../middleware/auth.middleware";
import { requirePermission } from "../middleware/permission.middleware";

const router = Router();

router.use(authenticate);

router.get(
    "/",
    requirePermission("ROLE_VIEW"),
    PermissionController.getAll
);

export default router;