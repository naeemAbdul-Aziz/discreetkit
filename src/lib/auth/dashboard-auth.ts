/**
 * @file src/lib/auth/dashboard-auth.ts
 * @description Server and client-side role validation utilities for dashboard access
 */

import { createSupabaseServerClient } from '@/lib/supabase';
import { getUserRoles } from '@/lib/supabase';
import { redirect } from 'next/navigation';

// Server-side role validation for page components
export async function requireRole(requiredRole: string | string[]) {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    redirect('/login');
  }
  
  const userRoles = await getUserRoles(supabase, user.id);
  const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  
  const hasAccess = requiredRoles.some(role => userRoles.includes(role));
  
  if (!hasAccess) {
    redirect('/unauthorized');
  }
  
  return { user, roles: userRoles };
}

// Server-side admin validation
export async function requireAdmin() {
  return requireRole('admin');
}

// Server-side pharmacy validation  
export async function requirePharmacy() {
  return requireRole('pharmacy');
}

// Get current user with roles (doesn't redirect, for conditional rendering)
export async function getCurrentUserWithRoles() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return { user: null, roles: [] };
    }
    
    const userRoles = await getUserRoles(supabase, user.id);
    return { user, roles: userRoles };
  } catch (error) {
    console.error('[getCurrentUserWithRoles] Error:', error);
    return { user: null, roles: [] };
  }
}

// Client-side hook for role checking
export function useUserRoles() {
  // This would typically use a context or SWR/TanStack Query
  // For now, we'll implement a simple client-side check
  return {
    isAdmin: false, // Will be implemented with client-side state
    isPharmacy: false,
    loading: false
  };
}