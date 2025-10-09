import 'server-only';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { type NextRequest, NextResponse } from 'next/server';

const secretKey = process.env.SESSION_SECRET || 'your-super-secret-key-that-is-at-least-32-bytes-long';
const key = new TextEncoder().encode(secretKey);

// Encrypts a session payload with a 30-day expiration.
export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d') // Set a 30-day expiration time
    .sign(key);
}

// Decrypts a session payload.
export async function decrypt(input: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    // This will handle expired tokens or invalid tokens by returning null.
    console.log('Failed to verify session:', error);
    return null;
  }
}

// Retrieves the current session from the cookie.
export async function getSession() {
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) return null;
  return await decrypt(sessionCookie);
}

// Updates and refreshes the session cookie on each request.
export async function updateSession(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')?.value;
  if (!sessionCookie) {
    return NextResponse.next();
  }

  // Refresh the session so it doesn't expire during active use.
  const parsed = await decrypt(sessionCookie);
  if (!parsed) {
    // If the session is invalid (e.g., expired), clear the cookie and proceed.
    const response = NextResponse.next();
    response.cookies.set('session', '', { httpOnly: true, expires: new Date(0) });
    return response;
  }
  
  // Re-encrypt the session and extend its validity.
  const response = NextResponse.next();
  response.cookies.set({
    name: 'session',
    value: await encrypt(parsed),
    httpOnly: true,
  });

  return response;
}
