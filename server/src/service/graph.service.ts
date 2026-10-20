import { START, END, StateSchema, MessagesValue, StateGraph, ReducedValue } from "@langchain/langgraph";
import type { GraphNode } from "@langchain/langgraph"
import { HumanMessage } from "@langchain/core/messages"

const State = new StateSchema({
    messages : MessagesValue
})

const soultionNode: GraphNode<typeof State> = (state: typeof State) => {

    console.log(state.messages)
    return{
        messages: state.messages[0]
    }
}

const graph = new StateGraph(State)
        .addNode("solution", soultionNode)
        .addEdge(START, "solution")
        .compile();

export default async function (userMessage: string) {
    const result = await graph.invoke({
        messages : {
            new HumanMessage(userMessage)
        }
    })
}