

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
import { cookies } from 'next/headers';
import { encrypt } from './session';

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

    // 1. Insert into orders table with status 'pending_payment'
    const {data: orderData, error: orderError} = await supabaseAdmin
      .from('orders')
      .insert({
        code,
        items: cartItems,
        status: 'pending_payment',
        delivery_area: finalDeliveryArea,
        delivery_address_note: validatedFields.data.deliveryAddressNote,
        phone_masked: validatedFields.data.phone_masked,
        email: validatedFields.data.email,
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
    if (arkeselApiKey && arkeselApiKey !== 'your-arkesel-api-key') {
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
                    sender: 'Discreet',
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
    if (!paystackSecretKey || paystackSecretKey === 'your-paystack-secret-key') {
        // Fallback for local development if key is missing
        console.warn('Paystack secret key not configured. Simulating successful payment and redirect.');
        
        await supabaseAdmin.from('orders').update({ status: 'received' }).eq('id', orderData.id);
        
        await supabaseAdmin.from('order_events').insert({
            order_id: orderData.id,
            status: 'Payment Confirmed',
            note: 'Successfully received GHS (Simulated).',
        });

        revalidatePath(`/track?code=${code}`);
        redirect(`/order/success?code=${code}`);
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
            channels: ['card', 'mobile_money'],
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
      id: order.id,
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

const loginSchema = z.object({
  email: z.string().email('Invalid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

/**
 * Authenticates an admin user, creates a session, and redirects to the dashboard.
 *
 * @param prevState - The previous state of the form.
 * @param formData - The data submitted from the login form.
 * @returns An object containing success status, a message, and any validation errors.
 */
export async function login(prevState: any, formData: FormData) {
  const validatedFields = loginSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid email or password.',
    };
  }

  const { email, password } = validatedFields.data;

  if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
    return { message: 'Invalid credentials. Please try again.' };
  }

  // Create the session
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  const session = await encrypt({ user: { email }, expires });

  // Save the session in a cookie
  cookies().set('session', session, { expires, httpOnly: true });

  // Redirect to the admin dashboard
  redirect('/admin/dashboard');
}


/**
 * Logs the admin user out by clearing the session cookie.
 */
export async function logout() {
  cookies().set('session', '', { expires: new Date(0) });
  redirect('/admin/login');
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

        revalidatePath('/admin/suggestions');

        return { success: true, message: 'Suggestion saved!' };
    } catch (error: any) {
        return {
            message: error.message || 'Failed to save suggestion.',
            success: false,
        };
    }
}
    
export async function getAdminProducts(): Promise<any[]> {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase.from('products').select('*').order('name', { ascending: true });
    if (error) {
        console.error("Error fetching admin products:", error);
        return [];
    }
    return data;
}

export async function getProductById(id: number): Promise<any | null> {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
    if (error) {
        console.error(`Error fetching product by id ${id}:`, error);
        return null;
    }
    return data;
}


const productFormSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long.'),
  description: z.string().optional(),
  price_ghs: z.coerce.number().min(0, 'Price must be a positive number.'),
  category: z.string({ required_error: 'Category is required.' }),
  sub_category: z.string().optional(),
  brand: z.string().optional(),
  stock_level: z.coerce
    .number()
    .int('Stock must be a whole number.')
    .min(0, 'Stock cannot be negative.'),
  image_url: z.string().url('Must be a valid URL.').optional().or(z.literal('')),
  requires_prescription: z.boolean().default(false),
  is_student_product: z.boolean().default(false),
  usage_instructions: z.string().optional(),
  in_the_box: z.string().optional(),
});


export async function saveProduct(prevState: any, formData: FormData) {
    const id = formData.get('id');

    const validatedFields = productFormSchema.safeParse({
        name: formData.get('name'),
        description: formData.get('description'),
        price_ghs: formData.get('price_ghs'),
        category: formData.get('category'),
        sub_category: formData.get('sub_category'),
        brand: formData.get('brand'),
        stock_level: formData.get('stock_level'),
        image_url: formData.get('image_url'),
        requires_prescription: formData.get('requires_prescription') === 'on',
        is_student_product: formData.get('is_student_product') === 'on',
        usage_instructions: formData.get('usage_instructions'),
        in_the_box: formData.get('in_the_box'),
    });

    if (!validatedFields.success) {
        console.error('Validation errors:', validatedFields.error.flatten().fieldErrors);
        return {
            message: 'Validation failed. Check the form fields.',
            success: false,
        };
    }
    
    const { usage_instructions, in_the_box, ...restOfData } = validatedFields.data;

    const productData = {
        ...restOfData,
        usage_instructions: usage_instructions ? usage_instructions.split('\n').filter(line => line.trim() !== '') : null,
        in_the_box: in_the_box ? in_the_box.split('\n').filter(line => line.trim() !== '') : null,
    };

    try {
        const supabase = getSupabaseAdminClient();
        let error;

        if (id) {
            // Update existing product
            const { error: updateError } = await supabase.from('products').update(productData).eq('id', id);
            error = updateError;
        } else {
            // Create new product
            const { error: insertError } = await supabase.from('products').insert(productData);
            error = insertError;
        }

        if (error) throw error;
        
        revalidatePath('/admin/products');
        return { success: true, message: `Product ${id ? 'updated' : 'created'} successfully.` };

    } catch (err: any) {
        return {
            message: err.message || `Failed to ${id ? 'update' : 'create'} product.`,
            success: false,
        };
    }
}


export async function updateProductField(payload: { id: number; field: 'price_ghs' | 'stock_level'; value: number }) {
  const { id, field, value } = payload;
  
  if (!id || !field || value === undefined) {
    return { success: false, message: 'Invalid payload.' };
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase
      .from('products')
      .update({ [field]: value })
      .eq('id', id);
    
    if (error) throw error;

    revalidatePath('/admin/products');
    return { success: true };

  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function updateProductCategory(payload: { id: number; category: string }) {
    const { id, category } = payload;

    if (!id || !category) {
        return { success: false, message: 'Invalid payload.' };
    }

    try {
        const supabase = getSupabaseAdminClient();
        const { error } = await supabase
            .from('products')
            .update({ category: category })
            .eq('id', id);
        
        if (error) throw error;

        revalidatePath('/admin/products');
        return { success: true };

    } catch (error: any) {
        return { success: false, message: error.message };
    }
}


export async function getAdminOrders(): Promise<any[]> {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) {
        console.error("Error fetching admin orders:", error);
        return [];
    }
    return data;
}


export async function updateOrderStatus(payload: { id: number; status: OrderStatus }) {
  const { id, status } = payload;
  
  if (!id || !status) {
    return { success: false, message: 'Invalid payload.' };
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase
      .from('orders')
      .update({ status: status })
      .eq('id', id);
    
    if (error) throw error;

    revalidatePath('/admin/orders');
    return { success: true };

  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function assignOrderToPharmacy(payload: { orderId: number; pharmacyId: number | null }) {
    const { orderId, pharmacyId } = payload;

    if (!orderId) {
        return { success: false, message: 'Order ID is missing.' };
    }

    try {
        const supabase = getSupabaseAdminClient();
        const { error } = await supabase
            .from('orders')
            .update({ pharmacy_id: pharmacyId === 0 ? null : pharmacyId }) // Handle un-assignment
            .eq('id', orderId);
        
        if (error) throw error;

        revalidatePath('/admin/orders');
        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}


export async function getAdminPharmacies(): Promise<any[]> {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase.from('pharmacies').select('*').order('name', { ascending: true });
    if (error) {
        console.error("Error fetching admin pharmacies:", error);
        return [];
    }
    return data;
}

const pharmacyFormSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long.'),
  location: z.string().min(3, 'Location is required.'),
  contact_person: z.string().optional(),
  phone_number: z.string().optional(),
  email: z.string().email('Must be a valid email.').optional().or(z.literal('')),
});

export async function savePharmacy(prevState: any, formData: FormData) {
    const id = formData.get('id');

    const validatedFields = pharmacyFormSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { message: 'Validation failed.', success: false };
    }

    try {
        const supabase = getSupabaseAdminClient();
        let error;
        if (id) {
            const { error: updateError } = await supabase.from('pharmacies').update(validatedFields.data).eq('id', id);
            error = updateError;
        } else {
            const { error: insertError } = await supabase.from('pharmacies').insert(validatedFields.data);
            error = insertError;
        }
        if (error) throw error;

        revalidatePath('/admin/pharmacies');
        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function deletePharmacy(id: number) {
    if (!id) return { success: false, message: "ID is required." };
    try {
        const supabase = getSupabaseAdminClient();
        // First, unassign this pharmacy from any orders
        const { error: unassignError } = await supabase.from('orders').update({ pharmacy_id: null }).eq('pharmacy_id', id);
        if (unassignError) throw unassignError;
        
        // Then, delete the pharmacy
        const { error: deleteError } = await supabase.from('pharmacies').delete().eq('id', id);
        if (deleteError) throw deleteError;

        revalidatePath('/admin/pharmacies');
        revalidatePath('/admin/orders');
        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}


export async function getAdminCustomers(): Promise<any[]> {
    const supabase = getSupabaseAdminClient();
    // This query is a bit more complex. It groups orders by email to aggregate customer data.
    const { data, error } = await supabase.rpc('get_customer_stats');
    
    if (error) {
        console.error("Error fetching customer stats:", error);
        return [];
    }
    
    return data;
}

export async function getAdminSuggestions(): Promise<any[]> {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase.from('suggestions').select('*').order('created_at', { ascending: false });
    if (error) {
        console.error("Error fetching suggestions:", error);
        return [];
    }
    return data;
}

export async function deleteSuggestion(id: number) {
    if (!id) return { success: false, message: "ID is required." };
    try {
        const supabase = getSupabaseAdminClient();
        const { error } = await supabase.from('suggestions').delete().eq('id', id);
        if (error) throw error;
        revalidatePath('/admin/suggestions');
        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}