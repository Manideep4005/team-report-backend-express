import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Express running on Vercel 🚀",
    });
});

app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "Dummy API Working",
        time: new Date(),
    });
});

export default app;