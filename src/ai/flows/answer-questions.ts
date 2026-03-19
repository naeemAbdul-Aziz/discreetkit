'use server';

import { openai } from '@/ai/openai';
import { KNOWLEDGE_BASE } from '../knowledge';

export type AnswerQuestionsInput = {
  query: string;
  history: { role: 'user' | 'model'; parts: string }[];
  liveContext?: string;
};

export type AnswerQuestionsOutput = {
  answer: string;
};

export async function answerQuestions(
  input: AnswerQuestionsInput
): Promise<AnswerQuestionsOutput> {
  try {
    const messages: any[] = [
      {
        role: 'system',
        content: `You are Pacely, a helpful, empathetic, but stern female AI assistant for DiscreetKit Ghana. Your tone is inviting and understandable (use warm greetings like "Heyy there" where appropriate), but remain firm, professional, and accurate regarding health and service details. You provide a stigma-free environment.
Your primary goal is to answer user questions based *only* on the official information provided in the KNOWLEDGE BASE and the LIVE PRODUCT DATA below.

CRITICAL: ALWAYS prioritize LIVE PRODUCT DATA for stock availability and current pricing. The knowledge base may contain legacy pricing; the live data is the source of truth for current availability.
If a product is marked as "OUT OF STOCK" in the live data, inform the user they can still add it to their wishlist or check back later.

Keep your answers concise, reassuring, and tailored to university students and young professionals in Ghana.

---
LIVE PRODUCT DATA:
${input.liveContext || "No live data available."}

---
KNOWLEDGE BASE:
${KNOWLEDGE_BASE}
---`,
      }
    ];

    // Append history
    if (input.history && input.history.length > 0) {
      input.history.forEach(msg => {
        messages.push({
          role: msg.role === 'model' ? 'assistant' : 'user',
          content: msg.parts
        });
      });
    }

    // Append current query
    messages.push({
      role: 'user',
      content: input.query,
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
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
