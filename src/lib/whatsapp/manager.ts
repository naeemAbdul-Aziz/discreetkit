import { sendMessage, sendInteractiveButtons, sendInteractiveList } from './service';
import { getSession, updateSession, clearSession, transitionState } from './session';
import { logger } from '@/lib/logger';
import type { ConversationState, SessionData } from './types';
import { getSupabaseAdminClient } from '../supabase';
import { generateTrackingCode, generatePartnerCode } from '../data';
import { generateRefillOrder, checkInAdherence } from '../refill-logic';

/**
 * Main entry point for handling incoming messages.
 */
export async function handleIncomingMessage(
    from: string, // WhatsApp ID (e.g., wallet ID or phone)
    body: string,
    profileName?: string,
    location?: { lat: number, long: number } // [NEW] Location Data
) {
    logger.info('Handling incoming message', { context: 'WhatsApp-Manager', data: { from, body } });

    // 1. Load Session
    const session = await getSession(from);
    logger.debug('Session loaded', { context: 'WhatsApp-Manager', data: { state: session.state } });

    // [NEW] If location is present, use it for logic (override body if empty or generic)
    if (location) {
        console.log(`[Location Received] ${location.lat}, ${location.long}`);
    }
    const normalizedBody = body.trim().toLowerCase();

    // 0. INTERCEPT NUMERIC INPUT (Virtual Buttons)
    // If user typed '1', '2', etc., and we have a list context, map it to the ID.
    if (/^\d+$/.test(normalizedBody) && session.listOptions && session.listOptions.length > 0) {
        const index = parseInt(normalizedBody) - 1;
        if (index >= 0 && index < session.listOptions.length) {
            // REWRITE the body as if the user clicked the button
            body = session.listOptions[index];
            console.log(`[Virtual Button] Mapped '${normalizedBody}' -> '${body}'`);
        }
    }

    // HIGH PRIORITY: CHECKOUT FLOW INTERCEPT
    // If we are viewing a product, we prioritize checking for "Buy" or "Back"
    if (session.state === 'VIEWING_PRODUCT') {
        await handleViewingProductState(from, body, session);
        return;
    }

    // 1. GLOBAL COMMANDS (Always available)
    if (normalizedBody === 'hi' || normalizedBody === 'hello' || normalizedBody === 'menu' || normalizedBody === 'start') {
        await sendMainMenu(from, profileName);
        return;
    }

    // Global Shop Command
    if (normalizedBody === 'shop' || normalizedBody === 'store') {
        await sendCategories(from);
        return;
    }

    // Global Refill Command [NEW]
    if (normalizedBody === 'refill' || normalizedBody === 'meds') {
        await handleRefillKeyword(from);
        return;
    }

    // 2. STATE BASED ROUTING
    switch (session.state) {
        case 'IDLE':
            await handleIdleState(from, body);
            break;

        case 'BROWSING_CATALOG':
            await handleBrowsingState(from, body, session);
            break;

        case 'PARTNER_CARE_MENU':
            await handlePartnerCareState(from, body);
            break;

        case 'PARTNER_CARE_VERIFICATION':
            await handlePartnerVerification(from, body);
            break;

        case 'COLLECTING_ADDRESS':
            await handleCollectingAddressState(from, body, session, location);
            break;

        case 'SELECTING_CAMPUS': // [NEW]
            await handleCampusSelection(from, body, session);
            break;

        case 'AWAITING_TRACKING_CODE':
            await handleTrackingCodeInput(from, body);
            break;

        case 'REFILL_CONFIRMATION':
            await handleRefillConfirmation(from, body, session);
            break;

        default:
            await sendMainMenu(from, profileName);
            break;
    }
}

// --- STATE HANDLERS ---

async function sendMainMenu(to: string, name?: string) {
    const greeting = name ? `Hello ${name}!` : 'Hello!';
    const message = `${greeting} Welcome to *DiscreteKit Assistant*.
  
Your privacy is our priority. How can we help you today?`;

    const rows = [
        { id: 'menu_shop', title: '🛍️ Shop Products', description: 'Browse kits & essentials' },
        { id: 'menu_care', title: '🏥 Partner Care', description: 'Marie Stopes services' },
        { id: 'menu_track', title: '📦 Track Order', description: 'Check delivery status' },
        { id: 'menu_help', title: '❓ FAQ & Help', description: 'Common questions' },
    ];

    await updateSession(to, {
        state: 'IDLE',
        listOptions: rows.map(r => r.id) // Save IDs for number mapping
    });
    await sendInteractiveList(to, 'Main Menu', message, [{ title: 'Options', rows }]);
}

async function handleIdleState(to: string, body: string) {
    const selection = body.toLowerCase();

    if (selection.includes('shop') || body === 'menu_shop') {
        await sendCategories(to);
    } else if (selection.includes('care') || body === 'menu_care') {
        await sendPartnerCareMenu(to);
    } else if (selection.includes('track') || body === 'menu_track') {
        await sendMessage(to, "📦 *Order Tracking*\n\nPlease reply with your **Order Code** (e.g., MWP-ABC-123 or DK-xxxx).\n\n_You can find this code in your confirmation email or previous message._");
        await transitionState(to, 'AWAITING_TRACKING_CODE');
        return;
    } else if (selection.includes('faq') || body === 'menu_help') {
        await sendMessage(to, "*FAQ*\n\nQ: Is it discreet?\nA: Yes, 100% unbranded packaging.\n\nQ: Who is the sender?\nA: 'DK Retail' on statements.\n\n(Reply 'menu' to go back)");
    } else {
        // If user sends a potential order code
        // If user sends a potential order code
        const code = body.toUpperCase().replace('#', '').trim();
        if (code.startsWith('DK-')) {
            await sendMessage(to, `🔍 Checking status for ${code}...`);

            const supabase = getSupabaseAdminClient();
            const { data: order, error } = await supabase
                .from('orders')
                .select('status, created_at')
                .eq('code', code)
                .single();

            if (error || !order) {
                await sendMessage(to, `❌ We couldn't find an order with code *${code}*.\nPlease check the code and try again.`);
            } else {
                const statusMap: Record<string, string> = {
                    'pending_payment': 'Payment Pending ⏳',
                    'received': 'Order Received ✅',
                    'processing': 'Processing 📦',
                    'shipped': 'Out for Delivery 🚚',
                    'delivered': 'Delivered 🎉',
                    'cancelled': 'Cancelled ❌'
                };
                const statusText = statusMap[order.status] || order.status;
                const dateStr = new Date(order.created_at).toLocaleDateString('en-GB', { 
                    day: 'numeric', month: 'short', year: 'numeric' 
                });
                await sendMessage(to, `📦 *Order Status*\n\nOrder Code: *${code}*\nStatus: *${statusText}*\nPlaced on: ${dateStr}\n\nNeed more help? Reply *Menu* to see all options.`);
            }
        } else {
            // [HYBRID ROUTER]
            // If the user says something that isn't a command or code, send to Pacely (AI)
            // But only if it's long enough to be a question (> 2 chars)
            if (body.length > 2) {
                try {
                    // Lazy load AI to avoid startup circular deps if any
                    const { answerQuestions } = await import('../../ai/flows/answer-questions');
                    const response = await answerQuestions({
                        query: body, 
                        history: [] // We could fetch history from session/redis later
                    });

                    // Format: Convert **bold** to *bold* and ensure list spacing
                    const formattedAnswer = response.answer
                        .replace(/\*\*/g, '*')
                        .replace(/([^\n])\s(\d+\.)/g, '$1\n\n$2');

                    await sendMessage(to, formattedAnswer);
                } catch (aiError) {
                    console.error('AI Error:', aiError);
                    await sendMainMenu(to); // Fallback to menu
                }
            } else {
                await sendMainMenu(to);
            }
        }
    }
}

async function sendCategories(to: string) {
    // Real DB fetch
    const supabase = getSupabaseAdminClient();
    const { data: categories, error } = await supabase
        .from('categories')
        .select('name');

    if (error || !categories) {
        console.error('Category fetch error:', error);
        await sendMessage(to, "Sorry, we are having trouble loading the shop. Please try again later.");
        return;
    }

    // Extract names
    const distinct = categories.map(c => c.name).slice(0, 10);

    const rows = distinct.map(c => ({
        id: `cat_${c}`,
        title: c,
        description: 'View products'
    }));

    await transitionState(to, 'BROWSING_CATALOG');
    await updateSession(to, {
        state: 'BROWSING_CATALOG', // Ensure state is set
        listOptions: rows.map(r => r.id)
    });
    await sendInteractiveList(to, 'Shop Categories', 'Select a category:', [{
        title: 'Collections',
        rows
    }]);
}

async function handleBrowsingState(to: string, body: string, _session: SessionData) {
    // Check if it's a category selection
    const categoryPrefix = 'cat_';

    if (body.startsWith(categoryPrefix)) {
        const categoryName = body.replace(categoryPrefix, '');
        await sendProductsInCategory(to, categoryName);
        return;
    }

    // Check if it's a product selection (we'll use prod_ID)
    if (body.startsWith('prod_')) {
        const productId = body.replace('prod_', '');
        await sendProductDetails(to, productId);
        return;
    }

    // If text search or invalid input, go back to categories or search
    if (body.toLowerCase() === 'back') {
        await sendCategories(to);
    } else {
        await TransitionToSearch(to, body);
    }
}

async function sendProductsInCategory(to: string, category: string) {
    const supabase = getSupabaseAdminClient();
    const { data: products } = await supabase
        .from('products')
        .select('id, name, price_ghs, description')
        .eq('category', category)

    if (!products || products.length === 0) {
        await sendMessage(to, `No products found in ${category}.`);
        await sendCategories(to);
        return;
    }

    const rows = products.map(p => ({
        id: `prod_${p.id}`,
        title: p.name.substring(0, 24), // Limit title length
        description: `GHS ${p.price_ghs} - ${p.description?.substring(0, 30)}...`
    }));

    await updateSession(to, {
        state: 'BROWSING_CATALOG',
        listOptions: rows.map(r => r.id)
    });
    await sendInteractiveList(to, category, `Found ${products.length} items:`, [{
        title: 'Products',
        rows
    }]);
}

async function sendProductDetails(to: string, productId: string) {
    const supabase = getSupabaseAdminClient();
    const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

    if (!product) {
        await sendMessage(to, "Product not found.");
        return;
    }

    const message = `*${product.name}*\n\n${product.description}\n\n💰 Price: *GHS ${product.price_ghs}*\n\nReply with "Buy" to purchase instantly or "Back" to keep shopping.`;

    // We transition to VIEWING_PRODUCT to handle the "Buy" response
    const buttons = [
        { type: 'reply', reply: { id: 'btn_back', title: '⬅️ Back' } },
        { type: 'reply', reply: { id: 'btn_buy', title: '🛍️ Buy Now' } }
    ];

    // For buttons, we also want number support (1. Back, 2. Buy)
    await updateSession(to, {
        state: 'VIEWING_PRODUCT',
        cart: { items: [product.id.toString()], total: product.price_ghs },
        lastInteraction: Date.now(),
        listOptions: buttons.map(b => b.reply.id) // Map button IDs
    });

    await sendInteractiveButtons(to, message, buttons as any);
}

async function TransitionToSearch(to: string, query: string) {
    await sendMessage(to, `Searching for "${query}"...`);
    // Could call Supabase ILIKE query here
    await sendCategories(to);
}

// --- CHECKOUT HANDLERS ---

export async function handleViewingProductState(to: string, body: string, session: SessionData) {
    if (body === 'btn_buy' || body.toLowerCase() === 'buy' || body.toLowerCase().includes('buy')) {
        await transitionState(to, 'COLLECTING_ADDRESS');

        // [MODIFIED] enhanced Address Options
        const buttons = [
            { type: 'reply', reply: { id: 'addr_campus', title: '🎓 Campus (Free)' } },
            // Could add 'addr_saved' here if we had logic
        ];

        await updateSession(to, {
            listOptions: buttons.map(b => b.reply.id)
        });

        await sendMessage(to, "📍 *Where should we deliver?*\n\nReply with **Text Address**, send a **Location Pin**, or select an option below:",
            // We can't mix buttons with text easily in standard sendMessage unless we use interactiveButtons
            // But we want to allow Free Text input too.
            // Best approach: Send text prompting for input, AND verify if they click a button.
            // But wait, interactive message replaces keyboard slightly.
            // Let's send Interactive Buttons Message. User can still type text? Yes.
        );

        await sendInteractiveButtons(to, "Choose Delivery Method:", buttons as any);

    } else if (body === 'btn_back' || body.toLowerCase() === 'back') {
        await sendCategories(to);
    } else {
        // If user types something else while viewing product, we gently nudge or handle as new command
        // But strictly, we check for exit commands.
        if (body.toLowerCase() === 'menu') {
            await sendMainMenu(to);
        } else {
            await sendMessage(to, "Please reply 'Buy' to purchase the item in your cart, or 'Back' to keep browsing.");
        }
    }
}

async function sendCheckoutLink(to: string, session: SessionData) {
    if (!session.cart.items.length) {
        await sendMessage(to, "Your cart is empty. Please select a product first.");
        await sendCategories(to);
        return;
    }

    const amount = session.cart.total; // In GHS
    const email = `whatsapp_${to.replace(/\D/g, '')}@discretekit.com`; // Dummy email for guest checkout
    const orderCode = generateTrackingCode();
    const partnerCode = generatePartnerCode();

    logger.info('Initializing checkout', { context: 'WhatsApp-Manager', data: { from: to, amount } });
    
    // Generate Paystack Link
    let paystackSecret = process.env.PAYSTACK_SECRET_KEY as string | undefined;
    if (typeof paystackSecret === 'string') {
        // Normalize in case env var is wrapped in quotes
        paystackSecret = paystackSecret.replace(/^"|"$/g, '').trim();
    }

    // [STUDENT LOGIC] Check if address indicates campus
    const isStudent = session.address?.startsWith('Campus:');
    if (isStudent) {
        // Logic to waive fee/discount? 
        // Currently amount is just product total. Delivery fee logic is usually added on top.
        // For simplicity in this bot V1, we assume the price includes everything or is flat.
        // But if we want to show 'Free Delivery', we should probably mention it.
        // Assuming current 'amount' calculation in this file is just cart.total (Product Price).
        // If there was a delivery fee added, we would subtract it here.
    }

    if (!paystackSecret) {
        await sendMessage(to, "Payment system is currently under maintenance. Please try again later.");
        console.error("Missing PAYSTACK_SECRET_KEY");
        return;
    }

    try {
        // [FIXED] Prepare Delivery Note BEFORE the insert object
        let deliveryNote = `Source: WhatsApp Bot | Guest: ${session.name || 'Unknown'}`;
        if (session.address) {
            deliveryNote += ` | Address: ${session.address}`;
        }
        if (session.location) {
            deliveryNote += ` | Location: https://maps.google.com/?q=${session.location.lat},${session.location.long}`;
        }

        // 1. Create Pending Order in Database
        const supabase = getSupabaseAdminClient();
        const { error: dbError } = await supabase.from('orders').insert({
            code: orderCode,
            partner_code: partnerCode,
            status: 'pending_payment',
            subtotal_ghs: amount,
            student_discount_ghs: 0,
            delivery_fee_ghs: 0,
            total_price_ghs: amount,
            phone_masked: to, // Note: Website sanitizes to 0..., bot keeps whatsapp:+
            email: email,
            delivery_address_note: deliveryNote,
            delivery_area: 'WhatsApp',
            items: session.cart.items.map(id => {
                const itemData = session.listOptions?.find(opt => opt === `prod_${id}`);
                // Ideally we'd have the product details in session, but since we re-fetch in sendProductDetails, 
                // and session cart only has IDs, we'll try to find a name if possible or just use ID.
                // WE SHOULD ALIGN THIS: { id, name, price, quantity }
                return { id: parseInt(id), quantity: 1, price: amount }; 
            })
        });

        if (dbError) {
            logger.error('Database error during order creation', { context: 'WhatsApp-Manager', data: dbError });
            await sendMessage(to, "❌ *System Error*: We couldn't create your order record. Please contact support.");
            return;
        }
        
        logger.info('Order record created', { context: 'WhatsApp-Manager', data: { code: orderCode } });

        // 2. Initialize Paystack Transaction
        const response = await fetch('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${paystackSecret}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                amount: amount * 100, // In kobo
                currency: 'GHS',
                reference: orderCode, // Link via Code
                metadata: {
                    order_code: orderCode,
                    tracking_code: orderCode,
                    whatsapp_id: to,
                    source: 'whatsapp'
                }
            })
        });

        const data = await response.json();
        if (data.status && data.data.authorization_url) {
            const checkoutUrl = data.data.authorization_url;
            
            logger.info('Checkout link generated', { context: 'WhatsApp-Manager', data: { code: orderCode } });

            await sendMessage(to, `🚀 *Almost done!*\n\nClick the secure link below to complete your payment of *GHS ${amount}*.\n\n🔗 ${checkoutUrl}\n\n_Your order will be processed immediately after payment._`);

            await updateSession(to, { state: 'IDLE', cart: { items: [], total: 0 } }); // Clear cart after link generation
        } else {
            throw new Error(data.message || 'Paystack init failed');
        }

    } catch (error) {
        logger.error('Checkout error', { context: 'WhatsApp-Manager', data: error });
        await sendMessage(to, "❌ *Checkout Error*: We couldn't generate your payment link. Please try again or contact support.");
    }
}

async function sendPartnerCareMenu(to: string) {
    const rows = [
        { id: 'care_verify', title: 'Verify Partner Code', description: 'Unlock free/discounted services' },
        { id: 'care_clinic', title: 'Find Nearest Clinic', description: 'Get directions' },
        { id: 'care_speak', title: 'Counselor Hotline', description: 'Talk to a professional' }
    ];

    await updateSession(to, {
        state: 'PARTNER_CARE_MENU',
        listOptions: rows.map(r => r.id)
    });

    await sendInteractiveList(to, 'Partner Care 🏥', 'Exclusive services for our partners.\n\n*Marie Stopes Ghana*', [
        {
            title: 'Actions',
            rows
        }
    ]);
}

async function handlePartnerCareState(to: string, body: string) {
    // 1. Handle Menu Selection
    if (body === 'care_verify' || body.toLowerCase().includes('verify')) {
        await transitionState(to, 'PARTNER_CARE_VERIFICATION');
        await sendMessage(to, "Please enter your *Partner Access Code* (e.g., DK-MS-1234) found on your order receipt.");
        return;
    }

    if (body === 'care_clinic' || body.toLowerCase().includes('clinic')) {
        await sendMessage(to, "📍 *Marie Stopes Clinics*\n\nThey have centers across Ghana. Visit their locator:\nhttps://mariestopes.org.gh/find-us\n\n(Reply 'Menu' to go back)");
        return;
    }

    if (body === 'care_speak' || body.toLowerCase().includes('counselor')) {
        await sendMessage(to, "📞 *Confidential Hotline*\n\nCall Marie Stopes directly:\n*0800 20 80 80* (Toll Free)\n\nWhatsApp: 055 656 1081\n\n(Reply 'Menu' to go back)");
        return;
    }

    // Default Fallback: [HYBRID ROUTER]
    // If not a menu click, try AI
    if (body.length > 2) {
        try {
            const { answerQuestions } = await import('../../ai/flows/answer-questions');
            const response = await answerQuestions({
                query: body,
                history: []
            });
            const formattedAnswer = response.answer
                .replace(/\*\*/g, '*')
                .replace(/([^\n])\s(\d+\.)/g, '$1\n\n$2');
            await sendMessage(to, formattedAnswer);
            // Re-offer menu after answer so they aren't lost
            // await sendPartnerCareMenu(to); // Optional: might be too spammy. Let them read.
        } catch (e) {
            await sendPartnerCareMenu(to);
        }
    } else {
        await sendPartnerCareMenu(to);
    }
}

// --- VERIFICATION HANDLER ---
async function handlePartnerVerification(to: string, body: string) {
    const code = body.trim().toUpperCase();

    // Basic format check
    if (!code.startsWith('DK-')) {
        await sendMessage(to, "❌ Invalid format. Code should start with 'DK-'. Please try again or reply 'Back'.");
        return;
    }

    const supabase = getSupabaseAdminClient();

    // Check if code exists in orders
    const { data: order, error } = await supabase
        .from('orders')
        .select('id, created_at, partner_code')
        .eq('partner_code', code)
        .single();

    if (error || !order) {
        await sendMessage(to, "❌ Code not found. Please check your receipt and try again.");
    } else {
        // Success!
        await sendMessage(to, `✅ *Access Granted*\n\nCode verified successfully.\nGenerated: ${new Date(order.created_at).toLocaleDateString()}\n\nYou are eligible for *Free STI Consulting* at any Marie Stopes center.\n\nShow this message at the front desk.`);
        await updateSession(to, { state: 'IDLE' }); // Reset to IDLE or a "LOGGED_IN" state
    }
}



// --- ADDRESS COLLECTION HANDLER ---
async function handleCollectingAddressState(
    to: string,
    body: string,
    session: SessionData,
    location?: { lat: number; long: number }
) {
    // 1. Check for Campus Selection
    if (body === 'addr_campus' || body.toLowerCase().includes('campus')) {
        await sendCampusList(to);
        return;
    }

    // 2. Check for Previous Address Selection (if we decide to implement history later, logic goes here)
    // For now, we rely on the prompt instructing them.

    if (location) {
        // User sent a PIN
        await updateSession(to, {
            location: location,
            address: 'GPS Pin Received'
        });
        await sendMessage(to, "📍 *Location Received!*\n\nGenerating your secure and private checkout link...");
        await sendCheckoutLink(to, { ...session, location });
    } else {
        // User sent TEXT
        if (body.length < 3) {
            await sendMessage(to, "Please enter a valid delivery address or select an option below.");
            return;
        }
        await updateSession(to, {
            address: body
        });
        await sendMessage(to, "🏘️ *Address Saved!*\n\nGenerating your secure and private checkout link...");
        await sendCheckoutLink(to, { ...session, address: body });
    }
}

// --- CAMPUS HANDLER ---
async function sendCampusList(to: string) {
    const { discounts } = require('../data'); // Lazy load data
    const rows = discounts.map((d: any) => ({
        id: `campus_${d.id}`,
        title: d.campus,
        description: 'Free Campus Delivery 🏢'
    }));

    await transitionState(to, 'SELECTING_CAMPUS');
    await updateSession(to, { listOptions: rows.map((r: any) => r.id) });
    await sendInteractiveList(to, 'Select Campus', 'Free delivery available for:', [{ title: 'Campuses', rows }]);
}

async function handleCampusSelection(to: string, body: string, session: SessionData) {
    const { discounts } = require('../data');
    if (body.startsWith('campus_')) {
        const campusId = parseInt(body.replace('campus_', ''));
        const campus = discounts.find((d: any) => d.id === campusId);

        if (campus) {
            await updateSession(to, {
                address: `Campus: ${campus.campus}`,
                // We could store a flag 'isStudent' in session if needed, 
                // but address starting with "Campus:" is enough for now to trigger logic?
                // Actually, sendCheckoutLink needs to know to apply discount.
                // Let's modify sendCheckoutLink to check address string or pass a flag.
                // Ideally, we store isStudent in session. Let's assume we pass it via address for now or update session.
            });
            // We need to re-fetch session with updated data or pass it manually
            // But wait, updateSession merges data.
            // Let's pass the specific address to sendCheckoutLink directly to be safe/fast.
            await sendMessage(to, `🏛️ *Verified: ${campus.campus}*\n\nFree Campus Delivery Applied!`);
            await sendCheckoutLink(to, { ...session, address: `Campus: ${campus.campus}` });
        } else {
            await sendMessage(to, "Invalid Selection. Please try again.");
            await sendCampusList(to);
        }
    } else {
        await sendMessage(to, "Please select a campus from the list.");
    }
}

// --- WEBHOOK HELPER ---
export async function sendOrderConfirmation(to: string, orderCode: string, amount: number, items: string) {
    const message = `✅ *Payment Confirmed!*\n\n` +
                    `Your order *${orderCode}* for *GHS ${amount}* has been received.\n\n` +
                    `📦 *Items*: ${items}\n` +
                    `🚚 *Status*: Processing\n\n` +
                    `*What next?*\n` +
                    `• Reply "Track" to see updates.\n` +
                    `• Reply "Shop" to buy again.\n\n` +
                    `Thank you for choosing *DiscreetKit*.`;

    await sendMessage(to, message);
}

/**
 * Handle Order Tracking Code Input
 */
async function handleTrackingCodeInput(to: string, body: string) {
    const code = body.toUpperCase().replace('#', '').trim();
    logger.debug('Handling tracking code input', { context: 'WhatsApp-Manager', data: { code } });

    // Validate if it looks like an order code (multiple formats)
    // Format 1: MWP-XXX-XXX (Website/New format)
    // Format 2: DK-MS-XXXX (Partner format)
    // Format 3: ABCDEFGHI (Generic fallback)
    const isCode = code.includes('-') || (code.length >= 8 && code.length <= 12);

    if (isCode) {
        await sendMessage(to, `🔍 *Searching for order ${code}...*`);

        const supabase = getSupabaseAdminClient();
        const { data: order, error } = await supabase
            .from('orders')
            .select('status, created_at, total_price_ghs, delivery_area')
            .eq('code', code)
            .single();

        if (error || !order) {
            // Try again with partner code if not found as order code
            const { data: partnerOrder } = await supabase
                .from('orders')
                .select('status, created_at, code')
                .eq('partner_code', code)
                .single();

            if (partnerOrder) {
                await reportOrderStatus(to, partnerOrder.code, partnerOrder.status, partnerOrder.created_at);
                await transitionState(to, 'IDLE');
                return;
            }

            await sendMessage(to, `❌ *Order Not Found*\n\nWe couldn't find an order with code *${code}*.\n\n_Please double check your code and try again, or reply *Menu* to go back._`);
        } else {
            await reportOrderStatus(to, code, order.status, order.created_at);
            await transitionState(to, 'IDLE');
        }
    } else {
        // Not a code, maybe they want to go back?
        if (body.toLowerCase() === 'menu' || body.toLowerCase() === 'back') {
            await sendMainMenu(to);
        } else {
            await sendMessage(to, "🤔 That doesn't look like a valid order code. Please enter your code (e.g., MWP-ABC-123) or reply *Menu* to exit tracking.");
        }
    }
}

async function reportOrderStatus(to: string, code: string, status: string, date: string) {
    const statusMap: Record<string, string> = {
        'pending_payment': 'Pending Payment ⏳',
        'received': 'Order Received ✅',
        'processing': 'Processing 📦',
        'shipped': 'Out for Delivery 🚚',
        'delivered': 'Delivered Successfully 🎉',
        'cancelled': 'Cancelled ❌'
    };
    const statusText = statusMap[status] || status;
    const dateStr = new Date(date).toLocaleDateString('en-GB', { 
        day: 'numeric', month: 'short', year: 'numeric' 
    });

    const msg = `📦 *Status Update*\n\n` +
                `Order Code: *${code}*\n` +
                `Current Status: *${statusText}*\n` +
                `Date Ordered: ${dateStr}\n\n` +
                `Need anything else? Just let me know or reply *Menu*.`;
    
    await sendMessage(to, msg);
}

// --- REFILL FLOW HANDLERS ---

async function handleRefillKeyword(from: string) {
    const supabase = getSupabaseAdminClient();
    const phone = from.replace(/\D/g, '');
    
    // Look for active subscription with this phone number (checking both exact and last 9 digits)
    const { data: sub, error } = await supabase
        .from('medication_refill_subscriptions')
        .select(`
            id,
            subscription_code,
            frequency,
            next_delivery_date,
            product:products(name)
        `)
        .or(`phone.eq.${phone},phone.ilike.%${phone.slice(-9)}`)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error || !sub) {
        await sendMessage(from, "❌ *No Active Refills Found*\n\nWe couldn't find an active medication subscription for this number.\n\n_If you have a hospital code, please enroll at discreetkit.com/refills first._");
        return;
    }

    const nextDate = new Date(sub.next_delivery_date);
    const today = new Date();
    const diffDays = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    const product = Array.isArray(sub.product) ? sub.product[0] : sub.product;
    let statusMsg = `📦 *Refill Status: ${product?.name || 'Medication'}*\n\n`;
    statusMsg += `Your next refill is due on: *${nextDate.toLocaleDateString('en-GB')}*\n`;
    
    if (diffDays <= 7 && diffDays > 0) {
        statusMsg += `\n⚠️ Your refill is coming up in ${diffDays} days!`;
    } else if (diffDays <= 0) {
        statusMsg += `\n🚨 Your refill is *DUE*!`;
    }

    const buttons = [
        { type: 'reply', reply: { id: 'refill_confirm', title: '✅ Confirm Refill' } },
        { type: 'reply', reply: { id: 'refill_adherence', title: '👍 I took my meds' } },
        { type: 'reply', reply: { id: 'menu', title: '🏠 Main Menu' } }
    ];

    await updateSession(from, { 
        state: 'REFILL_CONFIRMATION', 
        tempOrderCode: sub.id, // Store subscription ID for confirmation
        listOptions: buttons.map(b => b.reply.id)
    });

    await sendInteractiveButtons(from, statusMsg + "\n\nWould you like to trigger your delivery or report adherence?", buttons as any);
}

async function handleRefillConfirmation(from: string, body: string, session: SessionData) {
    const subscriptionId = session.tempOrderCode;
    if (!subscriptionId) {
        await sendMainMenu(from);
        return;
    }

    if (body === 'refill_confirm') {
        await sendMessage(from, "🔄 *Processing your refill...*");
        const result = await generateRefillOrder(subscriptionId);
        
        if (result.success) {
            await sendMessage(from, `✅ *Success!*\n\nYour refill order *${result.orderCode}* has been sent to the hospital hub.\n\n🚚 Delivery Fee: *GHS 15*\n_Please have your fee ready for the rider._`);
            await transitionState(from, 'IDLE');
        } else {
            await sendMessage(from, "❌ *Error*: We couldn't generate your refill order. Please contact support.");
        }
    } else if (body === 'refill_adherence') {
        const result = await checkInAdherence(subscriptionId);
        if (result.success) {
            await sendMessage(from, "🌟 *Great job!*\n\nYour adherence has been logged for your clinical record. Keep it up!");
            await transitionState(from, 'IDLE');
        } else {
            await sendMessage(from, "❌ *Error*: We couldn't log your adherence. Please try again later.");
        }
    } else {
        await handleIdleState(from, body);
    }
}
