import { Router } from "express";

import * as LoginHistoryController
    from "../controllers/loginHistory.controller";

import { authenticate }
    from "../middleware/auth.middleware";

import { requirePermission }
    from "../middleware/permission.middleware";

const router = Router();

router.use(authenticate);

router.get(
    "/",
    requirePermission("LOGIN_HISTORY_VIEW"),
    LoginHistoryController.getAll
);

export default router;