import { ChatGoogle } from "@langchain/google";
import { ChatCohere } from "@langchain/cohere";
import { ChatGroq } from "@langchain/groq";
import config from "../config/config.js";

export const googleModel = new ChatGoogle({
    model : "gemini-flash-latest",
    apiKey : config.GEMINI_API_KEY
})

export const cohereModel = new ChatCohere({
    model : "command-a-03-2025",
    apiKey : config.COHERE_API_KEY
})

export const groqModel = new ChatGroq({
    model : "openai/gpt-oss-120b",
    apiKey : config.GROQ_API_KEY
})