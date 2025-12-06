/**
 * Utility function to automatically link pharmacy users to pharmacies
 * Can be used in signup flows, admin user creation, etc.
 */

import { SupabaseClient } from '@supabase/supabase-js'

export interface AutoLinkResult {
    success: boolean
    pharmacyId?: number
    pharmacyName?: string
    message: string
}

/**
 * Automatically link a pharmacy user to a pharmacy based on email pattern
 * 
 * @param supabase - Supabase client with service role permissions
 * @param userId - The user ID to link
 * @param email - The user's email address
 * @returns Result object with success status and details
 * 
 * @example
 * ```typescript
 * const result = await autoLinkPharmacyUser(supabase, userId, 'beybeepharmacy@gmail.com')
 * if (result.success) {
 *   console.log(`Linked to ${result.pharmacyName}`)
 * }
 * ```
 */
export async function autoLinkPharmacyUser(
    supabase: SupabaseClient,
    userId: string,
    email: string
): Promise<AutoLinkResult> {
    try {
        // Extract potential pharmacy name from email (before @)
        const emailPrefix = email.split('@')[0].toLowerCase()

        // Remove common suffixes like "pharmacy", "pharm", "rx"
        const searchTerm = emailPrefix
            .replace(/pharmacy|pharm|rx/gi, '')
            .trim()

        if (!searchTerm || searchTerm.length < 3) {
            return {
                success: false,
                message: 'Cannot auto-link: no identifiable pharmacy name in email'
            }
        }

        // Search for pharmacy with similar name
        const { data: pharmacies, error } = await supabase
            .from('pharmacies')
            .select('id, name, user_id')
            .or(`name.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`)

        if (error) {
            return {
                success: false,
                message: `Database error: ${error.message}`
            }
        }

        if (!pharmacies || pharmacies.length === 0) {
            return {
                success: false,
                message: `No pharmacy found matching "${searchTerm}"`
            }
        }

        // Prioritize unlinked pharmacies, then exact name matches
        const targetPharmacy =
            pharmacies.find(p => !p.user_id && p.name.toLowerCase().includes(searchTerm)) ||
            pharmacies.find(p => !p.user_id) ||
            pharmacies[0]

        // Check if already linked
        if (targetPharmacy.user_id === userId) {
            return {
                success: true,
                pharmacyId: targetPharmacy.id,
                pharmacyName: targetPharmacy.name,
                message: `Already linked to "${targetPharmacy.name}"`
            }
        }

        // Check if linked to another user
        if (targetPharmacy.user_id) {
            return {
                success: false,
                message: `Pharmacy "${targetPharmacy.name}" is already linked to another user`
            }
        }

        // Link the pharmacy
        const { error: updateError } = await supabase
            .from('pharmacies')
            .update({ user_id: userId })
            .eq('id', targetPharmacy.id)

        if (updateError) {
            return {
                success: false,
                message: `Failed to link: ${updateError.message}`
            }
        }

        return {
            success: true,
            pharmacyId: targetPharmacy.id,
            pharmacyName: targetPharmacy.name,
            message: `Successfully linked to "${targetPharmacy.name}"`
        }
    } catch (err: any) {
        return {
            success: false,
            message: `Unexpected error: ${err.message || 'Unknown error'}`
        }
    }
}

/**
 * Link a pharmacy user to a specific pharmacy by pharmacy ID
 * 
 * @param supabase - Supabase client with service role permissions
 * @param userId - The user ID to link
 * @param pharmacyId - The pharmacy ID to link to
 * @returns Result object with success status
 */
export async function linkPharmacyUserById(
    supabase: SupabaseClient,
    userId: string,
    pharmacyId: number
): Promise<AutoLinkResult> {
    try {
        // Get pharmacy details
        const { data: pharmacy, error: fetchError } = await supabase
            .from('pharmacies')
            .select('id, name, user_id')
            .eq('id', pharmacyId)
            .single()

        if (fetchError || !pharmacy) {
            return {
                success: false,
                message: `Pharmacy not found (ID: ${pharmacyId})`
            }
        }

        // Check if already linked
        if (pharmacy.user_id === userId) {
            return {
                success: true,
                pharmacyId: pharmacy.id,
                pharmacyName: pharmacy.name,
                message: `Already linked to "${pharmacy.name}"`
            }
        }

        // Check if linked to another user
        if (pharmacy.user_id) {
            return {
                success: false,
                message: `Pharmacy "${pharmacy.name}" is already linked to another user`
            }
        }

        // Link the pharmacy
        const { error: updateError } = await supabase
            .from('pharmacies')
            .update({ user_id: userId })
            .eq('id', pharmacyId)

        if (updateError) {
            return {
                success: false,
                message: `Failed to link: ${updateError.message}`
            }
        }

        return {
            success: true,
            pharmacyId: pharmacy.id,
            pharmacyName: pharmacy.name,
            message: `Successfully linked to "${pharmacy.name}"`
        }
    } catch (err: any) {
        return {
            success: false,
            message: `Unexpected error: ${err.message || 'Unknown error'}`
        }
    }
}
