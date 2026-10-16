import dotenv from "dotenv"
dotenv.config()

type Config = {
    GEMINI_API_KEY : string,
    MISTRAL_API_KEY : string,
    COHERE_API_KEY : string
}

const config: Config= {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
    MISTRAL_API_KEY: process.env.MISTRAL_API_KEY || "",
    COHERE_API_KEY: process.env.COHERE_API_KEY || ""
};

export default config