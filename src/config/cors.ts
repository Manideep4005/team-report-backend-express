import cors from "cors";
import { env } from "./env";

export const allowedOrigins = [
    env.CLIENT_URL,
    "http://localhost:5173",
    "http://localhost:3000",
];

export default cors({
    origin: (origin, callback) => {
        // Allow requests without Origin (Postman, curl, server-to-server)
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
});