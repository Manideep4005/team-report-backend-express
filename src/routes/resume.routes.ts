import { Router } from "express";

import * as ResumeController
    from "../controllers/resume.controller";

import { authenticate }
    from "../middleware/auth.middleware";

import { requirePermission }
    from "../middleware/permission.middleware";

import { validate }
    from "../middleware/validate.middleware";

import {
    resumeProfileSchema,
    resumeCustomizationSchema,
} from "../validations/resume.validation";


const router = Router();


router.use(
    authenticate
);


/* ================================================================
   MASTER PROFILE
================================================================ */


/*
 * View own master resume
 */

router.get(
    "/profile",

    requirePermission(
        "RESUME_VIEW"
    ),

    ResumeController.getProfile
);


/*
 * Create / update own master resume
 */

router.put(
    "/profile",

    requirePermission(
        "RESUME_UPDATE"
    ),

    validate(
        resumeProfileSchema
    ),

    ResumeController.saveProfile
);


/* ================================================================
   CUSTOMIZATION
================================================================ */


/*
 * Get current customization
 */

router.get(
    "/customization",

    requirePermission(
        "RESUME_VIEW"
    ),

    ResumeController.getCustomization
);


/*
 * Populate customization from master profile
 */

router.post(
    "/customization/from-profile",

    requirePermission(
        "RESUME_UPDATE"
    ),

    ResumeController.createCustomizationFromProfile
);


/*
 * Save customized resume
 */

router.put(
    "/customization",

    requirePermission(
        "RESUME_UPDATE"
    ),

    validate(
        resumeCustomizationSchema
    ),

    ResumeController.saveCustomization
);


router.get(
    "/download",
    requirePermission("RESUME_VIEW"),
    ResumeController.downloadResumePdf
);



export default router;