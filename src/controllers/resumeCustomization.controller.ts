import {
    Request,
    Response,
} from "express";

import {
    asyncHandler,
} from "../utils/asyncHandler";

import resumeCustomizationService
    from "../services/resumeCustomization.service";


/*
 * ================================================================
 * CREATE CUSTOMIZATION
 * ================================================================
 */

export const createCustomization =
    asyncHandler(
        async (
            req: Request,
            res: Response
        ) => {

            const customization =
                await resumeCustomizationService.createFromProfile(
                    req.user.id
                );


            res.status(201).json({

                success: true,

                message:
                    "Resume customization created successfully.",

                data:
                    customization,

            });

        }
    );


/*
 * ================================================================
 * GET CUSTOMIZATION
 * ================================================================
 */

export const getCustomization =
    asyncHandler(
        async (
            req: Request,
            res: Response
        ) => {

            const customization =
                await resumeCustomizationService.getCustomization(
                    req.user.id
                );


            res.json({

                success: true,

                data:
                    customization,

            });

        }
    );