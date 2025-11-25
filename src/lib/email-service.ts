/**
 * Email notification service using Resend
 * Handles sending emails for order updates to pharmacies
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Get subdomain-aware URLs
const getPharmacyDashboardUrl = () => {
    const pharmacyUrl = process.env.NEXT_PUBLIC_PHARMACY_URL || process.env.NEXT_PUBLIC_SITE_URL;
    return `${pharmacyUrl}/pharmacy/dashboard`;
};

const getAdminDashboardUrl = () => {
    const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || process.env.NEXT_PUBLIC_SITE_URL;
    return `${adminUrl}/admin`;
};

interface OrderAssignedEmailData {
    pharmacyName: string;
    pharmacyEmail: string;
    orderCode: string;
    deliveryArea: string;
    itemCount: number;
    totalPrice: number;
}

interface OrderStatusEmailData {
    pharmacyName: string;
    pharmacyEmail: string;
    orderCode: string;
    oldStatus: string;
    newStatus: string;
}

/**
 * Send email notification when order is assigned to pharmacy
 */
export async function sendOrderAssignedEmail(data: OrderAssignedEmailData) {
    try {
        const dashboardUrl = getPharmacyDashboardUrl();

        const { data: emailData, error } = await resend.emails.send({
            from: 'DiscreetKit <orders@discreetkit.com>',
            to: data.pharmacyEmail,
            subject: `New Order Assigned: ${data.orderCode}`,
            html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
              .order-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
              .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
              .label { font-weight: 600; color: #4b5563; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 28px;">Discreet<span style="color: #fbbf24;">Kit</span></h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">New Order Assignment</p>
              </div>
              <div class="content">
                <p>Hello <strong>${data.pharmacyName}</strong>,</p>
                <p>A new order has been assigned to your pharmacy and requires your attention.</p>
                
                <div class="order-card">
                  <h2 style="margin-top: 0; color: #667eea;">Order ${data.orderCode}</h2>
                  <p><span class="label">Delivery Area:</span> ${data.deliveryArea}</p>
                  <p><span class="label">Items:</span> ${data.itemCount}</p>
                  <p><span class="label">Total:</span> GHS ${data.totalPrice.toFixed(2)}</p>
                </div>

                <p>Please review this order and accept or decline it as soon as possible.</p>
                
                <a href="${dashboardUrl}" class="button">View Order in Dashboard</a>

                <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
                  You can manage all your orders from your pharmacy dashboard at 
                  <a href="${dashboardUrl}" style="color: #667eea;">${dashboardUrl}</a>
                </p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} DiscreetKit Ghana. All rights reserved.</p>
                <p>Discreet, reliable health product delivery.</p>
              </div>
            </div>
          </body>
        </html>
      `,
        });

        if (error) {
            console.error('[sendOrderAssignedEmail] Error:', error);
            return { success: false, error: error.message };
        }

        console.log('[sendOrderAssignedEmail] Email sent successfully:', emailData?.id);
        return { success: true, emailId: emailData?.id };
    } catch (error: any) {
        console.error('[sendOrderAssignedEmail] Exception:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Send email notification when order status changes
 */
export async function sendOrderStatusEmail(data: OrderStatusEmailData) {
    try {
        const dashboardUrl = getPharmacyDashboardUrl();

        const statusMessages: Record<string, string> = {
            processing: 'The order is now being processed and prepared for delivery.',
            out_for_delivery: 'The order is now out for delivery to the customer.',
            completed: 'The order has been successfully delivered and completed.',
        };

        const message = statusMessages[data.newStatus] || `Order status updated to ${data.newStatus}.`;

        const { data: emailData, error } = await resend.emails.send({
            from: 'DiscreetKit <orders@discreetkit.com>',
            to: data.pharmacyEmail,
            subject: `Order Status Update: ${data.orderCode}`,
            html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
              .status-badge { display: inline-block; background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; font-weight: 600; }
              .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 28px;">Discreet<span style="color: #fbbf24;">Kit</span></h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Order Status Update</p>
              </div>
              <div class="content">
                <p>Hello <strong>${data.pharmacyName}</strong>,</p>
                <p>Order <strong>${data.orderCode}</strong> status has been updated.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <span class="status-badge">${data.newStatus.replace(/_/g, ' ').toUpperCase()}</span>
                </div>

                <p>${message}</p>
                
                <a href="${dashboardUrl}" class="button">View Order Details</a>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} DiscreetKit Ghana. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
        });

        if (error) {
            console.error('[sendOrderStatusEmail] Error:', error);
            return { success: false, error: error.message };
        }

        console.log('[sendOrderStatusEmail] Email sent successfully:', emailData?.id);
        return { success: true, emailId: emailData?.id };
    } catch (error: any) {
        console.error('[sendOrderStatusEmail] Exception:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Log email notification attempt to database
 */
export async function logEmailNotification(
    orderId: number,
    pharmacyId: number,
    type: 'assigned' | 'status_changed',
    success: boolean,
    error?: string
) {
    try {
        const { getSupabaseAdminClient } = await import('@/lib/supabase');
        const supabase = getSupabaseAdminClient();

        await supabase.from('order_events').insert({
            order_id: orderId,
            status: `Email ${type}`,
            note: success
                ? `Email notification sent successfully`
                : `Email notification failed: ${error}`,
        });
    } catch (err) {
        console.error('[logEmailNotification] Failed to log:', err);
    }
}
