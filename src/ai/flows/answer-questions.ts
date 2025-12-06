'use server';

import { openai } from '@/ai/openai';
import { KNOWLEDGE_BASE } from '../knowledge';

export type AnswerQuestionsInput = {
  query: string;
};

export type AnswerQuestionsOutput = {
  answer: string;
};

export async function answerQuestions(
  input: AnswerQuestionsInput
): Promise<AnswerQuestionsOutput> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a helpful, friendly, and stigma-free AI assistant for DiscreetKit Ghana.
Your primary goal is to answer user questions based *only* on the official information provided in the KNOWLEDGE BASE below.
Do not invent information or use external knowledge. If the answer is not in the knowledge base, politely state that you don't have that information.

Keep your answers concise, reassuring, and tailored to university students and young professionals in Ghana.

---
KNOWLEDGE BASE:
${KNOWLEDGE_BASE}
---`,
        },
        {
          role: 'user',
          content: input.query,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const answer = completion.choices[0]?.message?.content ||
      "I'm sorry, I couldn't generate a response. Please try again.";

    return { answer };
  } catch (error) {
    console.error('OpenAI API error:', error);
    // Fallback to simple response
    return {
      answer: "I'm here to help! For detailed information about our products, pricing, and services, please browse our website or contact our support team.",
    };
  }
}
