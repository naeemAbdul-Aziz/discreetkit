/**
 * @file Simple answer function that doesn't use Genkit
 * @description Temporary fallback for AI functionality
 */
'use server';

export type AnswerQuestionsInput = {
  query: string;
};

export type AnswerQuestionsOutput = {
  answer: string;
};

export async function answerQuestions(input: AnswerQuestionsInput): Promise<AnswerQuestionsOutput> {
  // Temporary fallback responses for common questions
  const query = input.query.toLowerCase();
  
  let answer = "I'm here to help! For detailed information about our products, pricing, and services, please browse our website or contact our support team.";
  
  if (query.includes('product') || query.includes('test') || query.includes('kit')) {
    answer = "We offer a wide range of confidential test kits and wellness products. You can browse our products section to see our full catalog, including test kits, medications, and wellness bundles.";
  } else if (query.includes('order') || query.includes('buy') || query.includes('purchase')) {
    answer = "Ordering is simple! Browse our products, add items to your cart, and checkout securely. We offer discreet packaging and delivery. You can track your order status in your account.";
  } else if (query.includes('privacy') || query.includes('confidential') || query.includes('discreet')) {
    answer = "Privacy is our top priority. All orders are shipped in discreet packaging with no indication of contents. Your personal information is kept strictly confidential and secure.";
  } else if (query.includes('delivery') || query.includes('shipping') || query.includes('location')) {
    answer = "We offer secure delivery to your preferred location. Shipping options and locations are available during checkout. All packages are sent in discreet packaging.";
  } else if (query.includes('support') || query.includes('help') || query.includes('contact')) {
    answer = "Our partner care team is here to help! You can reach us through the Partner Care section of our website or contact our support team directly for assistance.";
  }
  
  return { answer };
}