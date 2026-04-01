'use server';

import { openai } from '@/ai/openai';
import { KNOWLEDGE_BASE } from '../knowledge';

export type AnswerQuestionsInput = {
  query: string;
  history: { role: 'user' | 'model'; parts: string }[];
  liveContext?: string;
  role?: 'client' | 'admin' | 'pharmacy';
};

export type AnswerQuestionsOutput = {
  answer: string;
};

function getSystemPrompt(role: 'client' | 'admin' | 'pharmacy' = 'client', liveContext?: string) {
  const baseInstructions = `Your primary goal is to answer questions based *only* on the official information provided in the KNOWLEDGE BASE and the LIVE PRODUCT DATA below.
CRITICAL: ALWAYS prioritize LIVE PRODUCT DATA for stock availability and current pricing.
If a product is marked as "OUT OF STOCK", inform the user.`;

  const personas = {
    client: `You are Pacely, a helpful and empathetic AI assistant for DiscreetKit Ghana. Your tone is inviting and understandable (use warm greetings like "Heyy there"). You provide a stigma-free environment for university students and young professionals.`,
    admin: `You are the Elite Operational Copilot for DiscreetKit administrative staff. Your tone is highly professional, structured, and strictly analytical (FAANG internal ops style). Focus on platform health, system metrics, and operational velocity. Do NOT act like a customer support bot.`,
    pharmacy: `You are the Pharmacy Fulfillment Copilot for DiscreetKit's partner pharmacists. Your tone is precise, practical, and logistics-oriented. Help with order review, rider coordination, and medical packaging standards. Do NOT act like a customer support bot.`
  };

  return `${personas[role]}

${baseInstructions}

---
LIVE PRODUCT DATA:
${liveContext || "No live data available."}

---
KNOWLEDGE BASE:
${KNOWLEDGE_BASE}
---`;
}

export async function answerQuestions(
  input: AnswerQuestionsInput
): Promise<AnswerQuestionsOutput> {
  try {
    const messages: any[] = [
      {
        role: 'system',
        content: getSystemPrompt(input.role, input.liveContext),
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
    return {
      answer: "I'm here to help! For detailed information about our products and services, please browse our website or contact our support team.",
    };
  }
}
