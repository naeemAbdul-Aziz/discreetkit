
import { Package, ShoppingCart, Truck, CheckCircle, ShieldCheck, HeartHandshake, Zap, Award, Users, TestTube, Droplet, FileText, FlaskConical, Plus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CartItem } from "@/hooks/use-cart";

export type Product = {
    id: number;
    name: string;
    description: string;
    priceGHS: number;
    studentPriceGHS?: number;
    imageUrl: string;
    featured?: boolean;
}

export type Order = {
    id: string;
    code: string;
    status: 'pending_payment' | 'received' | 'processing' | 'out_for_delivery' | 'completed';
    items: CartItem[];
    deliveryArea: string;
    deliveryAddressNote: string | null;
    isStudent: boolean;
    subtotal: number;
    studentDiscount: number;
    deliveryFee: number;
    totalPrice: number;
    events: {
        status: string;
        note: string;
        date: Date;
    }[];
}

export type Step = {
    number: number;
    title: string;
    description: string;
    icon: LucideIcon;
    details: string[];
    imageUrl: string;
    imageHint: string;
};

export type FaqItem = {
    question: string;
    answer: string;
};

export type Testimonial = {
    quote: string;
    name: string;
    role: string;
    avatar: string;
};

export type Partner = {
    id: number;
    name: string;
    logoUrl: string;
};

export type ProductBenefit = {
    icon: LucideIcon;
    title: string;
};

export type DiscountLocation = {
    id: number;
    campus: string;
}

export const DELIVERY_FEES = {
    standard: 20.00,
    campus: 10.00,
};

export const generateTrackingCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 9; i++) {
    if (i > 0 && i % 3 === 0) {
      result += '-';
    }
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};


export const products: Product[] = [
    {
        id: 1,
        name: 'Standard HIV Kit',
        description: 'A single-use, private HIV self-test kit. It is WHO-approved for 99% accuracy.',
        priceGHS: 75.00,
        studentPriceGHS: 65.00,
        imageUrl: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1756312643/hiv-kit_p18jif.png',
        featured: true,
    },
    {
        id: 2,
        name: 'Pregnancy Test Kit',
        description: 'A reliable, easy-to-use pregnancy test for fast and private results.',
        priceGHS: 45.00,
        studentPriceGHS: 35.00,
        imageUrl: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1756312643/preg-kit_d5xpyb.png',
        featured: true,
    },
    {
        id: 3,
        name: 'Support Bundle (Couple)',
        description: 'Contains two HIV self-test kits. Encourages testing together for mutual support.',
        priceGHS: 140.00,
        imageUrl: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1756312643/couple-kit_h3h1gc.png',
        featured: true,
    },
    {
        id: 4,
        name: 'Postpill (Emergency Contraception)',
        description: 'A single dose of emergency contraception to be taken after unprotected intercourse.',
        priceGHS: 90.00,
        studentPriceGHS: 80.00,
        imageUrl: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1758178128/discreetkit-postpill_gbtfsv.png',
        featured: true,
    },
    {
        id: 5,
        name: 'Premium Condom Pack',
        description: 'A 12-pack of ultra-thin, lubricated latex condoms for safety and comfort.',
        priceGHS: 50.00,
        studentPriceGHS: 40.00,
        imageUrl: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1758178128/discreetkit-condoms_wndg8h.png',
    },
    {
        id: 6,
        name: 'Aqua-based Personal Lubricant',
        description: 'A gentle, water-based lubricant for enhanced comfort. Safe to use with condoms.',
        priceGHS: 60.00,
        imageUrl: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1758178128/discreetkit-lube_uiojpr.png',
    },
    {
        id: 7,
        name: 'Weekend Ready Bundle',
        description: 'Includes a 12-pack of condoms and a personal lubricant for complete preparation.',
        priceGHS: 100.00,
        imageUrl: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1758178129/discreetkit-weekend-bundle_rq5smu.png',
    },
    {
        id: 8,
        name: 'Complete Peace of Mind Bundle',
        description: 'Contains 1 HIV Kit, 1 Pregnancy Test, and 1 Postpill. Your all-in-one pack.',
        priceGHS: 200.00,
        studentPriceGHS: 170.00,
        imageUrl: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1758178129/discreetkit-peace-of-mind-bundle_gftmqa.png',
    }
];

export const discounts: DiscountLocation[] = [
    { id: 1, campus: "University of Ghana (Legon)" },
    { id: 2, campus: "UPSA" },
    { id: 3, campus: "GIMPA" },
    { id: 4, campus: "Wisconsin International University College" },
];

export const steps: Step[] = [
  {
    number: 1,
    title: 'Place Your Order',
    icon: ShoppingCart,
    description: 'Choose the health products that meet your needs. We offer standard and student pricing, with discounts applied automatically for campus deliveries.',
    details: ['Select products from our shop', 'No account or name needed', 'Pay securely with Mobile Money or Card'],
    imageUrl: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1757952399/medium-shot-woman-laying-couch_ojrtnp.jpg',
    imageHint: 'woman couch relaxing',
  },
  {
    number: 2,
    title: 'Private & Fast Delivery',
    icon: Truck,
    description: 'Your order is packaged in plain, unbranded materials and delivered by a professional rider. We only use your number to coordinate the drop-off.',
    details: ['Plain, unbranded packaging', '24-48 hour delivery in Accra', 'Track your order with an anonymous code'],
    imageUrl: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1757953240/close-up-delivery-person-giving-parcel-client_al5mjd.jpg',
    imageHint: 'discreet package delivery',
  },
  {
    number: 3,
    title: 'Get Your Results',
    icon: CheckCircle,
    description: 'For test kits, each kit comes with a simple, visual instruction manual. You can get a clear result in the comfort of your own space in under 20 minutes.',
    details: ['Easy-to-follow visual instructions', 'Results in under 20 minutes', 'WHO-approved for 99% accuracy'],
    imageUrl: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1757952387/man-being-happy-after-getting-negative-covid-test-result_udxny5.jpg',
    imageHint: 'man happy result',
  },
  {
    number: 4,
    title: 'Get Support (If Needed)',
    icon: HeartHandshake,
    description: 'A self-test is a first step, not a final diagnosis. If you get a positive result, we provide a confidential bridge to our trusted hospital partners for professional, discounted follow-up care.',
    details: ['Confidential connections to care', 'Partner hospitals & counselors', 'Support for confirmatory testing'],
    imageUrl: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1757955894/counselling_old_lady_modern_xbthvs.jpg',
    imageHint: 'professional counseling support',
  },
];

export const productBenefits: ProductBenefit[] = [
    { icon: ShieldCheck, title: '100% Private & Anonymous' },
    { icon: Award, title: 'WHO-Approved 99% Accuracy' },
    { icon: Truck, title: 'Discreet, Unbranded Packaging' },
    { icon: Zap, title: 'Results in Under 20 Mins' },
    { icon: Users, title: 'No Accounts, No Names' },
];

export const partners: Partner[] = [
    { id: 1, name: "University of Ghana SRC", logoUrl: "https://res.cloudinary.com/dzfa6wqb8/image/upload/v1756318481/ug_ytf3bp.png" },
    { id: 2, name: "GIMPA SRC", logoUrl: "https://res.cloudinary.com/dzfa6wqb8/image/upload/v1756318480/gimpa_vz8ko5.jpg" },
    { id: 3, name: "TopUp SRC", logoUrl: "https://res.cloudinary.com/dzfa6wqb8/image/upload/v1756318480/topup_x2q874.webp" },
    { id: 4, name: "Bedita Pharmacy", logoUrl: "https://res.cloudinary.com/dzfa6wqb8/image/upload/v1756318479/bedita_ekekhs.png" },
    { id: 5, name: "Ernest Chemist", logoUrl: "https://res.cloudinary.com/dzfa6wqb8/image/upload/v1756318479/ernest_chemist_ebxjug.webp" },
];

export const faqItems: FaqItem[] = [
  {
    question: "Is this service really anonymous?",
    answer: "Yes. We do not require your name, email, or any form of identification to place an order. We only ask for a delivery location and a contact number for the rider, which is deleted 7 days after completion."
  },
  {
    question: "How accurate are the test kits?",
    answer: "Our HIV self-test kits are WHO-approved and have an accuracy rate of over 99% when used correctly. The pregnancy tests are also highly reliable, standard medical-grade kits."
  },
  {
    question: "What happens if I test positive?",
    answer: "A self-test is a screening test, not a final diagnosis. If you get a positive result, it's very important to get a confirmatory test. We provide a confidential connection to our trusted partner hospitals who offer discounted, non-judgmental follow-up care."
  },
  {
    question: "How is my order delivered?",
    answer: "Your order is delivered in a plain, unbranded package. There is nothing on the outside to indicate what is inside. Our delivery riders are trained to be professional and discreet."
  },
  {
    question: "What areas do you deliver to?",
    answer: "We currently deliver across Greater Accra, Kumasi, and Cape Coast, including major university campuses like UG, UPSA, and GIMPA."
  },
  {
    question: "How do I get a student discount?",
    answer: "We offer discounts on select products for students. Just select your campus as the delivery location, and the discount will be applied automatically to your cart."
  },
];

export const testimonials: Testimonial[] = [
  {
    quote: "The entire process was so simple and private. I got my package the next day in a plain box. It's a huge relief to have a service like this in Ghana.",
    name: "Ama K.",
    role: "University of Ghana Student",
    avatar: "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=150&h=150&fit=crop&q=75"
  },
  {
    quote: "DiscreetKit is a game-changer. I was worried about going to a pharmacy, but this was completely anonymous. The tracking code gave me peace of mind.",
    name: "David A.",
    role: "Young Professional, Osu",
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop&q=75"
  },
  {
    quote: "As a student leader, I see the need for this every day. It's a responsible, safe, and judgment-free way for young people to take control of their health.",
    name: "Fatima S.",
    role: "Student Rep, UPSA",
    avatar: "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=150&h=150&fit=crop&q=75"
  },
  {
    quote: "The instructions were so easy to follow. I had my result in 15 minutes. Knowing my status privately has lifted a huge weight off my shoulders.",
    name: "Michael B.",
    role: "GIMPA Graduate",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&q=75"
  },
    {
    quote: "I ordered the couple's bundle with my partner. It helped us have an open conversation and support each other through the process. Highly recommend.",
    name: "Esi & Kofi",
    role: "Couple, Accra",
    avatar: "https://images.unsplash.com/photo-1544168190-79c17527004f?w=150&h=150&fit=crop&q=75"
  },
    {
    quote: "Fast, professional, and exactly as advertised. The package was so discreet, even I wasn't sure what it was at first. 10/10 service.",
    name: "Josephine O.",
    role: "Entrepreneur, East Legon",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&q=75"
  },
];
