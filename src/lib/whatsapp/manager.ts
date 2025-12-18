import { sendMessage, sendInteractiveButtons, sendInteractiveList } from './service';
import { getSession, updateSession, clearSession, transitionState } from './session';
import type { ConversationState, SessionData } from './types';
import { getSupabaseAdminClient } from '../supabase'; // Admin client for secure data access

/**
 * Main entry point for handling incoming messages.
 */
export async function handleIncomingMessage(
    from: string, // WhatsApp ID (e.g., wallet ID or phone)
    body: string,
    profileName?: string,
    location?: { lat: number, long: number } // [NEW] Location Data
) {
    const session = await getSession(from);
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

        case 'COLLECTING_ADDRESS': // [NEW]
            await handleCollectingAddressState(from, body, session, location);
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
        await sendMessage(to, "To track your order, please reply with your Order Code (e.g., #DK-A1B2-C3).");
        // In a real app, we'd transition to 'AWAITING_TRACKING_CODE'
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
                await sendMessage(to, `*Order Status*\nCode: ${code}\nStatus: *${statusText}*\nDate: ${new Date(order.created_at).toLocaleDateString()}\n\nReply 'Menu' for other options.`);
            }
        } else {
            await sendMainMenu(to);
        }
    }
}

async function sendCategories(to: string) {
    // Real DB fetch
    const supabase = getSupabaseAdminClient();
    const { data: categories, error } = await supabase
        .from('products')
        .select('category')
        .not('category', 'is', null);

    if (error || !categories) {
        console.error('Category fetch error:', error);
        await sendMessage(to, "Sorry, we are having trouble loading the shop. Please try again later.");
        return;
    }

    // Deduplicate categories
    const distinct = [...new Set(categories.map(c => c.category))].slice(0, 10) as string[];

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
        .limit(10); // WhatsApp list limit

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
        { type: 'reply', reply: { id: 'btn_back', title: 'Back' } },
        { type: 'reply', reply: { id: 'btn_buy', title: 'Buy Now' } }
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
        // [MODIFIED] Ask for Address instead of immediate checkout
        await transitionState(to, 'COLLECTING_ADDRESS');
        await sendMessage(to, "📍 *Where should we deliver?*\n\nPlease reply with your **Delivery Address** (House/Street Name) OR send a **Location Pin** for faster delivery.");
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
    const orderCode = `DK-WA-${Date.now().toString().slice(-6)}`; // Unique Code

    // Generate Paystack Link
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
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
            status: 'pending_payment',
            total_price: amount,
            subtotal: amount,
            phone_masked: to,
            email: email,
            delivery_address_note: deliveryNote,
            delivery_area: 'WhatsApp',
            items: session.cart.items.map(id => ({ product_id: id, quantity: 1, price: amount }))
        });

        if (dbError) {
            console.error("Order Creation Failed:", dbError);
            throw new Error(`Database insert failed: ${dbError.message}`);
        }

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
                    source: 'whatsapp',
                    whatsapp_id: to,
                    custom_fields: [
                        { display_name: "Order Code", variable_name: "order_code", value: orderCode }
                    ]
                }
            })
        });

        const data = await response.json();
        if (data.status && data.data.authorization_url) {
            await sendMessage(to, `Please click the link below to complete your secure payment of *GHS ${amount}*:\n\n${data.data.authorization_url}`);

            await updateSession(to, { state: 'IDLE', cart: { items: [], total: 0 } }); // Clear cart after link generation
        } else {
            throw new Error(data.message || 'Paystack init failed');
        }

    } catch (error) {
        console.error("Payment Link Generation Error:", error);
        await sendMessage(to, "Sorry, we couldn't generate a payment link right now.");
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

    // Default Fallback
    await sendPartnerCareMenu(to);
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
    if (location) {
        // User sent a PIN
        await updateSession(to, {
            location: location,
            address: 'GPS Pin Received'
        });
        await sendMessage(to, "📍 Location received! Generating your secure checkout link...");
        await sendCheckoutLink(to, { ...session, location }); // Pass updated session
    } else {
        // User sent TEXT
        if (body.length < 3) {
            // Basic validation
            await sendMessage(to, "Please enter a valid delivery address (e.g., 'House 4, Oxford Street').");
            return;
        }
        await updateSession(to, {
            address: body
        });
        await sendMessage(to, "🏠 Address received! Generating your secure checkout link...");
        await sendCheckoutLink(to, { ...session, address: body }); // Pass updated session
    }
}
