

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
import {redirect} from 'next/navigation';

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

  const {deliveryArea, otherDeliveryArea} = validatedFields.data;
  if (deliveryArea === 'Other' && (!otherDeliveryArea || otherDeliveryArea.length < 3)) {
    return {
      errors: {otherDeliveryArea: ['Please specify your delivery area.']},
      message: 'Error: Please specify your delivery area.',
      success: false,
      authorization_url: null,
    };
  }

  try {
    const supabaseAdmin = getSupabaseAdminClient();
    const cartItems: CartItem[] = JSON.parse(validatedFields.data.cartItems);
    if (cartItems.length === 0) {
      return {message: 'Your cart is empty.', success: false, authorization_url: null};
    }

    const code = generateTrackingCode();
    const finalDeliveryArea =
      deliveryArea === 'Other' ? otherDeliveryArea : deliveryArea;
    
    const priceDetails = {
      subtotal: parseFloat(validatedFields.data.subtotal),
      student_discount: parseFloat(validatedFields.data.studentDiscount), // This is now the waived delivery fee for students
      delivery_fee: parseFloat(validatedFields.data.deliveryFee),
      total_price: parseFloat(validatedFields.data.totalPrice),
    };

    // 1. Insert into orders table with status 'received'
    const {data: orderData, error: orderError} = await supabaseAdmin
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
    if (!orderData)
      throw new Error('Failed to retrieve order ID after creation.');

    // 2. Add an initial "Order Received" event
     await supabaseAdmin.from('order_events').insert({
        order_id: orderData.id,
        status: 'Order Received',
        note: 'Order placed, awaiting payment confirmation.',
     });
     
    // 3. Send SMS Notification via Arkesel
    const arkeselApiKey = process.env.ARKESEL_API_KEY;
    if (arkeselApiKey && arkeselApiKey !== 'cHNIRlBqdXJncklObmFpelB0R0Q') { // Check against placeholder
        const recipient = validatedFields.data.phone_masked.startsWith('0') 
            ? `233${validatedFields.data.phone_masked.substring(1)}` 
            : validatedFields.data.phone_masked;

        const trackingUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/track?code=${code}`;
        const smsMessage = `Your DiscreetKit order ${code} has been confirmed. We're now preparing it for its discreet journey to you. Track its progress here: ${trackingUrl}. Should you need any support, remember we're here to help.`;

        try {
            const smsResponse = await fetch('https://sms.arkesel.com/api/v2/sms/send', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${arkeselApiKey}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    sender: 'DiscreetKit',
                    message: smsMessage,
                    recipients: [recipient],
                    sandbox: false
                })
            });

            if (!smsResponse.ok) {
                const errorData = await smsResponse.json();
                console.warn('Arkesel SMS API Warning:', errorData);
            } else {
                 console.log('Successfully sent SMS notification via Arkesel.');
            }
        } catch (smsError) {
            console.error('Failed to send SMS notification:', smsError);
        }
    } else {
        console.log('--- (Skipping SMS: Arkesel API key not configured or is placeholder) ---');
        const trackingUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/track?code=${code}`;
        const smsPayload = {
          to: `+233${validatedFields.data.phone_masked.slice(1)}`, // Example for Ghana number format
          message: `Your DiscreetKit order ${code} has been confirmed. We're now preparing it for its discreet journey to you. Track its progress here: ${trackingUrl}. Should you need any support, remember we're here to help.`
        };
        console.log('--- Placeholder SMS Payload ---', smsPayload);
    }


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
            callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/order/success?code=${code}`
        })
    });

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok || !paystackData.status) {
        console.error('Paystack Error:', paystackData);
        // Attempt to delete the pending order if Paystack fails
        await supabaseAdmin.from('orders').delete().eq('id', orderData.id);
        throw new Error(paystackData.message || 'Failed to initialize payment transaction.');
    }

    revalidatePath('/order');
    return {
        success: true, 
        authorization_url: paystackData.data.authorization_url, 
        message: null, 
        errors: {}
    };

  } catch (error: any) {
    console.error('Action Error:', error);
    return {
      message: error.message || 'An unexpected error occurred. Please try again.',
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
      isStudent: !!order.student_discount && order.student_discount > 0, // Infer from discount
      subtotal: order.subtotal,
      studentDiscount: order.student_discount,
      deliveryFee: order.delivery_fee,
      totalPrice: order.total_price,
      events: order.order_events
        .map(e => ({
          status: e.status,
          note: e.note ?? '',
          date: new Date(e.created_at),
        }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
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

    