
import { NextResponse } from 'next/server';
import { sendCustomerOrderConfirmation } from '@/lib/email-service';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email') || 'test@example.com';
    
    console.log('Testing email send to:', email);

    const result = await sendCustomerOrderConfirmation({
      email,
      code: 'TEST-ORDER-123',
      totalPrice: 150.00,
      deliveryArea: 'Legon Campus',
      items: [
        { name: 'Test Item 1', quantity: 1, price_ghs: 50 },
        { name: 'Test Item 2', quantity: 2, price_ghs: 50 },
      ]
    });

    if (result.success) {
      return NextResponse.json({ success: true, message: 'Email queued/sent', id: result.emailId });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
