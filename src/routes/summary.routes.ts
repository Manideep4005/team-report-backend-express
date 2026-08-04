import { Router } from "express";
import * as SummaryController from "../controllers/summary.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get(
    "/",
    SummaryController.getSummary
);

router.get("/by-date", SummaryController.getSummaryByDate);

export default router;