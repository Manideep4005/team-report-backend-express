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
import userRoutes from "./routes/user.routes";
import roleRoutes from "./routes/role.routes";
import permissionRoutes from "./routes/permission.routes";
import loginHistoryRoutes from "./routes/loginHistory.routes";

const app = express();

app.use(cors);

app.use(express.json());

app.use(cookieParser());


app.use((req, res, next) => {
    res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    next();
});

app.get("/health", (_, res) => {
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
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/permissions", permissionRoutes);
app.use(
    "/api/login-history",
    loginHistoryRoutes
);

// 404 should be AFTER all routes
app.use(notFoundMiddleware);

// Error handler should be LAST
app.use(errorMiddleware);

export default app; 