import { ChatGoogle } from "@langchain/google";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing from the .env file");
}

export const googleModel = new ChatGoogle({
    model: "gemini-2.5-flash",
    apiKey: apiKey,
});