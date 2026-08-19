import { Request, Response } from "express";



import publicMonitorService
    from "../services/publicMonitor.service";
import { asyncHandler } from "../utils/asyncHandler";


export const getPublicMonitor =
    asyncHandler(
        async (
            req: Request,
            res: Response
        ) => {

            const { token } =
                req.params;

            const date =
                req.query.date as
                | string
                | undefined;


            if (!token) {
                res.status(400).json({
                    success: false,
                    message:
                        "Monitoring token is required.",
                });

                return;
            }


            const data =
                await publicMonitorService
                    .getPublicMonitor(
                        token as any,
                        date
                    );


            res.json({
                success: true,
                data,
            });
        }
    );