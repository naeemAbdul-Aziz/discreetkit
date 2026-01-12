import { sendMessage } from '../src/lib/whatsapp/service';

async function main() {
    const TO_NUMBER = 'whatsapp:+14155238886'; // Typical Sandbox join number, acts as echo or safe test? 
    // Actually, we should send to the user's number from the screenshot or a safe dummy. 
    // The screenshot shows user sending TO +14155238886. 
    // We should try to send to a dummy or just check if credentials load.

    console.log('Testing Twilio Configuration...');

    if (!process.env.TWILIO_ACCOUNT_SID) {
        console.error('❌ Missing TWILIO_ACCOUNT_SID');
        return;
    }
    if (!process.env.TWILIO_AUTH_TOKEN) {
        console.error('❌ Missing TWILIO_AUTH_TOKEN');
        return;
    }
    if (!process.env.TWILIO_PHONE_NUMBER) {
        console.error('❌ Missing TWILIO_PHONE_NUMBER');
        return;
    }

    console.log('✅ Credentials OK');

    // Optional: Try to send a message
    // const result = await sendMessage('whatsapp:+1234567890', 'Test Message');
    // console.log('Send Result:', result);
}

main().catch(console.error);
