
// Native fetch is available in Node 18+

async function run() {
    try {
        console.log('Testing SMS...');
        const response = await fetch('http://localhost:3000/api/test/sms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                orderId: 'VTR-N96-MVH', // Using the ID the user tried
                type: 'confirmation',
            }),
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Script Error:', error);
    }
}

run();

export { }; // Treat as module
