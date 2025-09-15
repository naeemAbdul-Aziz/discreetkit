
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
    },
    {
        id: 2,
        name: 'Pregnancy Test Kit',
        description: 'A reliable, easy-to-use pregnancy test for fast and private results.',
        priceGHS: 45.00,
        studentPriceGHS: 35.00,
        imageUrl: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1756312643/preg-kit_d5xpyb.png',
    },
    {
        id: 3,
        name: 'Support Bundle (Couple)',
        description: 'Contains two HIV self-test kits. Encourages testing together for mutual support.',
        priceGHS: 140.00,
        imageUrl: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1756312643/couple-kit_h3h1gc.png',
    },
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
    title: 'Order Your Kit',
    icon: ShoppingCart,
    description: 'Choose the test kit that meets your needs. We offer standard and student pricing, with discounts applied automatically for campus deliveries.',
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
    description: 'Each kit comes with a simple, visual instruction manual. You can get a clear result in the comfort of your own space in under 20 minutes.',
    details: ['Easy-to-follow visual instructions', 'Results in under 20 minutes', 'WHO-approved for 99% accuracy'],
    imageUrl: 'https://images.unsplash.com/photo-1579165466949-558158434135?w=800&h=600&fit=crop&q=75',
    imageHint: 'person reading test result',
  },
  {
    number: 4,
    title: 'Get Support (If Needed)',
    icon: HeartHandshake,
    description: 'A self-test is a first step, not a final diagnosis. If you get a positive result, we provide a confidential bridge to our trusted hospital partners for professional, discounted follow-up care.',
    details: ['Confidential connections to care', 'Partner hospitals & counselors', 'Support for confirmatory testing'],
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba9996a?w=800&h=600&fit=crop&q=75',
    imageHint: 'healthcare professional consulting',
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
    answer: "We currently deliver across Greater Accra, Kumasi, and Cape Coast, including major university campuses like UG, UPSA, and GIMPA. You can see our full coverage on the map on our homepage."
  },
  {
    question: "Can I get a student discount?",
    answer: "Yes! We offer a GHS 10 discount on the HIV and Pregnancy kits for students. Just select your campus as the delivery location, and the discount will be applied automatically to your cart."
  },
];

export const testimonials: Testimonial[] = [
  {
    quote: "The entire process was so simple and private. I got my package the next day in a plain box. It's a huge relief to have a service like this in Ghana.",
    name: "Ama K.",
    role: "University of Ghana Student",
    avatar: "https://i.pravatar.cc/150?img=1"
  },
  {
    quote: "DiscreetKit is a game-changer. I was worried about going to a pharmacy, but this was completely anonymous. The tracking code gave me peace of mind.",
    name: "David A.",
    role: "Young Professional, Osu",
    avatar: "https://i.pravatar.cc/150?img=3"
  },
  {
    quote: "As a student leader, I see the need for this every day. It's a responsible, safe, and judgment-free way for young people to take control of their health.",
    name: "Fatima S.",
    role: "Student Rep, UPSA",
    avatar: "https://i.pravatar.cc/150?img=5"
  },
  {
    quote: "The instructions were so easy to follow. I had my result in 15 minutes. Knowing my status privately has lifted a huge weight off my shoulders.",
    name: "Michael B.",
    role: "GIMPA Graduate",
    avatar: "https://i.pravatar.cc/150?img=7"
  },
    {
    quote: "I ordered the couple's bundle with my partner. It helped us have an open conversation and support each other through the process. Highly recommend.",
    name: "Esi & Kofi",
    role: "Couple, Accra",
    avatar: "https://i.pravatar.cc/150?img=9"
  },
    {
    quote: "Fast, professional, and exactly as advertised. The package was so discreet, even I wasn't sure what it was at first. 10/10 service.",
    name: "Josephine O.",
    role: "Entrepreneur, East Legon",
    avatar: "https://i.pravatar.cc/150?img=11"
  },
];
