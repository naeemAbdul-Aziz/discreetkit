

/**
 * @file This file contains all the server actions for the application, which handle
 * database operations and other server-side logic. These actions are designed to be
 * securely called from client-side components.
 */
'use server';

import { z } from 'zod';
import { generateTrackingCode, type Order } from './data';
import { assignPharmacyForDeliveryArea, sendPharmacyOrderNotification } from './notifications';
// Temporarily using fallback to fix build issues
// Use Genkit flow when Google GenAI API key is configured, otherwise fallback
let _answerQuestions: ((input: { query: string }) => Promise<{ answer: string }>) | null = null;
async function getAnswerQuestions() {
  if (_answerQuestions) return _answerQuestions;
  const hasGenAI = !!process.env.GOOGLE_GENAI_API_KEY;
  if (hasGenAI) {
    const mod = await import('@/ai/flows/answer-questions');
    _answerQuestions = mod.answerQuestions;
  } else {
    const mod = await import('@/ai/flows/answer-questions-fallback');
    _answerQuestions = mod.answerQuestions;
  }
  return _answerQuestions;
}
import { revalidatePath } from 'next/cache';
import { type CartItem } from '@/hooks/use-cart';
import { getSupabaseAdminClient, createSupabaseServerClient } from './supabase';
import { redirect } from 'next/navigation';

// SMS utility function
export async function sendSMS(phone: string, message: string): Promise<{ ok: boolean; recipient: string; status?: number; body?: any; error?: string }> {
  let arkeselApiKey = process.env.ARKESEL_API_KEY;
  // Trim accidental quotes from env var (some deploy UIs add quotes)
  if (typeof arkeselApiKey === 'string') arkeselApiKey = arkeselApiKey.replace(/^"|"$/g, '').trim();

  console.log('sendSMS called — phone:', phone, 'messagePreview:', message?.slice(0, 120));
  console.log('Arkesel key present:', !!arkeselApiKey, 'key length:', (arkeselApiKey || '').length);

  if (!arkeselApiKey || arkeselApiKey.length === 0) {
    const msg = 'SMS not sent: Arkesel API key not configured';
    console.warn(msg);
    return { ok: false, recipient: phone, error: msg };
  }

  // Format phone number for Ghana (add 233 prefix if starts with 0)
  const recipient = phone.startsWith('0') ? `233${phone.substring(1)}` : phone;
  const senderId = process.env.ARKESEL_SENDER_ID || 'DiscreetKit';

  console.log('Arkesel SMS - recipient:', recipient, 'sender:', senderId, 'messagePreview:', message.slice(0, 50) + '...');

  try {
    // Build URL with query parameters as per Arkesel documentation
    const url = new URL('https://sms.arkesel.com/sms/api');
    url.searchParams.append('action', 'send-sms');
    url.searchParams.append('api_key', arkeselApiKey);
    url.searchParams.append('to', recipient);
    url.searchParams.append('from', senderId);
    url.searchParams.append('sms', message);

    // Add use_case for Nigerian numbers (2349xxxxxxxx)
    if (recipient.startsWith('234')) {
      url.searchParams.append('use_case', 'promotional');
    }

    console.log('Arkesel API URL (without key):', url.toString().replace(/api_key=[^&]+/, 'api_key=***'));

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    let responseBody: any;
    try {
      responseBody = await response.json();
    } catch {
      responseBody = await response.text();
    }

    console.log('Arkesel response status:', response.status, 'body:', responseBody);

    if (!response.ok) {
      console.warn('Arkesel SMS API Error:', { status: response.status, body: responseBody });
      return {
        ok: false,
        recipient,
        status: response.status,
        body: responseBody,
        error: `Arkesel API returned ${response.status}: ${JSON.stringify(responseBody)}`
      };
    }

    // Check if the response indicates success
    const isSuccess = responseBody?.code === 'ok' || responseBody?.message?.toLowerCase().includes('success');

    if (!isSuccess) {
      console.warn('Arkesel SMS failed based on response:', responseBody);
      return {
        ok: false,
        recipient,
        status: response.status,
        body: responseBody,
        error: `SMS failed: ${responseBody?.message || 'Unknown error'}`
      };
    }

    console.log('Successfully sent SMS notification via Arkesel to:', recipient, 'response:', responseBody);
    return { ok: true, recipient, status: response.status, body: responseBody };

  } catch (smsError: any) {
    console.error('Failed to send SMS notification:', smsError);
    return { ok: false, recipient, error: String(smsError) };
  }
}

// Send order confirmation SMS after successful payment
export async function sendOrderConfirmationSMS(orderId: string): Promise<void> {
  try {
    const supabaseAdmin = getSupabaseAdminClient();

    // Get order details
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('code, phone_masked')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      console.error('Failed to fetch order for SMS confirmation:', error);
      return;
    }

    const trackingUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/track?code=${order.code}`;
    const confirmationMessage = `Payment for order ${order.code} confirmed. We're now preparing your package for discreet delivery. Track: ${trackingUrl}`;

    await sendSMS(order.phone_masked, confirmationMessage);
  } catch (error) {
    console.error('Error sending order confirmation SMS:', error);
  }
}

// Send shipping notification SMS
export async function sendShippingNotificationSMS(orderId: string): Promise<void> {
  try {
    const supabaseAdmin = getSupabaseAdminClient();

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('code, phone_masked')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      console.error('Failed to fetch order for shipping SMS:', error);
      return;
    }

    const trackingUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/track?code=${order.code}`;
    const shippingMessage = `Your order ${order.code} has been shipped. Your package is on the way for discreet delivery. Track: ${trackingUrl}`;

    await sendSMS(order.phone_masked, shippingMessage);
  } catch (error) {
    console.error('Error sending shipping notification SMS:', error);
  }
}

// Send delivery notification SMS
export async function sendDeliveryNotificationSMS(orderId: string): Promise<void> {
  try {
    const supabaseAdmin = getSupabaseAdminClient();

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('code, phone_masked')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      console.error('Failed to fetch order for delivery SMS:', error);
      return;
    }

    const deliveredMessage = `Your order ${order.code} has been delivered successfully. Thank you for choosing DiscreetKit for your health needs. Need support? We're here to help.`;

    await sendSMS(order.phone_masked, deliveredMessage);
  } catch (error) {
    console.error('Error sending delivery notification SMS:', error);
  }
}

// Pharmacy accept/decline actions (server-side helpers)
export async function recordPharmacyAcknowledgement(orderId: number, decision: 'accepted' | 'declined') {
  const supabaseAdmin = getSupabaseAdminClient();
  // Update order ack status
  const { error: updateError } = await supabaseAdmin
    .from('orders')
    .update({ pharmacy_ack_status: decision, pharmacy_ack_at: new Date().toISOString() })
    .eq('id', orderId);
  if (updateError) {
    console.error('Pharmacy ack update error', updateError);
    return { ok: false };
  }
  // Log event
  const statusText = decision === 'accepted' ? 'Pharmacy Accepted' : 'Pharmacy Declined';
  await supabaseAdmin.from('order_events').insert({
    order_id: orderId,
    status: statusText,
    note: decision === 'accepted' ? 'Pharmacy confirmed it can fulfill the order.' : 'Pharmacy declined; needs reassignment.'
  });
  return { ok: true };
}


const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export async function login(formData: FormData) {
  'use server';
  const supabase = await createSupabaseServerClient();

  const parsed = loginSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    const errorMessage = parsed.error.errors.map(e => e.message).join(', ');
    redirect(`/login?error=${encodeURIComponent(errorMessage)}`);
    return;
  }

  const { email, password } = parsed.data;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Login error:', error.message);
    redirect('/login?error=Invalid credentials. Please try again.');
    return;
  }

  // --- On success, redirect to the admin dashboard. ---
  redirect('/admin');
}


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
  email: z.string().email({ message: "A valid email is required for payment." }),
});

/**
 * Creates a new order in the database and initializes a Paystack transaction.
 * This action is called from the order form.
 *
 * @param prevState - The previous state of the form, used by `useActionState`.
 * @param formData - The data submitted from the order form.
 * @returns An object containing success status, a message, any validation errors, and the Paystack authorization URL.
 */
export async function createOrderAction(prevState: any, formData: FormData) {
  const validatedFields = orderSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Error: Please check the form fields.',
      success: false,
      authorization_url: null,
    };
  }

  const cartItems: CartItem[] = JSON.parse(validatedFields.data.cartItems);
  if (cartItems.length === 0) {
    return {
      errors: { cartItems: ['Your cart is empty. Please add at least one item.'] },
      message: 'Your cart is empty.',
      success: false,
      authorization_url: null,
    };
  }

  const { deliveryArea, otherDeliveryArea } = validatedFields.data;
  if (deliveryArea === 'Other' && (!otherDeliveryArea || otherDeliveryArea.length < 3)) {
    return {
      errors: { otherDeliveryArea: ['Please specify your delivery area.'] },
      message: 'Error: Please specify your delivery area.',
      success: false,
      authorization_url: null,
    };
  }

  try {
    const supabaseAdmin = getSupabaseAdminClient();


    const code = generateTrackingCode();
    const finalDeliveryArea: string =
      deliveryArea === 'Other' ? (otherDeliveryArea || deliveryArea) : deliveryArea;

    const priceDetails = {
      subtotal: parseFloat(validatedFields.data.subtotal),
      student_discount: parseFloat(validatedFields.data.studentDiscount), // This is now the waived delivery fee for students
      delivery_fee: parseFloat(validatedFields.data.deliveryFee),
      total_price: parseFloat(validatedFields.data.totalPrice),
    };

    // Attempt pharmacy assignment based on delivery area
    let assignedPharmacyId: number | null = null;
    try {
      const { autoAssignOrder } = await import('@/lib/order-assignment');
      // We'll assign after order creation to use the order ID
    } catch (pharmacyError) {
      console.warn('Failed to load auto-assignment:', pharmacyError);
    }

    // 1. Insert into orders table with status 'pending_payment' (no pharmacy yet)
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        code,
        items: cartItems,
        status: 'pending_payment',
        delivery_area: finalDeliveryArea,
        delivery_address_note: validatedFields.data.deliveryAddressNote,
        phone_masked: validatedFields.data.phone_masked,
        email: validatedFields.data.email,
        pharmacy_id: null, // Will be assigned after payment
        ...priceDetails,
      })
      .select('id, pharmacy_id')
      .single();

    if (orderError) throw orderError;
    if (!orderData)
      throw new Error('Failed to retrieve order ID after creation.');

    // 2. Add an initial "Order Received" event
    await supabaseAdmin.from('order_events').insert({
      order_id: orderData.id,
      status: 'Order Received',
      note: 'Order placed, awaiting payment confirmation.',
    });

    // 3. Send initial customer SMS Notification
    const trackingUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/track?code=${code}`;
    const initialSmsMessage = `Your order ${code} is received. We'll notify you once payment is processed. Track status: ${trackingUrl}`;

    await sendSMS(validatedFields.data.phone_masked, initialSmsMessage);

    // Note: Pharmacy assignment happens AFTER payment confirmation in the webhook


    // 4. Initialize Paystack Transaction
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecretKey) {
      console.error('Paystack secret key is not configured in .env.local');
      throw new Error('Payment processing is not configured.');
    }

    const amountInKobo = Math.round(priceDetails.total_price * 100);

    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: validatedFields.data.email,
        amount: amountInKobo,
        currency: 'GHS',
        reference: code, // Use our unique order code as the reference
        metadata: {
          order_id: orderData.id,
          tracking_code: code,
          customer_email: validatedFields.data.email,
        },
        // Paystack will redirect to this URL after payment attempt
        callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/order/success`
      })
    });

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok || !paystackData.status) {
      console.error('Paystack API Error:', paystackData);
      // Attempt to delete the pending order if Paystack fails to prevent orphaned orders
      await supabaseAdmin.from('orders').delete().eq('id', orderData.id);
      throw new Error(paystackData.message || 'Could not initialize payment. Please try again.');
    }

    revalidatePath('/order');
    return {
      success: true,
      authorization_url: paystackData.data.authorization_url,
      message: null,
      errors: {}
    };

  } catch (error: any) {
    console.error('Create Order Action Error:', error);
    return {
      message: 'An unexpected server error occurred. Please try again later or contact support if the problem persists.',
      success: false,
      authorization_url: null,
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
  try {
    const supabaseAdmin = getSupabaseAdminClient();
    const { data: order, error } = await supabaseAdmin
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
      isStudent: !!order.student_discount && order.student_discount > 0, // Infer from discount
      subtotal: order.subtotal,
      studentDiscount: order.student_discount,
      deliveryFee: order.delivery_fee,
      totalPrice: order.total_price,
      events: order.order_events
        .map((e: any) => ({
          status: e.status,
          note: e.note ?? '',
          date: new Date(e.created_at),
        }))
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    };
  } catch (error) {
    console.error('Action Error in getOrderAction:', error);
    return null;
  }
}

/**
 * Handles the AI chat interaction by calling the Genkit flow.
 *
 * @param history - The current chat history.
 * @param message - The new message from the user.
 * @returns The AI's response as a string.
 */
export async function handleChat(
  history: { role: 'user' | 'model'; parts: string }[],
  message: string
) {
  'use server';
  try {
    const answerQuestions = await getAnswerQuestions();
    const result = await answerQuestions({ query: message });
    return result.answer;
  } catch (error) {
    console.error('AI Error:', error);
    return "I'm sorry, I'm having trouble connecting right now. Please try again later.";
  }
}

const suggestionSchema = z.object({
  suggestion: z.string().min(5, 'Suggestion must be at least 5 characters long.'),
});

/**
 * Saves a user's product suggestion to the database.
 */
export async function saveSuggestion(prevState: any, formData: FormData) {
  const validatedFields = suggestionSchema.safeParse({
    suggestion: formData.get('suggestion'),
  });

  if (!validatedFields.success) {
    return {
      message: validatedFields.error.flatten().fieldErrors.suggestion?.[0] || 'Invalid input.',
      success: false,
    };
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from('suggestions').insert({
      suggestion: validatedFields.data.suggestion,
    });

    if (error) throw error;

    revalidatePath('/#products');
    return { success: true, message: 'Suggestion saved!' };
  } catch (error: any) {
    return {
      message: error.message || 'Failed to save suggestion.',
      success: false,
    };
  }
}
