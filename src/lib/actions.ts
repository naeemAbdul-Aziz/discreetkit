
'use server';

import { z } from 'zod';
import { generateTrackingCode, type Order } from './data';
import { answerQuestions } from '@/ai/flows/answer-questions';
import { revalidatePath } from 'next/cache';
import { type CartItem } from '@/hooks/use-cart';
import { supabaseAdmin } from './supabase';

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
    };
  }

  try {
    const cartItems: CartItem[] = JSON.parse(validatedFields.data.cartItems);
    if (cartItems.length === 0) {
      return { message: 'Your cart is empty.', success: false };
    }

    const code = generateTrackingCode();
    const finalDeliveryArea = deliveryArea === 'Other' ? otherDeliveryArea : deliveryArea;
    
    const priceDetails = {
        subtotal: parseFloat(validatedFields.data.subtotal),
        student_discount: parseFloat(validatedFields.data.studentDiscount),
        delivery_fee: parseFloat(validatedFields.data.deliveryFee),
        total_price: parseFloat(validatedFields.data.totalPrice),
    };

    // 1. Insert into orders table
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        code,
        items: cartItems,
        status: 'received',
        delivery_area: finalDeliveryArea,
        delivery_address_note: validatedFields.data.deliveryAddressNote,
        phone_masked: validatedFields.data.phone_masked,
        ...priceDetails,
      })
      .select('id')
      .single();

    if (orderError) throw orderError;
    if (!orderData) throw new Error('Failed to retrieve order ID after creation.');

    // 2. Insert initial event into order_events
    const { error: eventError } = await supabaseAdmin.from('order_events').insert({
      order_id: orderData.id,
      status: 'Received',
      note: 'Your order has been received and is awaiting processing.',
    });

    if (eventError) throw eventError;

    revalidatePath('/order');
    return { success: true, code, message: null, errors: {} };
  } catch (error) {
    console.error('Supabase Error:', error);
    return {
      message: 'Failed to create order due to a database error. Please try again.',
      success: false,
    };
  }
}

export async function getOrderAction(code: string): Promise<Order | null> {
  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select(
      `
      id,
      code,
      items,
      status,
      created_at,
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
  
  // Flatten the structure to match the frontend's expected `Order` type
  const firstItem = Array.isArray(order.items) && order.items.length > 0 ? order.items[0] : { name: 'N/A', quantity: 0 };

  return {
    id: order.id.toString(),
    code: order.code,
    productName: `${firstItem.name} (x${firstItem.quantity})${order.items.length > 1 ? ` and ${order.items.length - 1} other(s)` : ''}`,
    status: order.status as Order['status'],
    events: order.order_events.map(e => ({
        status: e.status,
        note: e.note ?? '',
        date: e.created_at
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  };
}

export async function handleChat(history: { role: 'user' | 'model'; parts: string }[], message: string) {
  'use server';
  try {
    const result = await answerQuestions({ query: message });
    return result.answer;
  } catch (error) {
    console.error('AI Error:', error);
    return "I'm sorry, I'm having trouble connecting right now. Please try again later.";
  }
}
