import { START, END, StateSchema, MessagesValue, StateGraph } from "@langchain/langgraph";

type Judgement = {
    winner : "solution_1" | "solution_2";
    solution_1_score : number,
    solution_2_score : number
}

type AIBattle = {
    message : typeof MessagesValue,
    solution_1 : string,
    solution_2 : string,
    judgement : Judgement
}

const state : AIBattle = {
    message : MessagesValue,
    solution_1 : "",
    solution_2 : "",
    judgement : {
        winner : "solution_1",
        solution_1_score : 0,
        solution_2_score : 0
    }
}

