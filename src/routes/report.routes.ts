import { Router } from "express";
import * as ReportController from "../controllers/report.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { saveReportSchema } from "../validations/report.validation";

const router = Router();

router.use(authenticate);

router.post(
    "/",
    validate(saveReportSchema),
    ReportController.save
);

router.get(
    "/today",
    ReportController.today
);

router.get(
    "/history",
    ReportController.history
);

export default router;