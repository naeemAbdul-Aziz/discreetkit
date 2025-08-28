
'use server';

import { z } from 'zod';
import { createMockOrder, getMockOrder } from './data';
import { answerQuestions } from '@/ai/flows/answer-questions';
import { revalidatePath } from 'next/cache';
import { type CartItem } from '@/hooks/use-cart';

const orderSchema = z.object({
  cartItems: z.string().min(1, 'Cart cannot be empty.'),
  deliveryArea: z.string().min(3, 'Delivery area is required.'),
  deliveryAddressNote: z.string().optional(),
  phone_masked: z.string().min(10, 'A valid phone number is required.'),
  otherDeliveryArea: z.string().optional(),
});

export async function createOrderAction(prevState: any, formData: FormData) {
  const validatedFields = orderSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Error: Please check the form fields.',
      success: false,
    };
  }

  const { deliveryArea, otherDeliveryArea } = validatedFields.data;
  if (deliveryArea === 'Other' && (!otherDeliveryArea || otherDeliveryArea.length < 3)) {
      return {
          errors: { otherDeliveryArea: ['Please specify your delivery area.'] },
          message: 'Error: Please specify your delivery area.',
          success: false,
      }
  }


  try {
    const cartItems: CartItem[] = JSON.parse(validatedFields.data.cartItems);
    if (cartItems.length === 0) {
      return { message: 'Your cart is empty.', success: false };
    }
    
    // In a real app, you would process all items, calculate total, etc.
    // For this mock, we'll just create an order based on the first item.
    const firstItem = cartItems[0];
    
    const order = createMockOrder(firstItem.id, firstItem.quantity);
    revalidatePath('/order');
    return { success: true, code: order.code, message: null, errors: {} };
  } catch (error) {
    console.error(error);
    return {
      message: 'Failed to create order. Please try again.',
      success: false,
    };
  }
}

export async function getOrderAction(code: string) {
  return getMockOrder(code);
}


export async function handleChat(history: { role: 'user' | 'model', parts: string }[], message: string) {
  'use server';
  try {
    const result = await answerQuestions({ query: message });
    return result.answer;
  } catch (error) {
    console.error("AI Error:", error);
    return "I'm sorry, I'm having trouble connecting right now. Please try again later.";
  }
}
