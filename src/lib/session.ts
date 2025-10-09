import 'server-only';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { type NextRequest, NextResponse } from 'next/server';

const secretKey = process.env.SESSION_SECRET;
const key = new TextEncoder().encode(secretKey);

// Encrypts a session payload.
export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d') // Session expires in 1 day
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
    // This will handle expired tokens or invalid tokens
    return null;
  }
}

// Logs out a user by deleting the session.
export async function logout() {
  cookies().set('session', '', { expires: new Date(0) });
}

// Retrieves the current session from the cookie.
export async function getSession() {
  const session = cookies().get('session')?.value;
  if (!session) return null;
  return await decrypt(session);
}

// Refreshes the session expiration time on each request.
export async function updateSession(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  if (!session) return NextResponse.next();

  // Refresh the session so it doesn't expire during active use
  const parsed = await decrypt(session);
  if (!parsed) {
    // If the session is invalid, clear the cookie and proceed.
    const response = NextResponse.next();
    response.cookies.set('session', '', { expires: new Date(0) });
    return response;
  }
  
  parsed.expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
  const res = NextResponse.next();
  res.cookies.set({
    name: 'session',
    value: await encrypt(parsed),
    httpOnly: true,
    expires: parsed.expires,
  });
  return res;
}
