import { START, END, StateSchema, MessagesValue, StateGraph, ReducedValue } from "@langchain/langgraph";
import type { GraphNode } from "@langchain/langgraph"
import { HumanMessage } from "@langchain/core/messages"
import { createAgent, providerStrategy } from "langchain";
import * as z from "zod"
import { groqModel, cohereModel, googleModel } from "./model.service.js";

const State = new StateSchema({
    messages : MessagesValue,
    solution_1 : new ReducedValue(z.string().default(""), {
        reducer : (current, next) => {
            return next
        }
    }),
    solution_2 : new ReducedValue(z.string().default(""), {
        reducer : (current, next) => {
            return next
        }
    }),
    judge_recommend : new ReducedValue(z.object().default({
        solution_1_score : 0,
        solution_2_score : 0
    }),
    {
        reducer : (current, next) => {
            return next
        }
    })
})

const solutionNode: GraphNode<typeof State> = async(state : typeof State) => {

    const[groq_solution, cohere_solution] = await Promise.all([
        groqModel.invoke(state.messages[0].text),
        cohereModel.invoke(state.messages[0].text)
    ])

    return{
        solution_1 : groq_solution.text,
        solution_2 : cohere_solution.text
    }

}

const judgeNode: GraphNode<typeof State> = async(state : typeof State) => {

    const { solution_1, solution_2 } = state;

    const judge = createAgent({
        model : googleModel,
        tools : [],
        responseFormat : providerStrategy(z.object({
            solution_1 : z.number().min(0).max(10),
            solution_2 : z.number().min(0).max(10)
        }))
    })

    const judgeResponse = await judge.invoke({
         messages: [
            new HumanMessage(`
                You are an impartial AI Judge.
                Problem: ${state.messages[0].text}
                Solution 1: ${solution_1}
                Solution 2: ${solution_2}

                Evaluate correctness, relevance, completeness, and clarity.
                Score each solution from 0 to 10.
                Return only the structured scores.
            `),
        ],
    })

    const result = judgeResponse.structuredResponse

    return {
        judge_recommend: result
    }

}

const graph = new StateGraph(State)
        .addNode("solution", solutionNode)
        .addNode("judge", judgeNode)
        .addEdge(START, "solution")
        .addEdge("solution", "judge")
        .addEdge("judge", END)
        .compile()


export default async function (userMessage : string){
    const result = await graph.invoke({
        messages : [
            new HumanMessage (userMessage)
        ]
    })

    console.log(result)

    return result.messages
}