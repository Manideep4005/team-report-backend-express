
import { Request, Response, NextFunction } from "express";
import emailReminderService from "../services/emailReminder.service";

export async function getPendingRecipients(
    _req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const users = await emailReminderService.getPendingUsers();

        res.status(200).json({
            success: true,
            count: users.length,
            data: users,
        });
    } catch (error) {
        next(error);
    }
}

export async function getReminderJobs(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const requestedLimit = Number(req.query.limit ?? 20);
        const limit = Number.isFinite(requestedLimit)
            ? requestedLimit
            : 20;

        const jobs =
            await emailReminderService.getRecentJobs(limit);

        res.status(200).json({
            success: true,
            count: jobs.length,
            data: jobs,
        });
    } catch (error) {
        next(error);
    }
}

export async function queueReminder(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const { slotTime } = req.body as {
            slotTime?: string;
        };

        if (typeof slotTime !== "string") {
            res.status(400).json({
                success: false,
                message: "slotTime is required, e.g. 12:00",
            });
            return;
        }

        const result =
            await emailReminderService.queueReminderSlot(slotTime);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }



}



export async function deliverReminderJob(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const { jobId } = req.params;

        const result =
            await emailReminderService.deliverReminderJob(jobId as any);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }


}



export async function cancelReminderJob(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const { jobId } = req.params;

        const result =
            await emailReminderService.cancelOrSkipReminderJob(
                jobId as any,
                "CANCEL",
            );

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

export async function skipReminderJob(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const { jobId } = req.params;

        const result =
            await emailReminderService.cancelOrSkipReminderJob(
                jobId as any,
                "SKIP",
            );

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
}
