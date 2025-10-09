/**
 * @file actions.ts
 * @description Server actions for the admin login page.
 */
'use server';

import { cookies } from 'next/headers';
import { encrypt } from '@/lib/session';

// Logs in a user by creating a session.
export async function login(prevState: { error: string } | undefined, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // Simple validation
  if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
    return { error: 'Invalid credentials. Please try again.' };
  }

  // Create the session
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // Expires in 24 hours
  const session = await encrypt({ user: { email }, expires });

  // Save the session in a cookie
  cookies().set('session', session, { expires, httpOnly: true });
  
  // Redirect to dashboard (will be handled by middleware)
  return {};
}
