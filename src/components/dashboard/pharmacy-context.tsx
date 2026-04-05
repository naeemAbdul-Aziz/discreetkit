"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";

interface Pharmacy {
  id: number;
  name: string;
  is_partner_hub: boolean;
  partner_code: string;
}

interface PharmacyContextType {
  pharmacy: Pharmacy | null;
  loading: boolean;
  isHub: boolean;
}

const PharmacyContext = createContext<PharmacyContextType>({
  pharmacy: null,
  loading: true,
  isHub: false,
});

export function PharmacyProvider({ children }: { children: React.ReactNode }) {
  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPharmacy() {
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data } = await supabase
          .from("pharmacies")
          .select("id, name, is_partner_hub, partner_code")
          .eq("user_id", user.id)
          .single();
        
        if (data) {
          setPharmacy(data);
        }
      }
      setLoading(false);
    }

    loadPharmacy();
  }, []);

  return (
    <PharmacyContext.Provider value={{ pharmacy, loading, isHub: !!pharmacy?.is_partner_hub }}>
      {children}
    </PharmacyContext.Provider>
  );
}

export const usePharmacy = () => useContext(PharmacyContext);
