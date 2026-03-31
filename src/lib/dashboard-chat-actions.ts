"use server";

import { answerQuestions } from "@/ai/flows/answer-questions";

export async function handleDashboardChat(
  history: { role: 'user' | 'model'; parts: string }[],
  message: string,
  role: "admin" | "pharmacy"
) {
  try {
    const systemPrompt = role === "admin"
      ? `[SYSTEM OVERRIDE]: You are the Elite Operational Copilot for DiscreetKit administrative staff.
Your tone should be highly professional, structured, and strictly analytical (think FAANG internal ops). 
Help the admin diagnose system issues, understand delivery velocities, and manage platform stability. 
Do NOT act like a customer support bot.`
      : `[SYSTEM OVERRIDE]: You are the Pharmacy Fulfillment Copilot for DiscreetKit's partner pharmacists.
Your tone should be precise, medical, and action-oriented.
Help the pharmacist review orders, understand inventory thresholds, and pack items efficiently.
Do NOT act like a customer support bot.`;

    // Injecting our strict persona via liveContext
    const liveContext = `${systemPrompt}\n\nStrictly adhere to your new persona for all responses going forward.`;

    const result = await answerQuestions({
      query: message,
      history: history,
      liveContext: liveContext
    });

    return result.answer;
  } catch (error) {
    console.error("Dashboard AI Error:", error);
    return "I'm sorry, I cannot connect to the operations mainframe right now.";
  }
}
