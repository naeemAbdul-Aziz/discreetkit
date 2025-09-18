import { getSupabaseClient } from '@/lib/supabase';
import { PartnerCareHeader } from './(components)/partner-care-header';
import { HospitalCard } from './(components)/hospital-card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Revalidate data every 60 seconds

async function getHospitals() {
    const supabase = getSupabaseClient();
    const { data: hospitals, error } = await supabase
      .from('hospitals')
      .select('id, name, logo_url, location, services, contact, is_preferred')
      .order('is_preferred', { ascending: false })
      .order('name', { ascending: true });

    if (error) {
        console.error("Error fetching hospitals:", error);
        throw new Error("Could not fetch partner information. Please try again later.");
    }
    return hospitals;
}

export default async function PartnerCarePage() {
  let hospitals = [];
  let fetchError: string | null = null;

  try {
    hospitals = await getHospitals();
  } catch (error: any) {
    fetchError = error.message;
  }

  return (
    <div className="bg-muted">
      <div className="container mx-auto max-w-5xl px-4 py-12 md:px-6 md:py-24">
        
        <PartnerCareHeader />

        {fetchError && (
          <Alert variant="destructive" className="my-8">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{fetchError}</AlertDescription>
          </Alert>
        )}

        {!fetchError && (
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {hospitals.map((hospital) => (
              <HospitalCard key={hospital.id} hospital={hospital} />
            ))}
          </div>
        )}
        
        {hospitals.length === 0 && !fetchError && (
             <div className="text-center py-16">
                <p className="text-muted-foreground">No partner hospitals are listed at this time. Please check back later.</p>
            </div>
        )}
      </div>
    </div>
  );
}
