"use server";

import { answerQuestions } from "@/ai/flows/answer-questions";

export async function handleDashboardChat(
  history: { role: 'user' | 'model'; parts: string }[],
  message: string,
  role: "admin" | "pharmacy"
) {
  try {
    const result = await answerQuestions({
      query: message,
      history: history,
      role: role
    });

    return result.answer;
  } catch (error) {
    console.error("Dashboard AI Error:", error);
    return "I'm sorry, I cannot connect to the operations mainframe right now.";
  }
}
