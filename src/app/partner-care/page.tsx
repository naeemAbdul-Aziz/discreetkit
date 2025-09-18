

import { partners } from '@/lib/data';
import { PartnerCareHeader } from './(components)/partner-care-header';
import { HospitalCard } from './(components)/hospital-card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function PartnerCarePage() {

  return (
    <div className="bg-muted">
      <div className="container mx-auto max-w-5xl px-4 py-12 md:px-6 md:py-24">
        
        <PartnerCareHeader />

        {partners.length > 0 ? (
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {partners.map((hospital) => (
              <HospitalCard key={hospital.id} hospital={hospital} />
            ))}
          </div>
        ) : (
            <div className="text-center py-16">
                <p className="text-muted-foreground">No partner hospitals are listed at this time. Please check back later.</p>
            </div>
        )}
      </div>
    </div>
  );
}
