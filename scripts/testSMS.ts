import 'dotenv/config';

async function testSMS() {
    const apiKey = process.env.ARKESEL_API_KEY;
    // TEST CONFIGURATION: Neutral Sender ID + No Links
    const senderId = 'Hello';
    const message = "DiscreetKit System Test. Code: 123456.";

    if (!apiKey) {
        console.error('❌ ARKESEL_API_KEY is missing in .env');
        return;
    }

    const phone = process.argv[2]; // Get phone from command line
    if (!phone) {
        console.error('Usage: npx tsx scripts/testSMS.ts <phone_number>');
        return;
    }

    console.log(`🚀 Testing SMS to ${phone} using Neutral Sender ID: ${senderId}`);
    console.log(`📝 Message: "${message}"`);

    // Formatting Logic
    const recipient = phone.startsWith('0') ? `233${phone.substring(1)}` : phone;

    const url = new URL('https://sms.arkesel.com/sms/api');
    url.searchParams.append('action', 'send-sms');
    url.searchParams.append('api_key', apiKey);
    url.searchParams.append('to', recipient);
    url.searchParams.append('from', senderId);
    url.searchParams.append('sms', message);

    try {
        const response = await fetch(url.toString(), { method: 'GET' });
        // Arkesel returns JSON usually, but sometimes text if error
        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch {
            data = { message: text };
        }

        console.log('📡 Response Status:', response.status);
        console.log('📦 Response Body:', data);

        if (data.code === 'ok' || (data.message && data.message.toLowerCase().includes('success'))) {
            console.log('✅ SMS Sent Successfully!');
        } else {
            console.error('❌ SMS Failed:', data);
        }

    } catch (error) {
        console.error('❌ Network Error:', error);
    }
}

testSMS();
