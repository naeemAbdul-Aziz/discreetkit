

import { Package, ShoppingCart, Truck, CheckCircle, ShieldCheck, HeartHandshake, Zap, Award, Users, Phone, MessageSquare, Globe } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CartItem } from "@/hooks/use-cart";

export type Product = {
    id: number;
    name: string;
    description: string | null;
    price_ghs: number;
    student_price_ghs: number | null;
    image_url: string | null;
    featured: boolean | null;
    brand?: string | null;
    savings_ghs?: number | null;
    category?: string;
    sub_category?: string | null;
    usage_instructions?: string[] | null;
    in_the_box?: string[] | null;
    stock_level?: number;
    requires_prescription?: boolean;
    is_student_product?: boolean;
}

export type WellnessProduct = Product & {
  category: 'Contraception' | 'Condoms' | 'Personal Care' | 'STI Tests';
};

export type OrderStatus = 'pending_payment' | 'received' | 'processing' | 'out_for_delivery' | 'completed';

export const wellnessProducts: WellnessProduct[] = [
    {
        id: 4,
        name: 'Lydia Postpill',
        description: 'A single dose of emergency contraception to be taken after unprotected intercourse.',
        price_ghs: 90.00,
        student_price_ghs: 80.00,
        image_url: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759405784/postpill_jqk0n6.png',
        brand: 'Lydia',
        featured: false,
        category: 'Contraception',
        usage_instructions: [
            "Take one tablet as soon as possible after unprotected intercourse.",
            "Most effective when taken within 72 hours (3 days).",
            "This is a single-dose treatment.",
            "It is not a regular contraceptive pill."
        ],
        in_the_box: ["1 Tablet of Emergency Contraceptive", "1 Instruction Leaflet"],
    },
    {
        id: 16,
        name: 'Postinor 2',
        description: 'A trusted emergency contraceptive pill for preventing pregnancy within 72 hours.',
        price_ghs: 85.00,
        student_price_ghs: null,
        image_url: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759405784/postpill_jqk0n6.png',
        brand: 'Postinor',
        featured: false,
        category: 'Contraception',
        usage_instructions: [
            "Take one tablet as soon as possible after unprotected intercourse.",
            "Most effective when taken within 72 hours (3 days).",
            "This is a single-dose treatment.",
            "It is not a regular contraceptive pill."
        ],
        in_the_box: ["1 Tablet of Emergency Contraceptive", "1 Instruction Leaflet"],
    },
    {
        id: 5,
        name: 'Extra Safe Condoms',
        description: 'Slightly thicker condoms for those who want ultimate reassurance.',
        price_ghs: 50.00,
        student_price_ghs: 40.00,
        image_url: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413220/condoms_j5qyqj.png',
        brand: 'Durex',
        featured: false,
        category: 'Condoms',
        in_the_box: ["12 Extra Safe Latex Condoms"],
    },
    {
        id: 6,
        name: 'Performa Condoms',
        description: 'Designed to help him last longer for extended pleasure.',
        price_ghs: 55.00,
        student_price_ghs: null,
        image_url: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413220/condoms_j5qyqj.png',
        brand: 'Durex',
        featured: false,
        category: 'Condoms',
        in_the_box: ["12 Performa Latex Condoms"],
    },
    {
        id: 9,
        name: 'Flavored Condoms',
        description: 'A mix of banana and strawberry flavored condoms for extra fun.',
        price_ghs: 60.00,
        student_price_ghs: null,
        image_url: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413220/condoms_j5qyqj.png',
        brand: 'Durex',
        featured: false,
        category: 'Condoms',
        in_the_box: ["12 Assorted Flavored Latex Condoms"],
    },
    {
        id: 10,
        name: 'Fiesta Classic Condoms',
        description: 'The original and trusted choice for safety and comfort.',
        price_ghs: 45.00,
        student_price_ghs: 35.00,
        image_url: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413220/condoms_j5qyqj.png',
        brand: 'Fiesta',
        featured: false,
        category: 'Condoms',
        in_the_box: ["12 Classic Latex Condoms"],
    },
    {
        id: 11,
        name: 'Fiesta Banana Condoms',
        description: 'Add a fun, fruity twist to your intimate moments.',
        price_ghs: 50.00,
        student_price_ghs: null,
        image_url: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413220/condoms_j5qyqj.png',
        brand: 'Fiesta',
        featured: false,
        category: 'Condoms',
        in_the_box: ["12 Banana Flavored Latex Condoms"],
    },
    {
        id: 12,
        name: 'Fiesta Premium Ribbed',
        description: 'Ribbed for extra sensation and pleasure.',
        price_ghs: 55.00,
        student_price_ghs: null,
        image_url: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413220/condoms_j5qyqj.png',
        brand: 'Fiesta',
        featured: false,
        category: 'Condoms',
        in_the_box: ["12 Ribbed Latex Condoms"],
    },
    {
        id: 13,
        name: 'Aqua-based Personal Lubricant',
        description: 'A gentle, water-based lubricant for enhanced comfort.',
        price_ghs: 60.00,
        student_price_ghs: null,
        image_url: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413266/lube_ysdpst.png',
        brand: 'Durex',
        featured: false,
        category: 'Personal Care',
        in_the_box: ["1 Bottle of Aqua-based Lubricant"],
    },
];

export type Order = {
    id: number;
    code: string;
    created_at?: string;
    email?: string;
    status: OrderStatus;
    items: CartItem[];
    deliveryArea: string;
    delivery_area: string;
    deliveryAddressNote: string | null;
    delivery_address_note: string | null;
    isStudent: boolean;
    subtotal: number;
    student_discount: number;
    studentDiscount: number;
    delivery_fee: number;
    deliveryFee: number;
    total_price: number;
    totalPrice: number;
    pharmacy_id?: number | null;
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
    icon?: LucideIcon;
    details?: string[];
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
};

export type MarieStopesService = {
    title: string;
    description: string;
    imageUrl: string;
    imageHint: string;
}

export type MarieStopesData = {
    name: string;
    logoUrl: string;
    website: string | null;
    contact: {
        phone: string | null;
        whatsapp: string | null;
    }
    services: MarieStopesService[];
    faqs: FaqItem[];
}

export type ProductBenefit = {
    icon: LucideIcon;
    title: string;
};

export type DiscountLocation = {
    id: number;
    campus: string;
}

export type Pharmacy = {
  id: number;
  name: string;
  location: string;
  contact_person?: string | null;
  phone_number?: string | null;
  email?: string | null;
};


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

export const partnerCareSteps: Step[] = [
    {
      number: 1,
      title: 'Get Your Private Results',
      description: 'Your kit arrives in a plain package. Use the simple instructions to get a clear result in under 20 minutes, in the privacy of your own home.',
      imageUrl: 'https://images.unsplash.com/photo-1618495034073-404391999866?q=80&w=800&fit=crop',
      imageHint: 'person holding test',
    },
    {
      number: 2,
      title: 'Contact Our Partner',
      description: "If you need support or a confirmatory test, reach out to Marie Stopes. You can call them toll-free or chat on WhatsApp—it's 100% confidential.",
      imageUrl: 'https://images.unsplash.com/photo-1614324420919-4235395a3a42?q=80&w=800&fit=crop',
      imageHint: 'person on phone',
    },
    {
      number: 3,
      title: 'Get the Care You Need',
      description: 'Marie Stopes provides a safe, non-judgmental environment for confirmatory testing, counseling, and other health services to give you peace of mind.',
      imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=800&fit=crop',
      imageHint: 'doctor patient tablet',
    },
    {
        number: 4,
        title: 'Continued Support on Your Journey',
        description: 'Our partnership ensures you have a trusted place for follow-up care, prescriptions, and any future health questions you might have.',
        imageUrl: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1758223637/marie-stopes-logo_do0j8g.png',
        imageHint: 'continued support journey',
    }
];

export const productBenefits: ProductBenefit[] = [
    { icon: ShieldCheck, title: '100% Private & Anonymous' },
    { icon: Award, title: 'WHO-Approved 99% Accuracy' },
    { icon: Truck, title: 'Discreet, Unbranded Packaging' },
    { icon: Zap, title: 'Results in Under 20 Mins' },
    { icon: Users, title: 'No Accounts, No Names' },
];

export const marieStopesData: MarieStopesData = {
    name: "Marie Stopes Ghana",
    logoUrl: "https://res.cloudinary.com/dzfa6wqb8/image/upload/v1758223637/marie-stopes-logo_do0j8g.png",
    website: "https://www.mariestopes.org.gh",
    contact: {
        phone: "0800208080",
        whatsapp: "0556561081"
    },
    services: [
        {
            title: "Confirmatory Testing",
            description: "Get a professional test in a clinical setting to confirm your status and understand your health.",
            imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=800&fit=crop",
            imageHint: "doctor patient tablet"
        },
        {
            title: "Professional Counselling",
            description: "Speak with a trained professional in a private, non-judgmental space to discuss your results and options.",
            imageUrl: "https://images.unsplash.com/photo-1544006659-f0b21884ce1d?q=80&w=800&fit=crop",
            imageHint: "counselor listening patient"
        },
        {
            title: "Contraceptive Services",
            description: "Explore a wide range of modern contraceptive options with expert guidance to fit your lifestyle.",
            imageUrl: "https://images.unsplash.com/photo-1584515933487-759821d27167?q=80&w=800&fit=crop",
            imageHint: "hands holding package"
        },
    ],
    faqs: [
        {
            question: "Do I need an appointment?",
            answer: "Walk-ins are welcome, but we recommend calling ahead to confirm the best time and reduce your waiting period. You can call their toll-free number at 0800 20 8080."
        },
        {
            question: "Will my visit be confidential?",
            answer: "Absolutely. Marie Stopes Ghana operates under strict confidentiality policies. Your information is protected and will not be shared. They are known for providing a safe and private environment."
        },
        {
            question: "What should I expect during my visit?",
            answer: "You will be greeted by friendly, non-judgmental staff. A trained counselor or healthcare provider will speak with you privately about your needs, explain the process, and answer any questions you have before any tests are done."
        },
        {
            question: "Is there a special benefit for coming from DiscreetKit?",
            answer: "While there isn't a direct discount, mentioning you came from DiscreetKit can help their staff understand your need for a discreet and sensitive experience. Our partnership ensures you will be treated with the utmost respect and privacy."
        },
        {
            question: "How long will it take to get results?",
            answer: "Results for many tests, including confirmatory HIV tests, are often available quickly, sometimes on the same day. The staff will inform you of the expected timeline for your specific test."
        }
    ]
};

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
    answer: "A self-test is a screening test, not a final diagnosis. If you get a positive result, it's very important to get a confirmatory test. We provide a confidential connection to our trusted partner, Marie Stopes Ghana, who offer professional follow-up care."
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
    name: "Satisfied Customer",
    role: "University of Ghana Student",
  },
  {
    quote: "DiscreetKit is a game-changer. I was worried about going to a pharmacy, but this was completely anonymous. The tracking code gave me peace of mind.",
    name: "Happy User",
    role: "Young Professional, Osu",
  },
  {
    quote: "As a student leader, I see the need for this every day. It's a responsible, safe, and judgment-free way for young people to take control of their health.",
    name: "Student Rep",
    role: "UPSA",
  },
  {
    quote: "The instructions were so easy to follow. I had my result in 15 minutes. Knowing my status privately has lifted a huge weight off my shoulders.",
    name: "Relieved Customer",
    role: "GIMPA Graduate",
  },
    {
    quote: "I ordered the couple's bundle with my partner. It helped us have an open conversation and support each other through the process. Highly recommend.",
    name: "A Private Couple",
    role: "Accra",
  },
    {
    quote: "Fast, professional, and exactly as advertised. The package was so discreet, even I wasn't sure what it was at first. 10/10 service.",
    name: "Confident Customer",
    role: "Entrepreneur, East Legon",
  },
];

    