

/**
 * @file This file contains all the server actions for the application, which handle
 * database operations and other server-side logic. These actions are designed to be
 * securely called from client-side components.
 */
'use server';

// import { z } from 'zod';
// Duplicate import removed. Consolidated below at line 151.
import { z } from 'zod';
import { assignPharmacyForDeliveryArea, sendPharmacyOrderNotification } from './notifications';
import { sendSMS } from './server-utils'; // Internal use only
// Use OpenAI when API key is configured, otherwise fallback
let _answerQuestions: ((input: { query: string; history: { role: 'user' | 'model'; parts: string }[] }) => Promise<{ answer: string }>) | null = null;
async function getAnswerQuestions() {
  if (_answerQuestions) return _answerQuestions;
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  if (hasOpenAI) {
    const mod = await import('@/ai/flows/answer-questions');
    _answerQuestions = mod.answerQuestions;
  } else {
    const mod = await import('@/ai/flows/answer-questions-fallback');
    _answerQuestions = mod.answerQuestions;
  }
  if (!_answerQuestions) throw new Error("Failed to load AI module");
  return _answerQuestions;
}
import { revalidatePath } from 'next/cache';
import { type CartItem } from '@/hooks/use-cart';
import { getSupabaseAdminClient, createSupabaseServerClient } from './supabase';
import { redirect } from 'next/navigation';



// Pharmacy accept/decline actions (server-side helpers)
export async function recordPharmacyAcknowledgement(orderId: number, decision: 'accepted' | 'declined', reason?: string) {
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

  let note = decision === 'accepted' ? 'Pharmacy confirmed it can fulfill the order.' : 'Pharmacy declined; needs reassignment.';
  if (reason) {
    note = decision === 'accepted' ? note + ` - ${reason}` : `Pharmacy acknowledge: declined - ${reason}`;
  }

  await supabaseAdmin.from('order_events').insert({
    order_id: orderId,
    status: statusText,
    note: note
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

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Login error:', error.message);
    redirect('/login?error=Invalid credentials. Please try again.');
    return;
  }

  if (authData.user) {
    // Check for redirect_to parameter
    const redirectTo = formData.get('redirect_to') as string | null;
    if (redirectTo) {
      redirect(redirectTo);
    }

    // Fetch user roles to determine redirect destination
    const { getUserRoles } = await import('@/lib/auth/roles');
    const roles = await getUserRoles(supabase, authData.user.id);
    const email = authData.user.email?.toLowerCase() || '';
    const adminWhitelist = (process.env.ADMIN_EMAIL_WHITELIST || '')
      .split(',')
      .map(e => e.trim().toLowerCase())
      .filter(Boolean);
    const pharmacyWhitelist = (process.env.PHARMACY_EMAIL_WHITELIST || '')
      .split(',')
      .map(e => e.trim().toLowerCase())
      .filter(Boolean);
    const isAdmin = roles.includes('admin') || adminWhitelist.includes(email);
    const isPharmacy = roles.includes('pharmacy') || pharmacyWhitelist.includes(email);

    if (isAdmin) {
      redirect(process.env.NEXT_PUBLIC_ADMIN_URL || '/admin/dashboard');
    } else if (isPharmacy) {
      redirect('/pharmacy/dashboard');
    } else {
      redirect('/');
    }
  }
}


const orderSchema = z.object({
  cartItems: z.string().min(1, 'Cart cannot be empty.'),
  deliveryArea: z.string().min(3, 'Delivery area is required.'),
  deliveryAddressNote: z.string().max(1000, "Note is too long.").optional(),
  phone_masked: z.string().regex(/^0\d{9}$/, 'Phone number must be exactly 10 digits and start with 0 (e.g., 0201234567).'),
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
// ... (imports)
// Note: We need to import DELIVERY_FEES and discounts from './data'
import { generateTrackingCode, generatePartnerCode, type Order, DELIVERY_FEES, discounts } from './data';
// ...

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

  const clientCartItems: CartItem[] = JSON.parse(validatedFields.data.cartItems);
  if (clientCartItems.length === 0) {
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

    // --- SECURITY: Server-Side Price Calculation ---
    // 1. Fetch real product prices from DB
    const productIds = clientCartItems.map(item => item.id);
    const { data: dbProducts, error: prodError } = await supabaseAdmin
      .from('products')
      .select('id, price_ghs, student_price_ghs, name')
      .in('id', productIds);

    if (prodError || !dbProducts) {
      throw new Error('Failed to validate product prices.');
    }

    const dbProductMap = new Map(dbProducts.map(p => [p.id, p]));

    // 2. Determine Delivery Fee & Student Status
    // Logic: If delivery area matches a campus, treat as student (or eligible for student pricing)
    // Strict match against known campuses for discounts
    const finalDeliveryArea: string =
      deliveryArea === 'Other' ? (otherDeliveryArea || deliveryArea) : deliveryArea;

    const isCampusDelivery = discounts.some(d => d.campus === deliveryArea);
    
    // Delivery Fee Logic
    // Standard: 20 GHS, Campus: 10 GHS (or Free if that's the promo, code said "studentDiscount" was waived fee?)
    // User's previous code: `student_discount: parseFloat(validatedFields.data.studentDiscount)`
    // And comment: "This is now the waived delivery fee for students"
    // So if student, delivery fee is effectively 0 or discounted.
    // Let's stick to `DELIVERY_FEES` from data.ts or logic.
    // data.ts says: standard: 20.00, campus: 10.00.
    
    // Let's interpret "Student Discount" as paying the Campus delivery fee instead of Standard.
    // Or if products have `student_price_ghs`, use that?
    // For anonymous orders, we might not want to give student *product* prices unless verified? 
    // But let's assume "Campus Delivery" implies student context for now to match naive client logic securely.
    
    const realDeliveryFee = isCampusDelivery ? DELIVERY_FEES.campus : DELIVERY_FEES.standard;
    const appliedStudentDiscount = 0; // If we just use the lower fee, we don't need a separate "discount" value unless tracking it.
    
    // 3. Recalculate Subtotal
    let calculatedSubtotal = 0;
    const finalCartItems = []; // Rebuild items with trusted names/prices if needed

    for (const item of clientCartItems) {
      const dbProduct = dbProductMap.get(item.id);
      if (!dbProduct) {
        throw new Error(`Product not found: ${item.name} (${item.id})`); // Stop order if product doesn't exist
      }

      // Use student price if campus delivery? Or always standard price?
      // To be safe and consistent with "DiscreetKit", let's use standard price unless we have strict student auth.
      // However, if the business model relies on campus trust, maybe we use student price?
      // Let's use `price_ghs` (Standard) to be safe against abuse, unless `is_student_product` logic exists.
      // Current client logic sends `studentDiscount` as a value.
      // Let's use standard prices for now to prevent tampering.
      const price = dbProduct.price_ghs; 

      calculatedSubtotal += price * item.quantity;
      
      finalCartItems.push({
        ...item,
        price: price, // Ensure price is correct in stored json
        name: dbProduct.name // Ensure name is correct
      });
    }

    const calculatedTotalPrice = calculatedSubtotal + realDeliveryFee;

    // Compare with client provided values (Optional: just overwrite, but logging discrepancies is good for security)
    const clientTotal = parseFloat(validatedFields.data.totalPrice);
    if (Math.abs(calculatedTotalPrice - clientTotal) > 0.5) { // 0.5 tolerance for float math
         console.warn(`[Price Security] Client Total: ${clientTotal}, Server Total: ${calculatedTotalPrice}. Overwriting with Server Total.`);
    }
    
    const priceDetails = {
      subtotal: calculatedSubtotal,
      student_discount: appliedStudentDiscount, // We effectively applied it via lower delivery fee
      delivery_fee: realDeliveryFee,
      total_price: calculatedTotalPrice,
    };
    
    // --- END SECURITY CHECK ---

    const code = generateTrackingCode();
    const partnerCode = generatePartnerCode(); // Generate unique partner access code

    // Attempt pharmacy assignment based on delivery area
    // We'll assign after order creation to use the order ID
    // Logic moved to after payment or immediate if needed. 
    // For now, we just prepare the order.

    // 1. Insert into orders table with status 'pending_payment' (no pharmacy yet)
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        code,
        partner_code: partnerCode, // Store unique partner code
        items: finalCartItems, // Use verified items
        status: 'pending_payment',
        delivery_area: finalDeliveryArea,
        delivery_address_note: validatedFields.data.deliveryAddressNote,
        phone_masked: validatedFields.data.phone_masked,
        email: validatedFields.data.email,
        pharmacy_id: null, // Will be assigned after payment
        ...priceDetails, // Use server-calculated prices
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

    // FIRE AND FORGET: Don't await this. Let it run in background to speed up order creation.
    sendSMS(validatedFields.data.phone_masked, initialSmsMessage)
      .catch(err => console.error('Background SMS failed:', err));

    // 4. Auto-Assignment skipped here. Will be handled by webhook after payment.


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
      partnerCode: order.partner_code, // Include partner code
      status: order.status,
      items: items,
      deliveryArea: order.delivery_area,
      deliveryAddressNote: order.delivery_address_note,
      isStudent: !!order.student_discount && order.student_discount > 0, // Infer from discount
      subtotal: order.subtotal,
      studentDiscount: order.student_discount,
      deliveryFee: order.delivery_fee,
      totalPrice: order.total_price,
      courierName: order.courier_name,
      courierPhone: order.courier_phone,
      courierTrackingUrl: order.courier_tracking_url,
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
 * Handles the AI chat interaction by calling the OpenAI API.
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
    const result = await answerQuestions({ query: message, history: history });
    return result.answer;
  } catch (error) {
    console.error('AI Error:', error);
    return "I'm sorry, I'm having trouble connecting right now. Please try again later.";
  }
}

const suggestionSchema = z.object({
  suggestion: z.string().min(5, 'Suggestion must be at least 5 characters long.').max(1000, "Suggestion is too long."),
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

/**
 * Adds a user to the waitlist securely using admin privileges (bypasses RLS).
 */
export async function joinWaitlist(nickname: string, phone: string) {
  try {
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from('waitlist').insert({
      nickname,
      phone,
    });

    if (error) {
      // Handle unique constraint violation for phone number if it exists
      if (error.code === '23505') { // Postgres unique_violation code
        return { success: false, message: "This number is already on the list." };
      }
      throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error('Waitlist Join Error:', error);
    return { success: false, message: "Something went wrong. Please try again." };
  }
}

// --- Medication Refill Actions ---

const refillSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  frequency: z.enum(['monthly', 'quarterly']),
  deliveryAddress: z.string().min(10, 'Valid delivery address is required'), // JSON string
  doctor: z.string().optional(),
  prescriptionUrl: z.string().optional(), // Should be required technically, but optional for migration/flexibility? Let's make it optional for now, enforced by UI.
});

export async function createRefillSubscription(prevState: any, formData: FormData) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: 'You must be logged in to enroll.' };
    }

    const rawData = {
      productId: formData.get('productId'),
      frequency: formData.get('frequency'),
      deliveryAddress: formData.get('deliveryAddress'),
      doctor: formData.get('doctor'),
      prescriptionUrl: formData.get('prescriptionUrl'),
    };

    const validated = refillSchema.safeParse(rawData);

    if (!validated.success) {
      return {
        success: false,
        message: 'Invalid input.',
        errors: validated.error.flatten().fieldErrors
      };
    }

    const address = JSON.parse(validated.data.deliveryAddress); // Verify JSON

    const { data, error } = await supabase
      .from('medication_refill_subscriptions')
      .insert({
        user_id: user.id,
        product_id: parseInt(validated.data.productId), // Convert bigInt (as number)
        frequency: validated.data.frequency,
        delivery_address: address,
        prescribing_doctor: validated.data.doctor || null,
        prescription_document_url: validated.data.prescriptionUrl || null,
        status: 'active'
      })
      .select('subscription_code, id')
      .single();

    if (error) {
        console.error('Subscription error:', error);
        return { success: false, message: 'Failed to create subscription. ' + error.message };
    }

    revalidatePath('/refills/dashboard');
    return { success: true, message: 'Enrolled successfully!', code: data.subscription_code };

  } catch (error: any) {
    console.error('Create Subscription Error:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}

export async function getUserRefillSubscriptions() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return [];

  // Use the view for richer data
  const { data, error } = await supabase
    .from('active_refill_subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .order('enrolled_at', { ascending: false });

  if (error) {
    console.error('Fetch subscriptions error:', error);
    return [];
  }
  return data;
}

export async function getUserRefillLogs(subscriptionId: string) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from('refill_logs')
        .select('*')
        .eq('subscription_id', subscriptionId)
        .order('filled_at', { ascending: false });
        
    if (error) return [];
    return data;
}
