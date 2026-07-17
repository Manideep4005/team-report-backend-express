import cors from "cors";
import { env } from "./env";

export default cors({
    origin: env.CLIENT_URL,
    credentials: true,
});