
'use server';
/**
 * @fileOverview An AI chatbot assistant for answering user questions about our products, the ordering process, and available locations.
 *
 * - answerQuestions - A function that handles the question answering process.
 * - AnswerQuestionsInput - The input type for the answerQuestions function.
 * - AnswerQuestionsOutput - The return type for the answerQuestions function.
 */

import {ai} from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import {z} from 'genkit';
import { KNOWLEDGE_BASE } from '../knowledge';

const AnswerQuestionsInputSchema = z.object({
  query: z.string().describe('The user question about our health products, the ordering process, or available locations.'),
});
export type AnswerQuestionsInput = z.infer<typeof AnswerQuestionsInputSchema>;

const AnswerQuestionsOutputSchema = z.object({
  answer: z.string().describe('The answer to the user question.'),
});
export type AnswerQuestionsOutput = z.infer<typeof AnswerQuestionsOutputSchema>;

export async function answerQuestions(input: AnswerQuestionsInput): Promise<AnswerQuestionsOutput> {
  return answerQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerQuestionsPrompt',
  input: {schema: AnswerQuestionsInputSchema},
  output: {schema: AnswerQuestionsOutputSchema},
  model: googleAI('gemini-1.5-flash'),
  prompt: `You are a helpful, friendly, and stigma-free AI assistant for DiscreetKit Ghana.
Your primary goal is to answer user questions based *only* on the official information provided in the KNOWLEDGE BASE below.
Do not invent information or use external knowledge. If the answer is not in the knowledge base, politely state that you don't have that information.

Keep your answers concise, reassuring, and tailored to university students and young professionals in Ghana.

---
KNOWLEDGE BASE:
{{{knowledge}}}
---

User Question:
"{{query}}"

Answer the user's question based on the knowledge base.`,
});

const answerQuestionsFlow = ai.defineFlow(
  {
    name: 'answerQuestionsFlow',
    inputSchema: AnswerQuestionsInputSchema,
    outputSchema: AnswerQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt({
      ...input,
      knowledge: KNOWLEDGE_BASE,
    });
    return output!;
  }
);
