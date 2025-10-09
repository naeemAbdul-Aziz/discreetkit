/**
 * @file use-auth.ts
 * @description A client-side hook to check the user's authentication status.
 *              This is used to prevent flashing of protected content before
 *              the middleware has a chance to redirect.
 */
import { useState, useEffect } from 'react';
import { checkSession } from '@/lib/actions';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function verifySession() {
      const { isAuthenticated } = await checkSession();
      setIsAuthenticated(isAuthenticated);
      setIsLoading(false);
    }

    verifySession();
  }, []);

  return { isAuthenticated, isLoading };
}
