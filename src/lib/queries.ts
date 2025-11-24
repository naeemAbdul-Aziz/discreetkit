import { createSupabaseServerClient } from "@/lib/supabase"

export async function fetchStoreSettings() {
    try {
        const supabase = await createSupabaseServerClient()
        const { data, error } = await supabase
            .from('store_settings')
            .select('*')
            .single()

        if (error) {
            console.error('Error fetching settings:', error)
            return null
        }
        return data
    } catch (error) {
        console.error('Exception in fetchStoreSettings:', error)
        return null
    }
}
