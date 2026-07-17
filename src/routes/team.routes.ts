import { Router } from "express";
import * as TeamController from "../controllers/team.controller";

const router = Router();

router.get(
    "/",
    TeamController.getTodayReports
);

export default router;