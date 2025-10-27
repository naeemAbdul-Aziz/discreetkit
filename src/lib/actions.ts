

/**
 * @file This file contains all the server actions for the application, which handle
 * database operations and other server-side logic. These actions are designed to be
 * securely called from client-side components.
 */
'use server';

import {z} from 'zod';
import {generateTrackingCode, type Order, type Product, type Pharmacy, type Suggestion, type OrderStatus, type Customer} from './data';
import {answerQuestions} from '@/ai/flows/answer-questions';
import {revalidatePath} from 'next/cache';
import {type CartItem} from '@/hooks/use-cart';
import {getSupabaseAdminClient} from './supabase';
import {redirect} from 'next/navigation';
import { getSession, login as sessionLogin, logout as sessionLogout } from './session';


// --- Authentication Actions ---

/**
 * Handles the admin login process.
 * Verifies credentials against environment variables and creates a session.
 */
export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // In a real application, you'd hash the password and compare it.
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    await sessionLogin({ email });
    redirect('/admin/dashboard');
  }

  return { message: 'Invalid email or password.' };
}

/**
 * Logs out the admin user and destroys the session.
 */
export async function logout() {
    await sessionLogout();
    redirect('/admin/login');
}


// --- Order Actions ---

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
      delivery_area: order.delivery_area,
      delivery_address_note: order.delivery_address_note,
      is_student: !!order.student_discount && order.student_discount > 0, // Infer from discount
      subtotal: order.subtotal,
      student_discount: order.student_discount,
      delivery_fee: order.delivery_fee,
      total_price: order.total_price,
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


// --- Admin-specific Actions ---

/**
 * Fetches all orders for the admin dashboard.
 */
export async function getAdminOrders(): Promise<Order[]> {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error('Error fetching admin orders:', error);
        return [];
    }
    return data;
}

/**
 * Fetches all products for the admin dashboard.
 */
export async function getAdminProducts(): Promise<Product[]> {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id');
    
    if (error) {
        console.error('Error fetching admin products:', error);
        return [];
    }
    return data;
}

/**
 * Fetches a single product by its ID.
 */
export async function getProductById(id: number): Promise<Product | null> {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
    
    if (error) {
        console.error('Error fetching product by ID:', error);
        return null;
    }
    return data;
}

/**
 * Updates the status of an order.
 */
export async function updateOrderStatus(
    { id, status }: { id: number; status: OrderStatus }
) {
    try {
        const supabase = getSupabaseAdminClient();
        const { error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', id);
        
        if (error) throw error;

        // Add a corresponding event
        await supabase.from('order_events').insert({
            order_id: id,
            status: `Status changed to: ${status.replace(/_/g, ' ')}`,
            note: 'Updated via admin dashboard.'
        });

        revalidatePath('/admin/orders');
        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}


const productFormSchema = z.object({
  id: z.string().optional(),
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


/**
 * Creates or updates a product in the database.
 */
export async function saveProduct(prevState: any, formData: FormData) {
  const is_student_product = formData.get('is_student_product') === 'on';
  const requires_prescription = formData.get('requires_prescription') === 'on';

  const validatedFields = productFormSchema.safeParse({
    ...Object.fromEntries(formData.entries()),
    is_student_product,
    requires_prescription,
  });

  if (!validatedFields.success) {
    return {
        message: 'Invalid data provided.',
        errors: validatedFields.error.flatten().fieldErrors,
        success: false,
    };
  }
  
  const { id, usage_instructions, in_the_box, ...productData } = validatedFields.data;
  
  const finalProductData = {
    ...productData,
    usage_instructions: usage_instructions ? usage_instructions.split('\n').filter(line => line.trim() !== '') : [],
    in_the_box: in_the_box ? in_the_box.split('\n').filter(line => line.trim() !== '') : [],
  }
  
  try {
    const supabase = getSupabaseAdminClient();
    let error;

    if (id) {
      // Update existing product
      ({ error } = await supabase.from('products').update(finalProductData).eq('id', id));
    } else {
      // Create new product
      ({ error } = await supabase.from('products').insert(finalProductData));
    }

    if (error) throw error;

    revalidatePath('/admin/products');
    return { success: true, message: `Product ${id ? 'updated' : 'created'} successfully.` };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

/**
 * Updates a single field of a product (e.g., price or stock).
 */
export async function updateProductField({ id, field, value }: { id: number, field: 'price_ghs' | 'stock_level', value: number | string }) {
    try {
        const supabase = getSupabaseAdminClient();
        const { error } = await supabase
            .from('products')
            .update({ [field]: value })
            .eq('id', id);

        if (error) throw error;
        revalidatePath('/admin/products');
        return { success: true };
    } catch (err: any) {
        return { success: false, message: err.message };
    }
}

export async function updateProductCategory({ id, category }: { id: number, category: string }) {
    try {
        const supabase = getSupabaseAdminClient();
        const { error } = await supabase
            .from('products')
            .update({ category })
            .eq('id', id);

        if (error) throw error;
        revalidatePath('/admin/products');
        return { success: true };
    } catch (err: any) {
        return { success: false, message: err.message };
    }
}


/**
 * Fetches all pharmacies for the admin dashboard.
 */
export async function getAdminPharmacies(): Promise<Pharmacy[]> {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase.from('pharmacies').select('*').order('name');
    
    if (error) {
        console.error('Error fetching pharmacies:', error);
        return [];
    }
    return data;
}

const pharmacySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, 'Name is required.'),
  location: z.string().min(3, 'Location is required.'),
  contact_person: z.string().optional(),
  phone_number: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
});

/**
 * Creates or updates a pharmacy partner.
 */
export async function savePharmacy(prevState: any, formData: FormData) {
  const validatedFields = pharmacySchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return { message: 'Invalid data.', success: false };
  }
  
  const { id, ...pharmacyData } = validatedFields.data;

  try {
    const supabase = getSupabaseAdminClient();
    let error;

    if (id) {
      ({ error } = await supabase.from('pharmacies').update(pharmacyData).eq('id', id));
    } else {
      ({ error } = await supabase.from('pharmacies').insert(pharmacyData));
    }

    if (error) throw error;

    revalidatePath('/admin/pharmacies');
    return { success: true, message: `Pharmacy ${id ? 'updated' : 'added'}.` };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function deletePharmacy(id: number) {
    try {
        const supabase = getSupabaseAdminClient();
        const { error } = await supabase.from('pharmacies').delete().eq('id', id);
        if (error) throw error;
        revalidatePath('/admin/pharmacies');
        return { success: true };
    } catch (err: any) {
        return { success: false, message: err.message };
    }
}

/**
 * Assigns an order to a specific pharmacy.
 */
export async function assignOrderToPharmacy({ orderId, pharmacyId }: { orderId: number, pharmacyId: number | null }) {
    try {
        const supabase = getSupabaseAdminClient();
        const { error } = await supabase
            .from('orders')
            .update({ pharmacy_id: pharmacyId === 0 ? null : pharmacyId })
            .eq('id', orderId);
        
        if (error) throw error;
        revalidatePath('/admin/orders');
        return { success: true };
    } catch (err: any) {
        return { success: false, message: err.message };
    }
}


/**
 * Fetches all product suggestions.
 */
export async function getAdminSuggestions(): Promise<Suggestion[]> {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase.from('suggestions').select('*').order('created_at', { ascending: false });
    
    if (error) {
        console.error('Error fetching suggestions:', error);
        return [];
    }
    return data;
}

export async function deleteSuggestion(id: number) {
    try {
        const supabase = getSupabaseAdminClient();
        const { error } = await supabase.from('suggestions').delete().eq('id', id);
        if (error) throw error;
        revalidatePath('/admin/suggestions');
        return { success: true };
    } catch (err: any) {
        return { success: false, message: err.message };
    }
}


/**
 * Fetches aggregated customer data.
 */
export async function getAdminCustomers(): Promise<Customer[]> {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
        .from('orders')
        .select('email, total_price, created_at')
        .order('created_at', { ascending: true });
        
    if (error || !data) {
        console.error('Error fetching customer data:', error);
        return [];
    }

    const customerMap = new Map<string, { total_spent: number; total_orders: number; first_order_date: string; last_order_date: string }>();

    for (const order of data) {
        if (order.email) {
            const customer = customerMap.get(order.email) || {
                total_spent: 0,
                total_orders: 0,
                first_order_date: order.created_at,
                last_order_date: order.created_at,
            };

            customer.total_spent += order.total_price;
            customer.total_orders += 1;
            customer.last_order_date = order.created_at;
            
            customerMap.set(order.email, customer);
        }
    }
    
    const customers: Customer[] = [];
    customerMap.forEach((value, key) => {
        customers.push({ email: key, ...value });
    });

    return customers.sort((a, b) => new Date(b.last_order_date).getTime() - new Date(a.last_order_date).getTime());
}
