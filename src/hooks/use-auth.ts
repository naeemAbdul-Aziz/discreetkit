/**
 * @file use-auth.ts
 * @description A client-side hook to check the user's authentication status.
 *              This is used to prevent flashing of protected content before
 *              the middleware has a chance to redirect.
 */
import { useState, useEffect } from 'react';
import { checkSession } from '@/lib/actions';
import { usePathname } from 'next/navigation';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // Don't run the check on the login page itself
    if (pathname === '/admin/login') {
      setIsLoading(false);
      setIsAuthenticated(false);
      return;
    }

    async function verifySession() {
      const { isAuthenticated } = await checkSession();
      setIsAuthenticated(isAuthenticated);
      setIsLoading(false);
    }

    verifySession();
  }, [pathname]);

  return { isAuthenticated, isLoading };
}
