import { Router } from "express";

import * as PermissionController
    from "../controllers/permission.controller";

import { authenticate }
    from "../middleware/auth.middleware";

import { requirePermission }
    from "../middleware/permission.middleware";

import { validate }
    from "../middleware/validate.middleware";

import {
    createPermissionSchema,
    updatePermissionSchema,
} from "../validations/permission.validation";

const router = Router();

router.use(authenticate);

router.get(
    "/",
    requirePermission("PERMISSION_VIEW"),
    PermissionController.getAll
);

router.get(
    "/:id",
    requirePermission("PERMISSION_VIEW"),
    PermissionController.getById
);

router.post(
    "/",
    requirePermission("PERMISSION_CREATE"),
    validate(createPermissionSchema),
    PermissionController.create
);

router.put(
    "/:id",
    requirePermission("PERMISSION_UPDATE"),
    validate(updatePermissionSchema),
    PermissionController.update
);

router.delete(
    "/:id",
    requirePermission("PERMISSION_DELETE"),
    PermissionController.remove
);

export default router;