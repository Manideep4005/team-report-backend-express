import {
    Router,
} from "express";

import {
    authenticate,
} from "../middleware/auth.middleware";

import {
    createCustomization,
    getCustomization,
} from "../controllers/resumeCustomization.controller";


const router = Router();


/*
 * ================================================================
 * AUTHENTICATION
 * ================================================================
 */

router.use(
    authenticate
);


/*
 * ================================================================
 * GET CUSTOMIZATION
 * ================================================================
 *
 * GET /api/resume/customization
 *
 */

router.get(
    "/",
    getCustomization
);


/*
 * ================================================================
 * CREATE CUSTOMIZATION
 * ================================================================
 *
 * POST /api/resume/customization
 *
 */

router.post(
    "/",
    createCustomization
);


export default router;