import {
    Request,
    Response,
} from "express";

import {
    asyncHandler,
} from "../utils/asyncHandler";

import resumeService
    from "../services/resume.service";

import {
    generateResumePdf,
} from "../utils/resumePdf";


/* ================================================================
   MASTER PROFILE
================================================================ */


/*
 * GET /api/resume/profile
 */

export const getProfile =
    asyncHandler(
        async (
            req: Request,
            res: Response,
        ) => {

            const profile =
                await resumeService.getProfile(
                    req.user.id,
                );


            res.json({
                success: true,

                data: profile,
            });
        },
    );


/*
 * PUT /api/resume/profile
 */

export const saveProfile =
    asyncHandler(
        async (
            req: Request,
            res: Response,
        ) => {

            const profile =
                await resumeService.saveProfile(
                    req.user.id,
                    req.body,
                );


            res.json({

                success: true,

                message:
                    "Resume profile saved successfully.",

                data: profile,
            });
        },
    );


/* ================================================================
   CUSTOMIZATION
================================================================ */


/*
 * GET /api/resume/customization
 */

export const getCustomization =
    asyncHandler(
        async (
            req: Request,
            res: Response,
        ) => {

            const customization =
                await resumeService.getCustomization(
                    req.user.id,
                );


            res.json({

                success: true,

                data: customization,
            });
        },
    );


/*
 * POST /api/resume/customization/from-profile
 */

export const createCustomizationFromProfile =
    asyncHandler(
        async (
            req: Request,
            res: Response,
        ) => {

            const customization =
                await resumeService.createCustomizationFromProfile(
                    req.user.id,
                );


            res.json({

                success: true,

                message:
                    "Resume customization prepared successfully.",

                data: customization,
            });
        },
    );


/*
 * PUT /api/resume/customization
 */

export const saveCustomization =
    asyncHandler(
        async (
            req: Request,
            res: Response,
        ) => {

            const customization =
                await resumeService.saveCustomization(
                    req.user.id,
                    req.body,
                );


            res.json({

                success: true,

                message:
                    "Resume customization saved successfully.",

                data: customization,
            });
        },
    );


/*
 * GET /api/resume/download
 */

export const downloadResumePdf =
    asyncHandler(
        async (
            req: Request,
            res: Response,
        ) => {

            const resume =
                await resumeService.getResumeForPdf(
                    req.user.id,
                );


            const safeName =
                (
                    resume.fullName ||
                    "resume"
                )
                    .trim()
                    .replace(
                        /[^a-zA-Z0-9]+/g,
                        "-",
                    )
                    .replace(
                        /^-+|-+$/g,
                        "",
                    )
                    .toLowerCase();


            generateResumePdf(
                res,
                resume,
                `${safeName || "resume"}.pdf`,
            );
        },
    );