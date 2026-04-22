import { getSupabaseAdminClient } from './supabase';
import { generateTrackingCode, generatePartnerCode } from './data';
import { logger } from './logger';

/**
 * Validates a hospital-issued refill code.
 * In a production scenario, this would check against a pre-authorized batch 
 * uploaded by the partner hospital.
 */
export async function validateHospitalCode(code: string) {
  const supabase = getSupabaseAdminClient();
  
  // For MVP, we check if the code exists in our system's 'authorized_refill_tokens' 
  // (which we should add or simulate). 
  // Alternatively, we can check if it's already used in another active subscription.
  
  const { data, error } = await supabase
    .from('medication_refill_subscriptions')
    .select('id')
    .eq('hospital_refill_code', code.trim().toUpperCase())
    .eq('status', 'active');

  if (error) {
    const isSchemaError = error.message.includes('column') || error.message.includes('relation');
    const userMessage = isSchemaError 
      ? `Database Schema Mismatch: The "hospital_refill_code" system is not yet active on this environment. Please run the 20260405000001 migration.`
      : `Validation System Error: ${error.message}`;
      
    logger.error('Error validating hospital code', { context: 'Refill-Logic', data: error });
    return { valid: false, message: userMessage };
  }

  if (data && data.length > 0) {
    return { valid: false, message: 'This code has already been used for an active subscription.' };
  }

  // Basic format validation: DK-[HOSPITAL_ID]-XXXX
  const regex = /^DK-[A-Z0-9]+-[A-Z0-9]+$/i;
  if (!regex.test(code)) {
    let hint = 'Invalid code format. Please check your hospital card.';
    if (!code.toUpperCase().startsWith('DK-')) {
      hint = 'All clinical codes start with "DK-". Please verify your hospital token.';
    }
    return { valid: false, message: hint };
  }

  return { valid: true };
}

/**
 * Generates a standard Order from an active Refill Subscription.
 * This is triggered either by a Cron job or a WhatsApp "Confirm Refill" action.
 */
export async function generateRefillOrder(subscriptionId: string) {
  const supabase = getSupabaseAdminClient();
  const context = 'Refill-Order-Generation';

  try {
    // 1. Fetch Subscription Data
    const { data: sub, error: subError } = await supabase
      .from('medication_refill_subscriptions')
      .select(`
        *,
        product:products(*)
      `)
      .eq('id', subscriptionId)
      .single();

    if (subError || !sub) {
      throw new Error(`Subscription not found: ${subscriptionId}`);
    }

    if (sub.status !== 'active') {
      throw new Error(`Subscription is not active: ${sub.status}`);
    }

    // 2. Prepare Order Details
    const orderCode = generateTrackingCode();
    const partnerCode = generatePartnerCode();
    const deliveryFee = 15.00; // Flat fee as per business decision
    
    // items format: [{ id: number, quantity: number, price: number, name: string }]
    const items = [{
      id: sub.product_id,
      name: sub.product.name,
      price: 0, // Medication is free from hospital
      quantity: 1
    }];

    // 3. Create the Order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        code: orderCode,
        partner_code: partnerCode,
        items,
        status: 'received', // Auto-confirmed since it's a pre-authorized refill
        delivery_area: 'Refill Service',
        delivery_address_note: `Refill Subscription: ${sub.subscription_code} | Address: ${sub.delivery_address.street || 'See Subscription'}`,
        phone_masked: sub.phone,
        email: sub.delivery_address.email || `refill_${sub.subscription_code}@discreetkit.com`,
        subtotal_ghs: 0,
        student_discount_ghs: 0,
        delivery_fee_ghs: deliveryFee,
        total_price_ghs: deliveryFee,
        pharmacy_id: sub.hospital_id || sub.pharmacy_id, // Route to hospital hub
      })
      .select('id')
      .single();

    if (orderError) throw orderError;

    // 4. Log the Refill
    const { error: logError } = await supabase
      .from('refill_logs')
      .insert({
        subscription_id: sub.id,
        pharmacy_id: sub.hospital_id || sub.pharmacy_id,
        status: 'processing',
        pharmacist_notes: 'Automated refill order generated.'
      });

    if (logError) throw logError;

    // 5. Update Subscription - calculate next delivery date
    let nextDate = new Date();
    if (sub.frequency === 'quarterly') {
      nextDate.setMonth(nextDate.getMonth() + 3);
    } else {
      nextDate.setMonth(nextDate.getMonth() + 1);
    }

    await supabase
      .from('medication_refill_subscriptions')
      .update({ 
        next_delivery_date: nextDate.toISOString().split('T')[0] 
      })
      .eq('id', sub.id);

    logger.info('Refill order generated successfully', { context, data: { subscriptionId, orderId: order.id } });
    
    return { success: true, orderId: order.id, orderCode };

  } catch (error: any) {
    logger.error('Refill order generation failed', { context, data: error.message });
    return { success: false, message: error.message };
  }
}

/**
 * Records a 1-click adherence check-in from WhatsApp.
 */
export async function checkInAdherence(subscriptionId: string) {
  const supabase = getSupabaseAdminClient();
  
  const { error } = await supabase
    .from('refill_logs')
    .insert({
      subscription_id: subscriptionId,
      status: 'completed',
      adherence_status: 'confirmed',
      adherence_confirmed_at: new Date().toISOString(),
      pharmacist_notes: 'User self-reported adherence via WhatsApp.'
    });

  if (error) {
    logger.error('Adherence check-in failed', { context: 'Refill-Logic', data: error });
    return { success: false };
  }

  return { success: true };
}
