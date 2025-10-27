/**
 * @file session.ts
 * @description Manages encrypted session cookies for admin authentication using 'jose'.
 */
import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const secretKey = process.env.SESSION_SECRET;
const key = new TextEncoder().encode(secretKey);

// Encrypts the session payload (e.g., user email) into a JWT.
export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h') // Session expires in 2 hours
    .sign(key);
}

// Decrypts the session cookie and verifies its integrity.
export async function decrypt(input: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    // This will catch expired tokens or invalid signatures
    return null;
  }
}

// Creates the session cookie after successful login.
export async function login(payload: { email: string }) {
  // Create the session
  const expires = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
  const session = await encrypt({ payload, expires });

  // Save the session in a cookie
  cookies().set('session', session, { expires, httpOnly: true });
}

// Deletes the session cookie upon logout.
export async function logout() {
  cookies().set('session', '', { expires: new Date(0) });
}

// Retrieves and verifies the current session from the cookie.
export async function getSession() {
  const session = cookies().get('session')?.value;
  if (!session) return null;
  
  const decryptedSession = await decrypt(session);
  if (!decryptedSession) return null;

  // Check if the session has expired
  if (new Date(decryptedSession.expires) < new Date()) {
      return null;
  }

  return decryptedSession.payload;
}
