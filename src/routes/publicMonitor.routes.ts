import { Router } from "express";

import * as PublicMonitorController
    from "../controllers/publicMonitor.controller";

import { authenticate }
    from "../middleware/auth.middleware";

import { requirePermission }
    from "../middleware/permission.middleware";


const router = Router();




router.post(
    "/",
    authenticate,
    requirePermission("PUBLIC_MONITOR_CREATE"),
    PublicMonitorController.createLink
);




router.get(
    "/",
    authenticate,
    requirePermission("PUBLIC_MONITOR_VIEW"),
    PublicMonitorController.getLinks
);




router.delete(
    "/:id",
    authenticate,
    requirePermission("PUBLIC_MONITOR_REVOKE"),
    PublicMonitorController.revokeLink
);


export default router;