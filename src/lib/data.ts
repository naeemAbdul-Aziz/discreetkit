

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
    imageUrl: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759406841/discreetkit_hiv_i3fqmu.png',
    imageHint: 'HIV self-test kit product',
  },
  {
    number: 2,
    title: 'Private & Fast Delivery',
    icon: Truck,
    description: 'Your order is packaged in plain, unbranded materials and delivered by a professional rider. We only use your number to coordinate the drop-off.',
    details: ['Plain, unbranded packaging', '24-48 hour delivery in Accra', 'Track your order with an anonymous code'],
    imageUrl: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759404957/discreetkit_pregnancy_cujiod.png',
    imageHint: 'pregnancy test kit product',
  },
  {
    number: 3,
    title: 'Get Your Results',
    icon: CheckCircle,
    description: 'For test kits, each kit comes with a simple, visual instruction manual. You can get a clear result in the comfort of your own space in under 20 minutes.',
    details: ['Easy-to-follow visual instructions', 'Results in under 20 minutes', 'WHO-approved for 99% accuracy'],
    imageUrl: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759405784/postpill_jqk0n6.png',
    imageHint: 'emergency contraception postpill product',
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
    {
      title: "Confirmatory Testing",
      description: "Get a professional test in a clinical setting to confirm your status and understand your health.",
      imageUrl: "https://res.cloudinary.com/dzfa6wqb8/image/upload/v1757955894/counselling_old_lady_modern_xbthvs.jpg",
      imageHint: "doctor patient tablet"
    },
    {
      title: "Professional Counselling",
      description: "Speak with a trained professional in a private, non-judgmental space to discuss your results and options.",
      imageUrl: "https://res.cloudinary.com/dzfa6wqb8/image/upload/v1757955894/counselling_old_lady_modern_xbthvs.jpg",
      imageHint: "counselor listening patient"
    },
    {
      title: "Contraceptive Services",
      description: "Explore a wide range of modern contraceptive options with expert guidance to fit your lifestyle.",
      imageUrl: "https://res.cloudinary.com/dzfa6wqb8/image/upload/v1757953240/close-up-delivery-person-giving-parcel-client_al5mjd.jpg",
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

