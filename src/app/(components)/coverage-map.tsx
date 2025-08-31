
'use client';

import Image from 'next/image';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const MAP_STYLE = 'light-v11'; 

// Lng,Lat for key locations
const locations = {
  accra: [-0.1870, 5.6037],
  kumasi: [-1.6244, 6.6886],
  capeCoast: [-1.2466, 5.1053],
  legon: [-0.1876, 5.6507],
  upsa: [-0.1850, 5.6400],
  gimpa: [-0.2458, 5.6264],
};

const buildMapUrl = () => {
    // Custom markers: pin-s-building for cities (primary color), pin-s-college for campuses (accent color)
    const cityMarkerColor = '200,85,45'.replace('%','').replace(' ',','); // HSL from CSS var --primary
    const campusMarkerColor = '30,90,55'.replace('%','').replace(' ',','); // HSL from CSS var --accent
    
    const cityMarker = `pin-s-building+2a9d8f(${locations.accra.join(',')})`;
    const kumasiMarker = `pin-s-building+2a9d8f(${locations.kumasi.join(',')})`;
    const capeCoastMarker = `pin-s-building+2a9d8f(${locations.capeCoast.join(',')})`;
    const legonMarker = `pin-s-college+f5a623(${locations.legon.join(',')})`;
    const upsaMarker = `pin-s-college+f5a623(${locations.upsa.join(',')})`;
    const gimpaMarker = `pin-s-college+f5a623(${locations.gimpa.join(',')})`;

    const overlays = [cityMarker, kumasiMarker, capeCoastMarker, legonMarker, upsaMarker, gimpaMarker].join(',');
    
    // Center the map over Ghana
    const centerLon = -1.0232;
    const centerLat = 7.5;
    const zoom = 5.8;
    const width = 1280;
    const height = 720;
    
    return `https://api.mapbox.com/styles/v1/mapbox/${MAP_STYLE}/static/${overlays}/${centerLon},${centerLat},${zoom}/${width}x${height}@2x?access_token=${MAPBOX_TOKEN}`;
}

export function CoverageMap() {
  const mapUrl = buildMapUrl();

  return (
    <section className="bg-background py-12 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center">
          <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
            Serving You Across Ghana
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-base text-muted-foreground md:text-lg">
            Discreet delivery and trusted pharmacy pickups, right where you are. We’re growing fast — here’s where you’ll find us today.
          </p>
        </div>

        <div className="mt-12">
           <div className="relative w-full max-w-5xl mx-auto aspect-video overflow-hidden rounded-2xl shadow-xl border">
             <Image 
                src={mapUrl}
                alt="Map of Ghana showing DiscreetKit delivery locations including Accra, Kumasi, and Cape Coast"
                fill
                className="object-cover"
                data-ai-hint="ghana map"
             />
           </div>
        </div>
      </div>
    </section>
  );
}
