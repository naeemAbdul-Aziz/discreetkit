import type { SupabaseClient } from '@supabase/supabase-js'

// Fetch role names for a user. Returns empty array if none or error.
export async function getUserRoles(supabase: SupabaseClient, userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('roles(name)')
    .eq('user_id', userId)

  if (error) {
    console.error('[getUserRoles] Error fetching roles:', error)
    return []
  }
  if (!data) return []
  // Each row has a nested roles object with name
  return data.map((r: any) => r.roles?.name).filter(Boolean)
}
