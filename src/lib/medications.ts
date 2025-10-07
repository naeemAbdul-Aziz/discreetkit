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
        usage_instructions: [
            "Take one tablet orally, once daily.",
            "Can be taken with or without food.",
            "It is important to take your medication at the same time each day to maintain consistent levels in your blood.",
            "Do not miss or skip doses. If you miss a dose, take it as soon as you remember. If it's close to your next dose, skip the missed dose and continue your regular schedule."
        ],
        in_the_box: ["30 Tablets (30-Day Supply)"],
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
        usage_instructions: [
            "Take one tablet orally, once daily.",
            "Can be taken with or without food.",
            "It is important to take your medication at the same time each day.",
            "This 90-day supply helps ensure you do not run out of medication."
        ],
        in_the_box: ["90 Tablets (90-Day Supply)"],
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
        usage_instructions: [
            "Take one tablet orally, once daily, to prevent HIV.",
            "PrEP is most effective when taken consistently every day.",
            "PrEP does not protect against other sexually transmitted infections (STIs).",
            "Regular check-ups and testing with your healthcare provider are required while on PrEP."
        ],
        in_the_box: ["30 Tablets (30-Day Supply)"],
    },
];

    

    