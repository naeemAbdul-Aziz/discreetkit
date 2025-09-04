
import { CheckCircle } from 'lucide-react';
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
    const primaryColor = '200,85,45'.replace(/%/g, '').replace(/ /g, ','); // Vibrant Ocean Blue
    const accentColor = '30,90,55'.replace(/%/g, '').replace(/ /g, ','); // Energetic Sunset Orange
    
    const cityMarker = `pin-s-building+hsl(${primaryColor})(${locations.accra.join(',')})`;
    const kumasiMarker = `pin-s-building+hsl(${primaryColor})(${locations.kumasi.join(',')})`;
    const capeCoastMarker = `pin-s-building+hsl(${primaryColor})(${locations.capeCoast.join(',')})`;
    const legonMarker = `pin-s-college+hsl(${accentColor})(${locations.legon.join(',')})`;
    const upsaMarker = `pin-s-college+hsl(${accentColor})(${locations.upsa.join(',')})`;
    const gimpaMarker = `pin-s-college+hsl(${accentColor})(${locations.gimpa.join(',')})`;

    const overlays = [cityMarker, kumasiMarker, capeCoastMarker, legonMarker, upsaMarker, gimpaMarker].join(',');
    
    // Center the map over Ghana
    const centerLon = -1.0232;
    const centerLat = 7.5;
    const zoom = 5.8;
    const width = 1280;
    const height = 720;
    
    if (!MAPBOX_TOKEN) {
        return "https://picsum.photos/1280/720";
    }

    return `https://api.mapbox.com/styles/v1/mapbox/${MAP_STYLE}/static/${overlays}/${centerLon},${centerLat},${zoom}/${width}x${height}@2x?access_token=${MAPBOX_TOKEN}`;
}

const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#f0f0f0" offset="20%" />
      <stop stop-color="#e0e0e0" offset="50%" />
      <stop stop-color="#f0f0f0" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#f0f0f0" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str);


export function CoverageMap() {
  const mapUrl = buildMapUrl();

  return (
    <section className="bg-background py-12 md:py-24">
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
                placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(1280, 720))}`}
             />
             <div className="absolute inset-x-0 bottom-4 flex justify-center">
                 <div className="flex items-center gap-2 rounded-full bg-background/80 p-2 pl-3 pr-4 text-sm font-medium text-foreground shadow-lg backdrop-blur-sm">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <p>Now delivering across Ghana</p>
                 </div>
             </div>
           </div>
        </div>
      </div>
    </section>
  );
}
