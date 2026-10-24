import express from "express";
import useGraph from "./service/graph.service.js"

const app = express()

app.post("/use-graph", async(req, res) => {
    const problem = await useGraph("Write factorial code in js?")
    res.json(
        problem
    )
})

export default app