/**
 * Quick Arkesel API Test
 * This script tests the Arkesel SMS API directly using your credentials
 * Run with: node test-arkesel.js
 */

const fs = require('fs');
const path = require('path');

// Load environment variables manually from .env file
function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          let value = valueParts.join('=').trim();
          // Remove quotes if present
          value = value.replace(/^["']|["']$/g, '');
          envVars[key] = value;
        }
      }
    });
    
    return envVars;
  } catch (error) {
    console.error('❌ Error reading .env file:', error.message);
    process.exit(1);
  }
}

const envVars = loadEnvFile();

const ARKESEL_API_KEY = envVars.ARKESEL_API_KEY;
const ARKESEL_SENDER_ID = envVars.ARKESEL_SENDER_ID || 'DiscreetKit';

if (!ARKESEL_API_KEY) {
  console.error('❌ ARKESEL_API_KEY not found in .env file');
  process.exit(1);
}

// Test phone number - replace with your actual test number
const testPhoneNumber = '233241234567'; // Ghana format  
const testMessage = 'Hello from DiscreetKit! This is a test message from our production Arkesel integration.';

console.log('🧪 Testing Arkesel API...');
console.log('📱 Phone:', testPhoneNumber);
console.log('📧 Sender:', ARKESEL_SENDER_ID);
console.log('💬 Message:', testMessage.substring(0, 50) + '...');

// Build the API URL exactly as per Arkesel documentation
const apiUrl = new URL('https://sms.arkesel.com/sms/api');
apiUrl.searchParams.append('action', 'send-sms');
apiUrl.searchParams.append('api_key', ARKESEL_API_KEY);
apiUrl.searchParams.append('to', testPhoneNumber);
apiUrl.searchParams.append('from', ARKESEL_SENDER_ID);
apiUrl.searchParams.append('sms', testMessage);

// Add use_case for Nigerian numbers
if (testPhoneNumber.startsWith('234')) {
  apiUrl.searchParams.append('use_case', 'promotional');
  console.log('🇳🇬 Nigerian number detected, adding use_case=promotional');
}

console.log('🌐 API URL (masked):', apiUrl.toString().replace(/api_key=[^&]+/, 'api_key=***'));

// Use fetch instead of axios (available in Node.js 18+)
fetch(apiUrl.toString())
  .then(response => {
    console.log('📡 HTTP Status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('✅ Success! Response:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.code === 'ok') {
      console.log('🎉 SMS sent successfully!');
      if (data.balance !== undefined) console.log(`💰 Remaining balance: ${data.balance}`);
      if (data.main_balance !== undefined) console.log(`💳 Main balance: ${data.main_balance}`);
      if (data.user) console.log(`👤 User: ${data.user}`);
    } else {
      console.log('⚠️ Unexpected response format or error');
    }
  })
  .catch(error => {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('401')) {
      console.log('🔑 Check your API key configuration');
    } else if (error.message.includes('400')) {
      console.log('📝 Check your request parameters');
    }
  });