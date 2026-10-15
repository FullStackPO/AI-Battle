import express from "express";

const app = express()

app.get("/health", (req, res) => {
    res.status(200).json({
        "message" : "health check api work well."
    })
})

export default app