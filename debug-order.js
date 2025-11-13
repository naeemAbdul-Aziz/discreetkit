/**
 * Debug script to check order status and payment confirmation
 * Run with: node debug-order.js EWW-F93-9GK
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
const orderCode = process.argv[2];

if (!orderCode) {
  console.error('❌ Please provide order code: node debug-order.js EWW-F93-9GK');
  process.exit(1);
}

console.log('🔍 Debugging Order:', orderCode);
console.log('📱 NEXT_PUBLIC_SITE_URL:', envVars.NEXT_PUBLIC_SITE_URL);

async function checkOrderStatus() {
  try {
    // Check if we can access the tracking page
    const trackingUrl = `${envVars.NEXT_PUBLIC_SITE_URL}/track?code=${orderCode}`;
    console.log('🌐 Tracking URL:', trackingUrl);
    
    // Try to fetch tracking page
    const response = await fetch(trackingUrl);
    console.log('📡 Tracking page status:', response.status);
    
    if (response.status === 200) {
      console.log('✅ Tracking page accessible');
    } else {
      console.log('❌ Tracking page not accessible');
    }

  } catch (error) {
    console.error('❌ Error checking tracking:', error.message);
  }
}

// Manual SMS test
async function testConfirmationSMS() {
  try {
    const testEndpoint = `${envVars.NEXT_PUBLIC_SITE_URL}/api/test/sms`;
    console.log('🧪 Testing SMS endpoint:', testEndpoint);
    
    const response = await fetch(testEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId: orderCode,
        type: 'confirmation'
      })
    });

    const result = await response.json();
    console.log('📲 SMS Test Result:', JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('❌ SMS test error:', error.message);
  }
}

console.log('\n1️⃣ Checking tracking page...');
checkOrderStatus().then(() => {
  console.log('\n2️⃣ Testing SMS manually...');
  return testConfirmationSMS();
}).then(() => {
  console.log('\n✅ Debug complete!');
}).catch(console.error);