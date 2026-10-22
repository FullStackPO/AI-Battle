import express from "express";
import useGraph from "./service/graph.service.js"

const app = express()

app.get("/health", (req, res) => {
    res.status(200).json({
        "message" : "health check api work well."
    })
})

app.post("/use-graph", async(req, res) => {
    await useGraph("What is the Capital of France?")
})

export default app