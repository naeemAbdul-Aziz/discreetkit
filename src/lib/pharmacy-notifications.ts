/**
 * Pharmacy notification service
 * Handles SMS and email notifications for pharmacy order assignments
 */

import { sendSMS } from './actions';
import { sendOrderAssignedEmail, sendOrderStatusEmail, logEmailNotification } from './email-service';

// Get subdomain-aware pharmacy dashboard URL
const getPharmacyDashboardUrl = () => {
    const pharmacyUrl = process.env.NEXT_PUBLIC_PHARMACY_URL || process.env.NEXT_PUBLIC_SITE_URL;
    return `${pharmacyUrl}/pharmacy/dashboard`;
};

interface PharmacyNotificationData {
    pharmacyId: number;
    pharmacyName: string;
    pharmacyPhone: string;
    pharmacyEmail: string;
    orderId: number;
    orderCode: string;
    deliveryArea: string;
    itemCount: number;
    totalPrice: number;
}

/**
 * Send SMS notification to pharmacy when order is assigned
 */
export async function sendPharmacyOrderSMS(data: PharmacyNotificationData) {
    try {
        const dashboardUrl = getPharmacyDashboardUrl();

        const message = `New order ${data.orderCode} assigned to ${data.pharmacyName}. ${data.itemCount} items, GHS ${data.totalPrice.toFixed(2)}. Delivery: ${data.deliveryArea}. View: ${dashboardUrl}`;

        const result = await sendSMS(data.pharmacyPhone, message);

        // Log SMS attempt
        const { getSupabaseAdminClient } = await import('@/lib/supabase');
        const supabase = getSupabaseAdminClient();

        await supabase.from('pharmacy_notifications').insert({
            order_id: data.orderId,
            pharmacy_id: data.pharmacyId,
            status: result.ok ? 'sent' : 'failed',
            attempts: 1,
            last_error: result.error || null,
            sent_at: result.ok ? new Date().toISOString() : null,
        });

        return result;
    } catch (error: any) {
        console.error('[sendPharmacyOrderSMS] Error:', error);
        return { ok: false, recipient: data.pharmacyPhone, error: error.message };
    }
}

/**
 * Send email notification to pharmacy when order is assigned
 */
export async function sendPharmacyOrderEmail(data: PharmacyNotificationData) {
    try {
        const result = await sendOrderAssignedEmail({
            pharmacyName: data.pharmacyName,
            pharmacyEmail: data.pharmacyEmail,
            orderCode: data.orderCode,
            deliveryArea: data.deliveryArea,
            itemCount: data.itemCount,
            totalPrice: data.totalPrice,
        });

        // Log email attempt
        await logEmailNotification(
            data.orderId,
            data.pharmacyId,
            'assigned',
            result.success,
            result.error
        );

        return result;
    } catch (error: any) {
        console.error('[sendPharmacyOrderEmail] Error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Send both SMS and email notifications to pharmacy
 */
export async function notifyPharmacyOfAssignment(data: PharmacyNotificationData) {
    console.log('[notifyPharmacyOfAssignment] Sending notifications for order:', data.orderCode);

    const results = await Promise.allSettled([
        sendPharmacyOrderSMS(data),
        sendPharmacyOrderEmail(data),
    ]);

    const smsResult = results[0].status === 'fulfilled' ? results[0].value : { ok: false, error: 'Promise rejected' };
    const emailResult = results[1].status === 'fulfilled' ? results[1].value : { success: false, error: 'Promise rejected' };

    console.log('[notifyPharmacyOfAssignment] SMS result:', smsResult.ok ? 'sent' : smsResult.error);
    console.log('[notifyPharmacyOfAssignment] Email result:', emailResult.success ? 'sent' : emailResult.error);

    return {
        sms: smsResult,
        email: emailResult,
    };
}

/**
 * Send status update notification to pharmacy
 */
export async function notifyPharmacyOfStatusChange(
    pharmacyName: string,
    pharmacyEmail: string,
    orderCode: string,
    oldStatus: string,
    newStatus: string
) {
    try {
        const result = await sendOrderStatusEmail({
            pharmacyName,
            pharmacyEmail,
            orderCode,
            oldStatus,
            newStatus,
        });

        console.log('[notifyPharmacyOfStatusChange] Email result:', result.success ? 'sent' : result.error);
        return result;
    } catch (error: any) {
        console.error('[notifyPharmacyOfStatusChange] Error:', error);
        return { success: false, error: error.message };
    }
}
