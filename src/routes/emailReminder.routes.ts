
import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware";
import { requirePermission } from "../middleware/permission.middleware";

import {
    cancelReminderJob,
    deliverReminderJob,
    getPendingRecipients,
    getReminderJobs,
    queueReminder,
    skipReminderJob,
} from "../controllers/emailReminder.controller";

const router = Router();

router.use(authenticate);
router.use(requirePermission("EMAIL_REMINDER_VIEW"));

router.get("/pending", getPendingRecipients);
router.get("/jobs", getReminderJobs);
router.post("/queue", queueReminder);
router.post("/jobs/:jobId/deliver", deliverReminderJob);
router.post("/jobs/:jobId/cancel", cancelReminderJob);
router.post("/jobs/:jobId/skip", skipReminderJob);

export default router;
