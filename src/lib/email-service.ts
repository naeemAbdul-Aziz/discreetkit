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
    total_price_ghs: number;
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
            from: 'DiscreetKit <hello@discreetkit.com>',
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
                  <p><span class="label">Total:</span> GHS ${data.total_price_ghs.toFixed(2)}</p>
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
            from: 'DiscreetKit <hello@discreetkit.com>',
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

/**
 * Send branded order confirmation email to customer
 */
export async function sendCustomerOrderConfirmation(order: {
    email: string;
    code: string;
    total_price_ghs: number;
    items: { name: string; quantity: number; price_ghs: number }[];
    deliveryArea: string;
}) {
    // DiscreetKit Brand Colors: Teal (#187f76) and Gold Accent
    const brandColor = '#187f76';
    const accentColor = '#fbbf24';
    const logoUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1762356008/discreetkit_profile_photo_voqfia.png';
    const trackUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/track?code=${order.code}`;

    try {
        const { data: emailData, error } = await resend.emails.send({
            from: 'DiscreetKit <hello@discreetkit.com>',
            to: order.email,
            subject: `Order Confirmation: ${order.code}`,
            html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9fafb; }
                .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
                .header { padding: 30px 20px; text-align: center; border-bottom: 3px solid ${brandColor}; }
                .logo { width: 60px; height: 60px; margin-bottom: 10px; border-radius: 50%; }
                .content { padding: 40px 30px; }
                .h1 { color: #111; font-size: 24px; margin-bottom: 20px; font-weight: 700; }
                .text { color: #555; margin-bottom: 20px; font-size: 16px; }
                .order-box { background-color: #f3f4f6; border-radius: 12px; padding: 20px; margin: 30px 0; }
                .order-row { display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
                .order-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
                .order-total { font-weight: 700; font-size: 18px; color: ${brandColor}; margin-top: 10px; padding-top: 10px; border-top: 2px solid #e5e7eb; display: flex; justify-content: space-between; }
                .button { display: inline-block; background-color: ${brandColor}; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 50px; font-weight: 600; text-align: center; margin-top: 20px; }
                .footer { background-color: #f9fafb; padding: 30px; text-align: center; font-size: 13px; color: #9ca3af; }
                .discreet-notice { background-color: #ecfdf5; border: 1px solid #d1fae5; color: #065f46; padding: 15px; border-radius: 8px; font-size: 14px; margin-top: 30px; text-align: center; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="${logoUrl}" alt="DiscreetKit Logo" class="logo">
                    <div style="font-weight: 700; font-size: 20px; color: #111;">DiscreetKit</div>
                </div>
                <div class="content">
                    <div class="h1">Order Confirmed</div>
                    <div class="text">Thank you for your order. We have received it and are preparing it for discreet delivery.</div>
                    
                    <div class="discreet-notice">
                        <strong>Privacy Check:</strong> This charge will appear on your statement as "Paystack" or "DiscreetKit". The package will arrive in plain, unbranded packaging.
                    </div>

                    <div class="order-box">
                        <div style="margin-bottom: 15px; font-size: 14px; color: #888;">ORDER #${order.code}</div>
                        
                        ${order.items.map(item => `
                        <div class="order-row">
                            <span style="color: #333;">${item.name} x${item.quantity}</span>
                            <span style="color: #555;">GHS ${(item.price_ghs * item.quantity).toFixed(2)}</span>
                        </div>
                        `).join('')}
                        
                        <div class="order-total">
                            <span>TOTAL</span>
                            <span>GHS ${order.total_price_ghs.toFixed(2)}</span>
                        </div>
                    </div>

                    <div style="text-align: center;">
                        <a href="${trackUrl}" class="button">Track Your Order</a>
                    </div>
                </div>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} Access DiscreetKit Ltd.</p>
                    <p>Accra, Ghana • <a href="mailto:hello@discreetkit.com" style="color: #9ca3af;">hello@discreetkit.com</a></p>
                    <p>You received this email because you placed an order on DiscreetKit.com.</p>
                </div>
            </div>
        </body>
        </html>
            `
        });

        if (error) {
            console.error('[sendCustomerOrderConfirmation] Error:', error);
            return { success: false, error: error.message };
        }
        return { success: true, emailId: emailData?.id };
    } catch (err: any) {
        console.error('[sendCustomerOrderConfirmation] Exception:', err);
        return { success: false, error: err.message };
    }
}

/**
 * Send receipt email to customer (can be same as confirmation or separate)
 * For now, we will alias it to confirmation or simple variant
 */
export async function sendCustomerReceipt(order: {
    email: string;
    code: string;
    total_price_ghs: number;
    items: { name: string; quantity: number; price_ghs: number }[];
    paymentDate: string;
}) {
    // Import brand templates to ensure contact details match the "new structure"
    const brandTemplates = await import('@/lib/brand-templates.json');
    const contactSection = brandTemplates.company_profile.sections.find((s: any) => s.heading === "Contact Details");
    const contactEmail = contactSection?.content.match(/Email: (.*)/)?.[1] || 'hello@discreetkit.com';

    // Currently re-using the confirmation style but focusing on "Receipt" wording
    const brandColor = '#187f76';
    const accentColor = '#fbbf24';
    const logoUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1762356008/discreetkit_profile_photo_voqfia.png';

    try {
        const { data: emailData, error } = await resend.emails.send({
            from: `DiscreetKit <${contactEmail}>`,
            to: order.email,
            subject: `Receipt for Order ${order.code}`,
            html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9fafb; }
                .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
                .header { padding: 30px 20px; text-align: center; border-bottom: 3px solid ${brandColor}; }
                .logo { width: 60px; height: 60px; margin-bottom: 10px; border-radius: 50%; }
                .content { padding: 40px 30px; }
                .h1 { color: #111; font-size: 24px; margin-bottom: 20px; font-weight: 700; }
                .text { color: #555; margin-bottom: 20px; font-size: 16px; }
                .receipt-box { border: 1px dashed #ccc; background-color: #fff; padding: 20px; margin: 30px 0; }
                .receipt-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
                .total { font-size: 20px; font-weight: 700; color: ${brandColor}; border-top: 1px solid #eee; padding-top: 15px; margin-top: 15px; display: flex; justify-content: space-between; }
                .footer { background-color: #f9fafb; padding: 30px; text-align: center; font-size: 13px; color: #9ca3af; }
            </style>
        </head>
        <body>
            <div class="container">
                 <div class="header">
                    <img src="${logoUrl}" alt="DiscreetKit Logo" class="logo">
                    <div style="font-weight: 700; font-size: 20px; color: #111;">DiscreetKit</div>
                </div>
                <div class="content">
                    <div class="h1">Payment Receipt</div>
                    <div class="text">This email confirms that your payment was successful.</div>
                    
                    <div class="receipt-box">
                        <div style="text-align: center; margin-bottom: 20px; color: #888; font-size: 13px;">${order.paymentDate}</div>
                        
                         ${order.items.map(item => `
                        <div class="receipt-row">
                            <span>${item.name} (x${item.quantity})</span>
                            <span>GHS ${(item.price_ghs * item.quantity).toFixed(2)}</span>
                        </div>
                        `).join('')}

                        <div class="total">
                            <span>Paid</span>
                            <span>GHS ${order.total_price_ghs.toFixed(2)}</span>
                        </div>
                    </div>

                    <div class="text" style="font-size: 14px; color: #888; text-align: center;">
                        Transaction Reference: ${order.code}
                    </div>
                </div>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} Access DiscreetKit Ltd.</p>
                    <p>Accra, Ghana • <a href="mailto:${contactEmail}" style="color: #9ca3af;">${contactEmail}</a></p>
                </div>
            </div>
        </body>
        </html>
            `
        });
        
        if (error) {
             console.error('[sendCustomerReceipt] Error:', error);
             return { success: false, error: error.message };
        }
        return { success: true, emailId: emailData?.id };

    } catch (err: any) {
        console.error('[sendCustomerReceipt] Exception:', err);
        return { success: false, error: err.message };
    }
}
