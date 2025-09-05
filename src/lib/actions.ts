
/**
 * @file This file contains all the server actions for the application, which handle
 * database operations and other server-side logic. These actions are designed to be
 * securely called from client-side components.
 */
'use server';

import {z} from 'zod';
import {generateTrackingCode, type Order} from './data';
import {answerQuestions} from '@/ai/flows/answer-questions';
import {revalidatePath} from 'next/cache';
import {type CartItem} from '@/hooks/use-cart';
import {getSupabaseAdminClient} from './supabase';
import { discounts } from './data';

const orderSchema = z.object({
  cartItems: z.string().min(1, 'Cart cannot be empty.'),
  deliveryArea: z.string().min(3, 'Delivery area is required.'),
  deliveryAddressNote: z.string().optional(),
  phone_masked: z.string().min(10, 'A valid phone number is required.'),
  otherDeliveryArea: z.string().optional(),
  subtotal: z.string(),
  studentDiscount: z.string(),
  deliveryFee: z.string(),
  totalPrice: z.string(),
});

/**
 * Creates a new order in the database.
 * This action is called from the order form and handles validation,
 * data insertion, and initial order event creation.
 *
 * @param prevState - The previous state of the form, used by `useActionState`.
 * @param formData - The data submitted from the order form.
 * @returns An object containing the success status, a message, any validation errors, and the new order code.
 */
export async function createOrderAction(prevState: any, formData: FormData) {
  const supabaseAdmin = getSupabaseAdminClient();
  const validatedFields = orderSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Error: Please check the form fields.',
      success: false,
      code: null,
    };
  }

  const {deliveryArea, otherDeliveryArea} = validatedFields.data;
  if (deliveryArea === 'Other' && (!otherDeliveryArea || otherDeliveryArea.length < 3)) {
    return {
      errors: {otherDeliveryArea: ['Please specify your delivery area.']},
      message: 'Error: Please specify your delivery area.',
      success: false,
      code: null,
    };
  }

  try {
    const cartItems: CartItem[] = JSON.parse(validatedFields.data.cartItems);
    if (cartItems.length === 0) {
      return {message: 'Your cart is empty.', success: false, code: null};
    }

    const code = generateTrackingCode();
    const finalDeliveryArea =
      deliveryArea === 'Other' ? otherDeliveryArea : deliveryArea;
    
    const isStudent = discounts.some(d => d.campus === finalDeliveryArea);

    const priceDetails = {
      subtotal: parseFloat(validatedFields.data.subtotal),
      student_discount: parseFloat(validatedFields.data.studentDiscount),
      delivery_fee: parseFloat(validatedFields.data.deliveryFee),
      total_price: parseFloat(validatedFields.data.totalPrice),
    };

    // 1. Insert into orders table
    const {data: orderData, error: orderError} = await supabaseAdmin
      .from('orders')
      .insert({
        code,
        items: cartItems,
        status: 'received',
        delivery_area: finalDeliveryArea,
        delivery_address_note: validatedFields.data.deliveryAddressNote,
        phone_masked: validatedFields.data.phone_masked,
        is_student: isStudent,
        ...priceDetails,
      })
      .select('id')
      .single();

    if (orderError) throw orderError;
    if (!orderData)
      throw new Error('Failed to retrieve order ID after creation.');

    // 2. Insert initial event into order_events
    const {error: eventError} = await supabaseAdmin.from('order_events').insert({
      order_id: orderData.id,
      status: 'Received',
      note: 'Your order has been received and is awaiting processing.',
    });

    if (eventError) throw eventError;

    revalidatePath('/order');
    return {success: true, code, message: null, errors: {}};
  } catch (error) {
    console.error('Supabase Error:', error);
    return {
      message: 'Failed to create order due to a database error. Please try again.',
      success: false,
      code: null,
    };
  }
}

/**
 * Retrieves an order and its associated events from the database using a tracking code.
 *
 * @param code - The unique tracking code for the order.
 * @returns The order object if found, otherwise null.
 */
export async function getOrderAction(code: string): Promise<Order | null> {
  const supabaseAdmin = getSupabaseAdminClient();
  const {data: order, error} = await supabaseAdmin
    .from('orders')
    .select(
      `
      *,
      order_events (
        status,
        note,
        created_at
      )
    `
    )
    .eq('code', code)
    .single();

  if (error || !order) {
    console.error('Error fetching order:', error);
    return null;
  }

  const items = order.items as CartItem[];
  
  return {
    id: order.id.toString(),
    code: order.code,
    status: order.status,
    items: items,
    deliveryArea: order.delivery_area,
    deliveryAddressNote: order.delivery_address_note,
    isStudent: order.is_student,
    subtotal: order.subtotal,
    studentDiscount: order.student_discount,
    deliveryFee: order.delivery_fee,
    totalPrice: order.total_price,
    events: order.order_events
      .map(e => ({
        status: e.status,
        note: e.note ?? '',
        date: e.created_at,
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  };
}

/**
 * Handles the AI chat interaction by calling the Genkit flow.
 *
 * @param history - The current chat history.
 * @param message - The new message from the user.
 * @returns The AI's response as a string.
 */
export async function handleChat(
  history: {role: 'user' | 'model'; parts: string}[],
  message: string
) {
  'use server';
  try {
    const result = await answerQuestions({query: message});
    return result.answer;
  } catch (error) {
    console.error('AI Error:', error);
    return "I'm sorry, I'm having trouble connecting right now. Please try again later.";
  }
}
