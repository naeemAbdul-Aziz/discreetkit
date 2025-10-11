/**
 * @file This file contains all the server actions for the application, which handle
 * database operations and other server-side logic. These actions are designed to be
 * securely called from client-side components.
 */
'use server';

import {z} from 'zod';
import {generateTrackingCode, type Order, type OrderStatus, type Pharmacy} from './data';
import {answerQuestions} from '@/ai/flows/answer-questions';
import {revalidatePath} from 'next/cache';
import {type CartItem} from '@/hooks/use-cart';
import {getSupabaseAdminClient} from './supabase';
import {redirect} from 'next/navigation';
import type { Product } from './data';

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
     
    // 3. Send SMS Notification via Hubtel
    const hubtelApiId = process.env.HUBTEL_API_ID;
    const hubtelApiSecret = process.env.HUBTEL_API_SECRET;

    if (hubtelApiId && hubtelApiSecret && hubtelApiId !== 'your-hubtel-api-id') {
        const recipient = validatedFields.data.phone_masked.startsWith('0') 
            ? `233${validatedFields.data.phone_masked.substring(1)}` 
            : validatedFields.data.phone_masked;

        const trackingUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/track?code=${code}`;
        const smsMessage = `Your DiscreetKit order ${code} has been confirmed. We're now preparing it for its discreet journey to you. Track its progress here: ${trackingUrl}. Should you need any support, remember we're here to help.`;

        const hubtelAuth = Buffer.from(`${hubtelApiId}:${hubtelApiSecret}`).toString('base64');
        
        try {
            const smsResponse = await fetch('https://api.hubtel.com/v1/messages/send', {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${hubtelAuth}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    From: 'DiscreetKit',
                    To: recipient,
                    Content: smsMessage,
                })
            });

            if (!smsResponse.ok) {
                const errorData = await smsResponse.json();
                console.warn('Hubtel SMS API Warning:', errorData);
            } else {
                 console.log('Successfully sent SMS notification via Hubtel.');
            }
        } catch (smsError) {
            console.error('Failed to send SMS notification via Hubtel:', smsError);
        }
    } else {
        console.log('--- (Skipping SMS: Hubtel API credentials not configured or are placeholder) ---');
        const trackingUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/track?code=${code}`;
        const smsPayload = {
          to: `+233${validatedFields.data.phone_masked.slice(1)}`,
          message: `Your DiscreetKit order ${code} has been confirmed. We're now preparing it for its discreet journey to you. Track its progress here: ${trackingUrl}. Should you need any support, remember we're here to help.`
        };
        console.log('--- Placeholder SMS Payload ---', smsPayload);
    }


    // 4. Initialize Paystack Transaction
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecretKey || paystackSecretKey === 'your-paystack-secret-key') {
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
        id,
        code,
        status,
        items,
        delivery_area,
        delivery_address_note,
        subtotal,
        student_discount,
        delivery_fee,
        total_price,
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
      events: (order.order_events as any[])
        .map((e: any) => ({
          status: e.status,
          note: e.note ?? '',
          date: new Date(e.created_at),
        }))
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    } as Order;
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

/**
 * Fetches all products from the database for the admin dashboard.
 * @returns A promise that resolves to an array of products.
 */
export async function getAdminProducts(): Promise<Product[]> {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching admin products:', error);
        return [];
    }

    // Supabase returns numbers as strings sometimes, ensure correct types
    return data.map(p => ({
        ...p,
        price_ghs: Number(p.price_ghs),
        stock_level: Number(p.stock_level),
    })) as Product[];
}

/**
 * Fetches a single product from the database by its ID.
 * @param id The ID of the product to fetch.
 * @returns A promise that resolves to the product object or null if not found.
 */
export async function getProductById(id: string | number): Promise<Product | null> {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error(`Error fetching product with id ${id}:`, error);
        return null;
    }

    return {
        ...data,
        price_ghs: Number(data.price_ghs),
        stock_level: Number(data.stock_level),
    } as Product;
}

const productSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(3, 'Name must be at least 3 characters long.'),
    description: z.string().optional(),
    price_ghs: z.coerce.number().min(0, 'Price must be a positive number.'),
    category: z.string().min(1, 'Category is required.'),
    sub_category: z.string().optional().nullable(),
    brand: z.string().optional().nullable(),
    stock_level: z.coerce.number().int('Stock must be a whole number.').min(0, 'Stock cannot be negative.'),
    image_url: z.string().url('Must be a valid URL.').optional().or(z.literal('')),
    requires_prescription: z.preprocess((val) => val === 'on' || val === true, z.boolean()),
    is_student_product: z.preprocess((val) => val === 'on' || val === true, z.boolean()),
    usage_instructions: z.string().optional(),
    in_the_box: z.string().optional(),
});

/**
 * Creates or updates a product in the database.
 * @param prevState The previous form state.
 * @param formData The form data.
 * @returns A promise that resolves to the new form state.
 */
export async function saveProduct(prevState: any, formData: FormData) {
    const validatedFields = productSchema.safeParse(
        Object.fromEntries(formData.entries())
    );

    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Error: Please check the form fields.',
        };
    }
    
    const { id, usage_instructions, in_the_box, ...productData } = validatedFields.data;

    const finalProductData = {
        ...productData,
        usage_instructions: usage_instructions?.split('\n').filter(line => line.trim() !== '') || [],
        in_the_box: in_the_box?.split('\n').filter(line => line.trim() !== '') || [],
    };
    
    const supabase = getSupabaseAdminClient();

    try {
        if (id) {
            // Update existing product
            const { error } = await supabase
                .from('products')
                .update(finalProductData)
                .eq('id', id);
            
            if (error) throw error;
        } else {
            // Create new product
            const { error } = await supabase.from('products').insert(finalProductData);
            if (error) throw error;
        }
    } catch (e: any) {
        return {
            success: false,
            message: `Database Error: ${e.message}`,
        };
    }

    revalidatePath('/admin/products');
    return { success: true, message: 'Product saved successfully!' };
}

const updateFieldSchema = z.object({
  id: z.number(),
  field: z.enum(['price_ghs', 'stock_level']),
  value: z.coerce.number().min(0),
});

/**
 * Updates a single field for a product in the database.
 * @param {object} params - The parameters for the update.
 * @param {number} params.id - The ID of the product to update.
 * @param {'price_ghs' | 'stock_level'} params.field - The field to update.
 * @param {number} params.value - The new value for the field.
 * @returns A promise that resolves to an object indicating success or failure.
 */
export async function updateProductField(params: {
  id: number;
  field: 'price_ghs' | 'stock_level';
  value: number;
}) {
  const validated = updateFieldSchema.safeParse(params);
  if (!validated.success) {
    return {
      success: false,
      message: 'Invalid input.',
    };
  }

  const { id, field, value } = validated.data;
  const supabase = getSupabaseAdminClient();

  try {
    const { error } = await supabase
      .from('products')
      .update({ [field]: value })
      .eq('id', id);

    if (error) throw error;
  } catch (e: any) {
    return {
      success: false,
      message: `Database Error: ${e.message}`,
    };
  }

  revalidatePath('/admin/products');
  return { success: true };
}


const updateCategorySchema = z.object({
  id: z.number(),
  category: z.string().min(1, 'Category cannot be empty.'),
});

/**
 * Updates the category for a specific product.
 * @param {object} params - The parameters for the update.
 * @param {number} params.id - The ID of the product to update.
 * @param {string} params.category - The new category for the product.
 * @returns A promise that resolves to an object indicating success or failure.
 */
export async function updateProductCategory(params: { id: number; category: string; }) {
    const validated = updateCategorySchema.safeParse(params);
    if (!validated.success) {
        return {
        success: false,
        message: 'Invalid input.',
        };
    }

    const { id, category } = validated.data;
    const supabase = getSupabaseAdminClient();

    try {
        const { error } = await supabase
        .from('products')
        .update({ category })
        .eq('id', id);

        if (error) throw error;
    } catch (e: any) {
        return {
        success: false,
        message: `Database Error: ${e.message}`,
        };
    }

    revalidatePath('/admin/products');
    return { success: true };
}

/**
 * Fetches all orders from the database for the admin dashboard.
 * @returns A promise that resolves to an array of orders.
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

    return data as Order[];
}

const updateStatusSchema = z.object({
  id: z.number(),
  status: z.enum(['pending_payment', 'received', 'processing', 'out_for_delivery', 'completed']),
});

/**
 * Updates the status for a specific order.
 * @param {object} params - The parameters for the update.
 * @param {number} params.id - The ID of the order to update.
 * @param {string} params.status - The new status for the order.
 * @returns A promise that resolves to an object indicating success or failure.
 */
export async function updateOrderStatus(params: { id: number; status: OrderStatus; }) {
    const validated = updateStatusSchema.safeParse(params);
    if (!validated.success) {
        return {
            success: false,
            message: 'Invalid status value.',
        };
    }

    const { id, status } = validated.data;
    const supabase = getSupabaseAdminClient();

    try {
        const { error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', id);

        if (error) throw error;

        // Add a new order event
        await supabase.from('order_events').insert({
            order_id: id,
            status: `Status Changed to ${status.replace(/_/g, ' ')}`,
            note: 'Status updated by admin.',
        });

    } catch (e: any) {
        return {
            success: false,
            message: `Database Error: ${e.message}`,
        };
    }

    revalidatePath('/admin/orders');
    return { success: true };
}

export type Customer = {
    email: string;
    total_orders: number;
    total_spent: number;
    first_order_date: string;
    last_order_date: string;
};

/**
 * Fetches aggregated customer data from the orders table.
 * @returns A promise that resolves to an array of customers.
 */
export async function getAdminCustomers(): Promise<Customer[]> {
    const supabase = getSupabaseAdminClient();
    // We only consider orders that have been successfully paid for
    const { data, error } = await supabase
        .from('orders')
        .select('email, total_price, created_at')
        .not('status', 'eq', 'pending_payment')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching orders for customer aggregation:', error);
        return [];
    }

    if (!data) return [];

    const customers = new Map<string, Customer>();

    for (const order of data) {
        if (!order.email) continue;

        if (!customers.has(order.email)) {
            customers.set(order.email, {
                email: order.email,
                total_orders: 0,
                total_spent: 0,
                first_order_date: order.created_at,
                last_order_date: order.created_at,
            });
        }

        const customer = customers.get(order.email)!;
        customer.total_orders += 1;
        customer.total_spent += order.total_price || 0;
        
        // Since we ordered by date descending, the first time we see an email is their last order
        // We update the first_order_date as we go
        customer.first_order_date = order.created_at;
    }

    return Array.from(customers.values()).sort((a, b) => b.total_spent - a.total_spent);
}

/**
 * Fetches all pharmacy partners from the database.
 * @returns A promise that resolves to an array of pharmacies.
 */
export async function getAdminPharmacies(): Promise<Pharmacy[]> {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
        .from('pharmacies')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching admin pharmacies:', error);
        return [];
    }
    return data as Pharmacy[];
}

const pharmacySchema = z.object({
    id: z.string().optional(),
    name: z.string().min(3, 'Name must be at least 3 characters long.'),
    location: z.string().min(3, 'Location is required.'),
    contact_person: z.string().optional(),
    phone_number: z.string().optional(),
    email: z.string().email('Must be a valid email.').optional().or(z.literal('')),
});

/**
 * Creates or updates a pharmacy in the database.
 */
export async function savePharmacy(prevState: any, formData: FormData) {
    const validatedFields = pharmacySchema.safeParse(
        Object.fromEntries(formData.entries())
    );

    if (!validatedFields.success) {
        return { success: false, message: 'Invalid form data.' };
    }
    
    const { id, ...pharmacyData } = validatedFields.data;
    const supabase = getSupabaseAdminClient();

    try {
        if (id) {
            const { error } = await supabase.from('pharmacies').update(pharmacyData).eq('id', id);
            if (error) throw error;
        } else {
            const { error } = await supabase.from('pharmacies').insert(pharmacyData);
            if (error) throw error;
        }
    } catch (e: any) {
        return { success: false, message: `Database Error: ${e.message}` };
    }

    revalidatePath('/admin/pharmacies');
    return { success: true, message: 'Pharmacy saved successfully!' };
}

/**
 * Deletes a pharmacy from the database.
 */
export async function deletePharmacy(id: number) {
    const supabase = getSupabaseAdminClient();
    try {
        const { error } = await supabase.from('pharmacies').delete().eq('id', id);
        if (error) throw error;
    } catch (e: any) {
        return { success: false, message: `Database Error: ${e.message}` };
    }
    revalidatePath('/admin/pharmacies');
    return { success: true };
}

const assignOrderSchema = z.object({
  orderId: z.number(),
  pharmacyId: z.number(),
});

/**
 * Assigns an order to a specific pharmacy.
 */
export async function assignOrderToPharmacy(params: { orderId: number; pharmacyId: number; }) {
    const validated = assignOrderSchema.safeParse(params);
    if (!validated.success) {
        return { success: false, message: 'Invalid input.' };
    }

    const { orderId, pharmacyId } = validated.data;
    const supabase = getSupabaseAdminClient();

    try {
        const { error } = await supabase
            .from('orders')
            .update({ pharmacy_id: pharmacyId === 0 ? null : pharmacyId })
            .eq('id', orderId);

        if (error) throw error;

    } catch (e: any) {
        return { success: false, message: `Database Error: ${e.message}` };
    }

    revalidatePath('/admin/orders');
    return { success: true };
}

    