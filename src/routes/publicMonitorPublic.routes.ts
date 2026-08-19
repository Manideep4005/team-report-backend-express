import { Router } from "express";

import * as PublicMonitorPublicController
    from "../controllers/publicMonitorPublic.controller";

const router = Router();


/*
 * IMPORTANT:
 *
 * There is NO authenticate middleware here.
 *
 * The token itself is the credential.
 */
router.get(
    "/:token",
    PublicMonitorPublicController.getPublicMonitor
);


export default router;