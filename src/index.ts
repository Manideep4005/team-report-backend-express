import app from "./app";
import { env } from "./config/env";

console.log("Process ID:", process.pid);
console.log("Started at:", new Date().toISOString());

app.listen(env.PORT, () => {
    console.log(`🚀 Server running on port ${env.PORT}`);
});