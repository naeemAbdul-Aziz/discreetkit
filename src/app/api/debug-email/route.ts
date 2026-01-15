
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend directly here to ensure no library issues
const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const targetEmail = searchParams.get('email');
    const secret = searchParams.get('secret');

    // Simple security to prevent public spamming if discovered
    if (secret !== 'discreet-debug-123') {
        return NextResponse.json({ 
            success: false, 
            message: 'Unauthorized. Add ?secret=discreet-debug-123 to your URL.' 
        }, { status: 401 });
    }

    // 1. Check Env Var
    const apiKey = process.env.RESEND_API_KEY;
    const isKeySet = !!apiKey;
    const keyPrefix = apiKey ? apiKey.substring(0, 4) + '...' : 'NONE';

    if (!targetEmail) {
        return NextResponse.json({ 
            success: false, 
            info: {
                envVarSet: isKeySet,
                keyPrefix: keyPrefix,
                message: 'Provide ?email=... to test sending.'
            } 
        });
    }

    // 2. Attempt Send
    const { data, error } = await resend.emails.send({
      from: 'DiscreetKit <hello@discreetkit.com>',
      to: targetEmail,
      subject: 'Production Debug Email',
      html: '<p>If you see this, Resend is working on Production!</p>'
    });

    if (error) {
        return NextResponse.json({ 
            success: false, 
            stage: 'sending',
            error: error 
        }, { status: 500 });
    }

    return NextResponse.json({ 
        success: true, 
        message: 'Email sent successfully via Resend API.',
        data: data,
        debugInfo: {
            envVarSet: isKeySet,
            keyPrefix: keyPrefix
        }
    });

  } catch (error: any) {
    return NextResponse.json({ 
        success: false, 
        stage: 'unexpected_error',
        error: error.message,
        stack: error.stack
    }, { status: 500 });
  }
}
