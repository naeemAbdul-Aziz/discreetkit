

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

export type Category = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
}

export type Order = {
  id: string;
  code: string;
  partnerCode?: string | null; // Unique partner access code for referrals
  status: 'pending_payment' | 'received' | 'processing' | 'out_for_delivery' | 'completed';
  items: CartItem[];
  deliveryArea: string;
  deliveryAddressNote: string | null;
  isStudent: boolean;
  subtotal_ghs: number;
  student_discount_ghs: number;
  delivery_fee_ghs: number;
  total_price_ghs: number;
  courierName?: string | null;
  courierPhone?: string | null;
  courierTrackingUrl?: string | null;
  events: {
    status: string;
    note: string;
    date: Date;
  }[];
}

export type OrderStatus = 'pending_payment' | 'received' | 'processing' | 'out_for_delivery' | 'completed';

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

/**
 * Generates a unique Partner Access Code for Marie Stopes referrals.
 * Format: DK-MS-XXXX (where X is alphanumeric)
 */
export const generatePartnerCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'DK-MS-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

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
  avatar: string;
};

export type MarieStopesService = {
  title: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  category: 'Sexual Health' | 'Reproductive Health' | 'General Wellness';
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
  meetingPoints?: string[];
  coords?: { lat: number; lng: number };
}

export const discounts: DiscountLocation[] = [
  {
    id: 1,
    campus: "University of Ghana (Legon)",
    meetingPoints: ["Main Gate", "Night Market", "Volta Hall Gate", "Sarbah Hall Main Gate", "Commonwealth Hall Gate", "Akuafo Hall Gate", "Pentagon Hall Main Gate", "Bani Hall Gate", "Evandy Hall Gate", "TF Hostel Gate", "Balme Library"],
    coords: { lat: 5.6506, lng: -0.1962 }
  },
  {
    id: 2,
    campus: "UPSA",
    meetingPoints: ["Main Entrance", "Hostel A Gate", "Hostel B Gate", "Library Entrance", "Student Center"],
    coords: { lat: 5.6588, lng: -0.1585 }
  },
  {
    id: 3,
    campus: "GIMPA",
    meetingPoints: ["Main Gate", "Law School Entrance", "Greenhill Hostel", "Business School Forecourt"],
    coords: { lat: 5.6256, lng: -0.2066 }
  },
  {
    id: 4,
    campus: "Wisconsin International University College",
    meetingPoints: ["Main Entrance", "Hostel Gate", "Canteen Area"],
    coords: { lat: 5.6811, lng: -0.1934 }
  },
  {
    id: 5,
    campus: "Academic City University College",
    meetingPoints: ["Main Gate", "Student Housing Entrance"],
    coords: { lat: 5.7001, lng: -0.1776 }
  },
  {
    id: 6,
    campus: "Lancaster University Ghana",
    meetingPoints: ["Main Reception", "Car Park"],
    coords: { lat: 5.6322, lng: -0.1387 }
  },
];

export const steps: Step[] = [
  {
    number: 1,
    title: 'Order Anonymously',
    icon: ShoppingCart,
    description: 'Select your essentials without creating an account. We do not ask for your name. Your privacy is our default setting.',
    details: ['No account required', 'No name needed', 'Guest checkout only'],
    imageUrl: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1765658493/anonymous_ordering_z64cfi.png',
    imageHint: 'person ordering on phone',
  },
  {
    number: 2,
    title: 'Pharmacy Fulfillment',
    icon: Truck,
    description: 'Your order is digitally routed to the nearest verified partner pharmacy for speed. They pack it immediately, ensuring professional handling without you ever stepping inside.',
    details: ['Routed to licensed pharmacy', 'Professionally packed', 'Zero judgment'],
    imageUrl: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1765658492/pharmacy_fulfillment_jjwkx5.png',
    imageHint: 'pharmacy packing order',
  },
  {
    number: 3,
    title: 'Unmarked Delivery',
    icon: CheckCircle,
    description: 'Our rider picks up the sealed, unbranded package. No logos. No labels. It looks like any other delivery.',
    details: ['100% Plain packaging', 'No "Health" stickers', 'Discreet delivery rider'],
    imageUrl: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1765658493/mystery_box_d2bvzi.png',
    imageHint: 'plain package delivery',
  },
  {
    number: 4,
    title: 'Private Results',
    icon: HeartHandshake,
    description: 'Receive your package at your hostel or home. Your roommates or family will never know what is inside. Get your answers in complete privacy. Need further support?',
    details: ['Data wiped after delivery', 'Complete anonymity', 'Peace of mind'],
    imageUrl: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1765658493/private_test_result_lzxlpn.png',
    imageHint: 'private result checking',
  },
];

export const partnerCareSteps: Step[] = [
  {
    number: 1,
    title: 'Get Your Private Results',
    description: 'Your kit arrives in a plain package. Use the simple instructions to get a clear result in under 20 minutes, in the privacy of your own home.',
    imageUrl: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1757952387/man-being-happy-after-getting-negative-covid-test-result_udxny5.jpg',
    imageHint: 'person holding test',
  },
  {
    number: 2,
    title: 'Contact Our Partner',
    description: "If you need support or a confirmatory test, reach out to Marie Stopes. You can call them toll-free or chat on WhatsApp—it's 100% confidential.",
    imageUrl: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1757955894/counselling_old_lady_modern_xbthvs.jpg',
    imageHint: 'person on phone',
  },
  {
    number: 3,
    title: 'Get the Care You Need',
    description: 'Marie Stopes provides a safe, non-judgmental environment for confirmatory testing, counseling, and other health services to give you peace of mind.',
    imageUrl: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1757955894/counselling_old_lady_modern_xbthvs.jpg',
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
    // Sexual Health
    {
      title: "STI Testing & Management",
      description: "Confidential testing and treatment for sexually transmitted infections.",
      imageUrl: "https://res.cloudinary.com/dzfa6wqb8/image/upload/v1757955894/counselling_old_lady_modern_xbthvs.jpg",
      imageHint: "consultation",
      category: "Sexual Health"
    },
    {
      title: "HIV Testing & Counselling",
      description: "Rapid, accurate HIV testing with professional pre- and post-test counselling.",
      imageUrl: "https://res.cloudinary.com/dzfa6wqb8/image/upload/v1757955894/counselling_old_lady_modern_xbthvs.jpg",
      imageHint: "medical advice",
      category: "Sexual Health"
    },

    // Reproductive Health (Contraception & Fertility)
    {
      title: "Contraception & Family Planning",
      description: "Full range of methods: Short-term (Pills, Injections) and Long-term (IUDs, Implants).",
      imageUrl: "https://res.cloudinary.com/dzfa6wqb8/image/upload/v1757953240/close-up-delivery-person-giving-parcel-client_al5mjd.jpg",
      imageHint: "contraception options",
      category: "Reproductive Health"
    },
    {
      title: "Emergency Contraception",
      description: "Access to emergency solutions when you need them most.",
      imageUrl: "https://res.cloudinary.com/dzfa6wqb8/image/upload/v1757953240/close-up-delivery-person-giving-parcel-client_al5mjd.jpg",
      imageHint: "emergency care",
      category: "Reproductive Health"
    },
    {
      title: "Pregnancy Testing & Options",
      description: "Professional pregnancy testing and non-judgmental options counselling.",
      imageUrl: "https://res.cloudinary.com/dzfa6wqb8/image/upload/v1757952387/man-being-happy-after-getting-negative-covid-test-result_udxny5.jpg",
      imageHint: "pregnancy test",
      category: "Reproductive Health"
    },
    {
      title: "Fertility Counselling",
      description: "Expert advice and testing for individuals or couples planning for a family.",
      imageUrl: "https://res.cloudinary.com/dzfa6wqb8/image/upload/v1757955894/counselling_old_lady_modern_xbthvs.jpg",
      imageHint: "couple counselling",
      category: "Reproductive Health"
    },
    {
      title: "Post-Abortion Care",
      description: "Compassionate medical care and support following a miscarriage or abortion.",
      imageUrl: "https://res.cloudinary.com/dzfa6wqb8/image/upload/v1757955894/counselling_old_lady_modern_xbthvs.jpg",
      imageHint: "medical support",
      category: "Reproductive Health"
    },

    // General Wellness
    {
      title: "Cervical Cancer Screening",
      description: "Life-saving screening and preventive treatment for cervical cancer.",
      imageUrl: "https://res.cloudinary.com/dzfa6wqb8/image/upload/v1757955894/counselling_old_lady_modern_xbthvs.jpg",
      imageHint: "screening",
      category: "General Wellness"
    },
    {
      title: "General Consultation",
      description: "Speak to a doctor about any general health concerns or lab service needs.",
      imageUrl: "https://res.cloudinary.com/dzfa6wqb8/image/upload/v1757955894/counselling_old_lady_modern_xbthvs.jpg",
      imageHint: "doctor consultation",
      category: "General Wellness"
    },
    {
      title: "Menstruation & Menopause",
      description: "Specialized care for menstrual health and menopause management.",
      imageUrl: "https://res.cloudinary.com/dzfa6wqb8/image/upload/v1757955894/counselling_old_lady_modern_xbthvs.jpg",
      imageHint: "womens health",
      category: "General Wellness"
    }
  ],
  faqs: [
    {
      question: "Do I need an appointment?",
      answer: "With your Discreet Access Code, you can walk in, but calling ahead is recommended to minimize wait times."
    },
    {
      question: "Will my visit be confidential?",
      answer: "Absolutely. Marie Stopes Ghana operates under strict confidentiality policies. Your information is protected."
    },
    {
      question: "What is the 'Discreet Access Code'?",
      answer: "It is a unique code provided by DiscreetKit that signals to Marie Stopes staff that you are a partner client, ensuring you receive sensitive, priority care."
    },
    {
      question: "Do I have to pay?",
      answer: "Yes, you pay Marie Stopes directly for the service. The code facilitates your access and ensures verified, safe care."
    },
    {
      question: "How long will it take to get results?",
      answer: "Results for many tests, including confirmatory HIV tests, are often available quickly, sometimes on the same day."
    }
  ]
};

export const faqItems: FaqItem[] = [
  {
    question: "How discreet is your delivery service?",
    answer: "We deliver in unmarked packages with no branding that reveals the contents. All deliveries are 100% confidential and anonymous. Our delivery partners are trained to be professional and discreet."
  },
  {
    question: "Do you deliver to universities in Ghana?",
    answer: "Yes! We deliver to all major universities including University of Ghana (Legon), KNUST, UCC, UPSA, GIMPA, and many others. We understand student privacy needs and provide extra discretion for campus deliveries."
  },
  {
    question: "Are your self-test kits accurate and FDA approved?",
    answer: "All our self-test kits are FDA-approved and WHO-certified. Our HIV rapid test kits have 99%+ accuracy, and pregnancy tests are 99% accurate from the first day of a missed period."
  },
  {
    question: "How quickly can I get emergency contraception (Postpill)?",
    answer: "We offer same-day delivery for emergency contraception in Accra and next-day delivery to other regions. Postpill is most effective when taken within 72 hours, so time is critical."
  },
  {
    question: "Do you require any personal information for orders?",
    answer: "We only require delivery information. No ID verification, no personal health details, and no questions asked. Your privacy is completely protected throughout the entire process."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept Mobile Money (MTN, Vodafone, AirtelTigo), bank transfers, and cash on delivery. All payments are processed securely and confidentially."
  },
  {
    question: "Can couples order testing kits together?",
    answer: "Yes! Our Partner Care service provides couple testing kits and relationship wellness products. Everything is delivered discreetly in one package for both partners."
  },
  {
    question: "What areas in Ghana do you deliver to?",
    answer: "We deliver nationwide across Ghana including Accra, Kumasi, Takoradi, Tamale, Ho, Cape Coast, and all major universities. Delivery fees vary by location, with free delivery available for orders over certain amounts."
  }
];

export const testimonials: Testimonial[] = [
  {
    quote: "The entire process was so simple and private. I got my package the next day in a plain box. It's a huge relief to have a service like this in Ghana.",
    name: "Ama Konadu",
    role: "University of Ghana Student",
    avatar: "https://images.unsplash.com/photo-1596495577886-d9256242498b?w=150&h=150&fit=crop&q=75"
  },
  {
    quote: "DiscreetKit is a game-changer. I was worried about going to a pharmacy, but this was completely anonymous. The tracking code gave me peace of mind.",
    name: "David Adjei",
    role: "Young Professional, Osu",
    avatar: "https://images.unsplash.com/photo-1584012961505-507d844cc8a0?w=150&h=150&fit=crop&q=75"
  },
  {
    quote: "As a student leader, I see the need for this every day. It's a responsible, safe, and judgment-free way for young people to take control of their health.",
    name: "Fatima Seidu",
    role: "Student Rep, UPSA",
    avatar: "https://images.unsplash.com/photo-1610476034959-548995964893?w=150&h=150&fit=crop&q=75"
  },
  {
    quote: "The instructions were so easy to follow. I had my result in 15 minutes. Knowing my status privately has lifted a huge weight off my shoulders.",
    name: "Michael Boateng",
    role: "GIMPA Graduate",
    avatar: "https://images.unsplash.com/photo-1607990281513-2c3f162de8ac?w=150&h=150&fit=crop&q=75"
  },
  {
    quote: "I ordered the couple's bundle with my partner. It helped us have an open conversation and support each other through the process. Highly recommend.",
    name: "Esi & Kofi",
    role: "Couple, Accra",
    avatar: "https://images.unsplash.com/photo-1541533848316-f333b210a501?w=150&h=150&fit=crop&q=75"
  },
  {
    quote: "Fast, professional, and exactly as advertised. The package was so discreet, even I wasn't sure what it was at first. 10/10 service.",
    name: "Josephine Owusu",
    role: "Entrepreneur, East Legon",
    avatar: "https://images.unsplash.com/photo-1580852300021-3349a882d385?w=150&h=150&fit=crop&q=75"
  },
];

