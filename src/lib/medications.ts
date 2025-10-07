import type { Product } from './data';

export const medications: Product[] = [
    {
        id: 101,
        name: 'Tenofovir/Lamivudine/Dolutegravir (TLD) - 30 Day Supply',
        description: 'A complete, one-pill-a-day HIV treatment regimen. This is a 30-day refill.',
        price_ghs: 350.00,
        student_price_ghs: null,
        image_url: 'https://images.unsplash.com/photo-1628771065518-1d82f193d4d0?q=80&w=800&fit=crop',
        brand: 'Generic',
        featured: false,
        category: 'Medication',
    },
    {
        id: 102,
        name: 'Tenofovir/Lamivudine/Dolutegravir (TLD) - 90 Day Supply',
        description: 'A 90-day supply of the complete one-pill-a-day HIV treatment regimen for long-term convenience.',
        price_ghs: 950.00,
        student_price_ghs: null,
        image_url: 'https://images.unsplash.com/photo-1628771065518-1d82f193d4d0?q=80&w=800&fit=crop',
        brand: 'Generic',
        featured: false,
        category: 'Medication',
        savings_ghs: 100.00,
    },
     {
        id: 103,
        name: 'Pre-Exposure Prophylaxis (PrEP) - 30 Day Supply',
        description: 'A 30-day supply of daily oral PrEP for HIV prevention. Requires a valid prescription.',
        price_ghs: 300.00,
        student_price_ghs: null,
        image_url: 'https://images.unsplash.com/photo-1628771065518-1d82f193d4d0?q=80&w=800&fit=crop',
        brand: 'Generic',
        featured: false,
        category: 'Medication',
    },
];

    