import cors from "cors";
import { env } from "./env";

const allowedOrigins = [
    env.CLIENT_URL,
    "http://localhost:5173",
    "http://localhost:3000",
];

export default cors({
    origin: (origin, callback) => {
        // Allow requests without Origin (Postman, curl, server-to-server)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
});