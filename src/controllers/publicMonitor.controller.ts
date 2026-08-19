import { Request, Response } from "express";

import publicMonitorService from "../services/publicMonitor.service";
import { asyncHandler } from "../utils/asyncHandler";
import { createMonitorLinkSchema } from "../validations/publicMonitor.validation";


export const createLink = asyncHandler(
    async (req: Request, res: Response) => {

        const parsed =
            createMonitorLinkSchema.safeParse(
                req.body
            );

        if (!parsed.success) {
            res.status(400).json({
                success: false,
                message: "Invalid request.",
                errors: parsed.error.flatten(),
            });

            return;
        }


        const result =
            await publicMonitorService.createLink({
                createdById: req.user.id,

                expirationType:
                    parsed.data.expirationType,

                expirationValue:
                    parsed.data.expirationValue,
            });


        /*
         * Build the public URL.
         *
         * We return the URL only here.
         * The raw token is never stored in DB.
         */
        const baseUrl =
            process.env.CLIENT_URL ||
            "http://localhost:5173";

        const url =
            `${baseUrl}/monitor/${result.token}`;


        res.status(201).json({
            success: true,

            data: {
                id: result.id,
                url,

                expiresAt:
                    result.expiresAt,

                isActive:
                    result.isActive,

                createdAt:
                    result.createdAt,
            },
        });
    }
);


export const getLinks = asyncHandler(
    async (_req: Request, res: Response) => {

        const links =
            await publicMonitorService.getLinks();

        res.json({
            success: true,
            data: links,
        });
    }
);


export const revokeLink = asyncHandler(
    async (req: Request, res: Response) => {

        const { id } = req.params;


        if (!id) {
            res.status(400).json({
                success: false,
                message:
                    "Monitoring link ID is required.",
            });

            return;
        }


        const result =
            await publicMonitorService.revokeLink(
                id as any,
                req.user.id
            );


        res.json({
            success: true,
            message:
                "Monitoring link revoked successfully.",
            data: result,
        });
    }
);