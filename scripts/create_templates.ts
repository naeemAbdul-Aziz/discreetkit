
import fs from 'fs';
import https from 'https';
import path from 'path';

// Read .env manually since we are running isolated
const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        env[parts[0].trim()] = parts.slice(1).join('=').trim();
    }
});

const SID = env.TWILIO_ACCOUNT_SID;
const TOKEN = env.TWILIO_AUTH_TOKEN;

if (!SID || !TOKEN) {
    console.error('Missing Credentials');
    process.exit(1);
}

interface Template {
    name: string;
    body: any;
}

const templates: Template[] = [
    {
        name: 'discreetkit_main_menu',
        body: {
            friendly_name: 'discreetkit_main_menu',
            language: 'en',
            variables: {},
            types: {
                'twilio/list-picker': {
                    body: 'Your privacy is our priority. How can we help you today?',
                    button: 'Options',
                    items: [
                        { item: 'Shop Products', id: 'shop_all', description: 'Browse our collection' },
                        { item: 'Partner Care', id: 'partner_care', description: 'Services for partners' },
                        { item: 'Track Order', id: 'track_order', description: 'Check status' },
                        { item: 'FAQ & Help', id: 'faq', description: 'Common questions' }
                    ]
                }
            }
        }
    },
    {
        name: 'discreetkit_partner_care',
        body: {
            friendly_name: 'discreetkit_partner_care',
            language: 'en',
            variables: {},
            types: {
                'twilio/list-picker': {
                    body: 'Partner Care 🏥\nExclusive services for our partners.\n\n*Marie Stopes Ghana*',
                    button: 'Select Service',
                    items: [
                        { item: 'Verify Code', id: 'care_verify', description: 'Unlock services' },
                        { item: 'Find Clinic', id: 'care_clinic', description: 'Get directions' },
                        { item: 'Counselor Hotline', id: 'care_speak', description: 'Talk to a pro' }
                    ]
                }
            }
        }
    }
];

function createTemplate(tmpl: Template): Promise<{ name: string, sid: string } | null> {
    return new Promise((resolve) => {
        const data = JSON.stringify(tmpl.body);
        const options = {
            hostname: 'content.twilio.com',
            path: '/v1/Content',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length,
                'Authorization': 'Basic ' + Buffer.from(SID + ':' + TOKEN).toString('base64')
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', d => body += d);
            res.on('end', () => {
                if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                    const json = JSON.parse(body);
                    console.log(`CREATED ${tmpl.name}: ${json.sid}`);
                    resolve({ name: tmpl.name, sid: json.sid });
                } else {
                    console.error(`FAILED ${tmpl.name}: ${body}`);
                    resolve(null);
                }
            });
        });

        req.on('error', (e) => {
            console.error(e);
            resolve(null);
        });

        req.write(data);
        req.end();
    });
}

async function main() {
    const results = [];
    for (const t of templates) {
        results.push(await createTemplate(t));
    }
    // Print JSON of results for easy parsing
    console.log('RESULTS_JSON:', JSON.stringify(results.filter(r => r !== null)));
}

main();
