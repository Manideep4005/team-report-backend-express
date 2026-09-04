import { Router } from "express";
import * as ReportController from "../controllers/report.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { saveReportSchema } from "../validations/report.validation";
import { requirePermission } from "../middleware/permission.middleware";

const router = Router();

router.use(authenticate);

router.post(
    "/",
    requirePermission("REPORT_CREATE"),
    validate(saveReportSchema),
    ReportController.save
);

router.get(
    "/today",
    requirePermission("REPORT_VIEW_OWN"),
    ReportController.today
);

router.get(
    "/history",
    requirePermission("REPORT_VIEW_OWN"),
    ReportController.history
);

router.get(
    "/export/own",
    requirePermission("REPORT_EXPORT_OWN"),
    ReportController.exportOwn
);

router.get(
    "/export/all",
    requirePermission("REPORT_EXPORT_ALL"),
    ReportController.exportAll
);

router.get(
    "/users",
    requirePermission("REPORT_VIEW_ALL"),
    ReportController.reportUsers
);

router.get(
    "/user/:userId",
    requirePermission("REPORT_VIEW_ALL"),
    ReportController.userReports
);

router.get(
    "/all",
    requirePermission("REPORT_VIEW_ALL"),
    ReportController.all
);

export default router;