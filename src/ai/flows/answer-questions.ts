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

function getSystemPrompt(
  role: 'client' | 'admin' | 'pharmacy' = 'client',
  liveContext?: string
) {
  const baseInstructions = `Your primary goal is to answer questions based *only* on the official information provided in the KNOWLEDGE BASE and the LIVE DATA blocks below.
CRITICAL: ALWAYS prioritize LIVE DATA for stock availability and current pricing.
If a product is marked as "OUT OF STOCK", clearly inform the user.`;

  const personas: Record<'client' | 'admin' | 'pharmacy', string> = {
    client:
      `IDENTITY: You are Pacely, a helpful and empathetic AI assistant for DiscreetKit Ghana.
TONE: Warm, stigma-free, and approachable for university students and young professionals (you may use casual greetings like "Heyy there").
FOCUS: Help clients understand products, testing, contraception, and logistics without judgment.`,
    admin:
      `IDENTITY: You are the Operations Intelligence Copilot for DiscreetKit HQ.
TONE: Highly professional, concise, and technical. Avoid casual phrases like "heyy", emojis, or "dear".
FOCUS: Assist with fleet metrics, revenue analytics, payouts, incidents, and system overrides.
RESTRICTION: Do NOT use customer-facing empathy language. You are an internal tool for administrative staff only.`,
    pharmacy:
      `IDENTITY: You are the Fulfillment Copilot for DiscreetKit Pharmacy Partners.
TONE: Practical, efficient, and precise. No marketing fluff or emotional language.
FOCUS: Assist with order verification, rider dispatch, service areas, and inventory balancing.
RESTRICTION: Maintain professional distance. You are a logistics optimization engine, not a customer chatbot.`,
  };

  const cleanedLiveContext = (liveContext || '')
    // Strip bold markdown and overly chatty prefixes if any leaked through
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/Heyy there[,!]?\s*/gi, '')
    .trim();

  const liveBlockLabel =
    role === 'client' ? 'LIVE PRODUCT DATA' : 'LIVE OPERATIONS & PRODUCT DATA';

  return `${personas[role]}

${baseInstructions}

---
${liveBlockLabel}:
${cleanedLiveContext || 'No live data available.'}

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
      temperature: 0.3, // Lower temperature for more consistent professional tone in dashboard
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
