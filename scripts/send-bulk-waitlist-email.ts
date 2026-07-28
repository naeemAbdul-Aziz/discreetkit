import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';
const resendApiKey = process.env.RESEND_API_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('CRITICAL: Supabase credentials missing from environment.');
    process.exit(1);
}

if (!resendApiKey) {
    console.error('CRITICAL: Resend API Key is missing from environment.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = new Resend(resendApiKey);

// Check for command-line arguments
const isDryRun = !process.argv.includes('--send') && !process.argv.includes('--test');
const testArgIndex = process.argv.indexOf('--test');
const testRecipient = testArgIndex !== -1 ? process.argv[testArgIndex + 1] : null;

async function main() {
    console.log('--------------------------------------------------');
    console.log('DISCREETKIT: Bulk Waitlist Email Broadcaster');
    if (testRecipient) {
        console.log(`Execution Mode: TEST SEND (to ${testRecipient})`);
    } else {
        console.log(`Execution Mode: ${isDryRun ? 'DRY-RUN (Simulated)' : 'LIVE (Sending Emails)'}`);
    }
    console.log('--------------------------------------------------');

    if (testRecipient) {
        console.log(`Sending test email to: ${testRecipient}...`);
        try {
            const response = await resend.emails.send({
                from: 'DiscreetKit <hello@discreetkit.com>',
                to: testRecipient,
                subject: "Thank you for your support! We'll be live soon.",
                html: getEmailTemplate(testRecipient)
            });

            if (response.error) {
                console.error(`  [FAILED] Resend error:`, response.error);
            } else {
                console.log(`  [SUCCESS] Test email sent successfully! ID: ${response.data?.id}`);
            }
        } catch (err: any) {
            console.error(`  [FAILED] Error:`, err.message || err);
        }
        return;
    }

    // Use the exact list of customer emails provided by the user (with typos fixed)
    const emails = [
        'naeemabdulaziz202@gmail.com',
        'marthadarko36@gmail.com',
        'patienceasiedua18@gmail.com',
        'flavioahiale74@gmail.com',
        'maamekoufie@gmail.com',
        'otoosandra1724@gmail.com',
        'theresaakamise044@gmail.com', // Normalized gmial.com
        'nakyeamaah@gmail.com',
        'akintolureayomide625@gmail.com',
        'basedkwame@gmail.com',
        'akplorpaulsp@gmail.com'
    ];

    console.log(`Found ${emails.length} unique customer emails:`);
    emails.forEach((email, idx) => {
        console.log(`  ${idx + 1}. ${email}`);
    });

    if (isDryRun) {
        console.log('\n[DRY RUN] Simulating email template construction...');
        const sampleEmail = emails[0] || 'customer@gmail.com';
        const htmlContent = getEmailTemplate(sampleEmail);
        console.log('--------------------------------------------------');
        console.log(`Subject: Thank you for your support! We'll be live soon.`);
        console.log(`Sample Body Preview (first 15 lines):`);
        console.log(htmlContent.split('\n').slice(0, 15).join('\n'));
        console.log('...\n[DRY RUN] Complete. Run this script with "--send" to send emails.');
        console.log('--------------------------------------------------');
        return;
    }

    console.log(`\nStarting live broadcast to ${emails.length} recipients...`);
    let successCount = 0;
    let failCount = 0;

    for (const email of emails) {
        try {
            console.log(`Sending to: ${email}...`);
            const response = await resend.emails.send({
                from: 'DiscreetKit <hello@discreetkit.com>',
                to: email,
                subject: "Thank you for your support! We'll be live soon.",
                html: getEmailTemplate(email)
            });

            if (response.error) {
                console.error(`  [FAILED] Resend error for ${email}:`, response.error);
                failCount++;
            } else {
                console.log(`  [SUCCESS] Email sent successfully.`);
                successCount++;
            }
        } catch (err: any) {
            console.error(`  [FAILED] Error for ${email}:`, err.message || err);
            failCount++;
        }
        // Small delay to respect rate limit
        await new Promise(resolve => setTimeout(resolve, 300));
    }

    console.log('--------------------------------------------------');
    console.log('BROADCAST REPORT');
    console.log(`- Total unique recipients: ${emails.length}`);
    console.log(`- Successfully sent: ${successCount}`);
    console.log(`- Failed: ${failCount}`);
    console.log('--------------------------------------------------');
}

function getEmailTemplate(email: string) {
    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155; margin: 0; padding: 0; background-color: #fafafa; -webkit-font-smoothing: antialiased; }
      .container { max-width: 520px; margin: 40px auto; padding: 40px; background: #ffffff; border-radius: 20px; border: 1px solid #eaeaea; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.01); }
      .logo { font-size: 24px; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 28px; }
      .title { font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.02em; line-height: 1.3; margin-bottom: 16px; }
      .paragraph { font-size: 14px; font-weight: 500; color: #64748b; line-height: 1.65; margin-bottom: 20px; }
      .btn { display: inline-flex; align-items: center; justify-content: center; padding: 14px 28px; background-color: #0d9488; color: #ffffff !important; text-decoration: none; border-radius: 14px; font-size: 13px; font-weight: 700; letter-spacing: -0.01em; margin-top: 16px; margin-bottom: 24px; text-align: center; box-shadow: 0 10px 20px rgba(13, 148, 136, 0.15); }
      .btn:hover { background-color: #0f766e; }
      .footer { border-top: 1px solid #f1f5f9; padding-top: 24px; margin-top: 32px; font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; tracking: 0.05em; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="logo">
        <span style="color: #0f172a;">Discreet</span><span style="color: #0d9488;">Kit</span><span style="color: #0d9488;">.</span>
      </div>
      <h1 class="title">Thank you for your order! We'll be live soon.</h1>
      <p class="paragraph">
        Hello,
      </p>
      <p class="paragraph">
        We noticed you recently placed an order on DiscreetKit. First of all, we want to say a huge thank you for your support and trust!
      </p>
      <p class="paragraph">
        Please note that our store is not fully live yet, and we are currently setting up operations. Because of this, orders are not going out just yet, but we are working hard behind the scenes to launch very soon.
      </p>
      <p class="paragraph">
        In the meantime, we would love to hear your thoughts and suggestions. You can submit them directly via our waitlist portal:
      </p>
      <div style="text-align: center;">
        <a href="https://access.discreetkit.com" class="btn" style="color: #ffffff;">Access the Waitlist</a>
      </div>
      <p class="paragraph">
        We will notify you immediately via email as soon as we officially launch and go live. Thank you once again for your patience and for being part of our journey.
      </p>
      <div class="footer">
        DiscreetKit Support &bull; Accra, Ghana
      </div>
    </div>
  </body>
</html>`;
}

main().catch(err => {
    console.error('Fatal error running broadcaster script:', err);
    process.exit(1);
});
