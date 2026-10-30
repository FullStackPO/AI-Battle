import express from 'express';
import runGraph from "./service/graph.service.js";
import cors from 'cors';

const app = express();

app.use(express.json())

app.use(cors({
    origin: "http://localhost:5173",
    methods: ["POST"],
    credentials: true,
}))

app.post("/invoke", async (req, res) => {

    const { input } = req.body
    const result = await runGraph(input)

    res.status(200).json({
        message: "Graph executed successfully",
        success: true,
        result
    })

})



export default app;