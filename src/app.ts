import express from "express";
import cookieParser from "cookie-parser";
import cors from "./config/cors";

import authRoutes from "./routes/auth.routes";
import reportRoutes from "./routes/report.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import summaryRoutes from "./routes/summary.routes";
import teamRoutes from "./routes/team.routes";
import profileRoutes from "./routes/profile.routes";

import { errorMiddleware } from "./middleware/error.middleware";
import { notFoundMiddleware } from "./middleware/notFound.middleware";

const app = express();

app.use(cors);

app.use(express.json());

app.use(cookieParser());

app.get("/", (_, res) => {
    res.json({
        success: true,
        message: "Backend Running 🚀",
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/summary", summaryRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/profile", profileRoutes);

// 404 should be AFTER all routes
app.use(notFoundMiddleware);

// Error handler should be LAST
app.use(errorMiddleware);

export default app; 