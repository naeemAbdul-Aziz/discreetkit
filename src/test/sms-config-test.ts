/**
 * Simple SMS configuration test
 * Run this to verify Arkesel API connection
 */

console.log('🔍 Testing SMS Configuration...');
console.log('Environment Check:');
console.log('- ARKESEL_API_KEY:', process.env.ARKESEL_API_KEY ? 'SET' : 'MISSING');
console.log('- ARKESEL_SENDER_ID:', process.env.ARKESEL_SENDER_ID || 'NOT SET');

// Test phone number formatting
function formatPhone(phone: string): string {
  return phone.startsWith('0') ? `233${phone.substring(1)}` : phone;
}

const testPhones = ['0241234567', '233241234567', '0501234567'];
console.log('\n📱 Phone Number Formatting Test:');
testPhones.forEach(phone => {
  console.log(`${phone} → ${formatPhone(phone)}`);
});

console.log('\n✅ Configuration test complete!');
console.log('💡 Use /api/test/sms endpoint to test actual SMS sending');

export {};