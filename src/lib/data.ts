
import { BadgeCheck, Lock, ShieldCheck, Truck, Users, GraduationCap, Hospital, MapPin, ShoppingBag, MessageCircle, HeartHandshake } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export type Product = {
    id: number;
    name: string;
    slug: string;
    description: string;
    priceGHS: number;
    studentPriceGHS?: number;
    active: boolean;
    imageUrl: string;
    reviews: number;
}

export const products: Product[] = [
  {
    id: 1,
    name: 'Standard HIV Kit',
    slug: 'standard-hiv-kit',
    description: 'A single-use, private HIV self-test kit. WHO-approved for 99% accuracy.',
    priceGHS: 75.00,
    studentPriceGHS: 65.00,
    active: true,
    imageUrl: 'https://images.unsplash.com/photo-1606295835050-e17a6a239ccf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw5fHxtZWRpY2FsJTIwdGVzdCUyMGtpdHxlbnwwfHx8fDE3NTYxNDczODd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    reviews: 289
  },
  {
    id: 2,
    name: 'Pregnancy Test Kit',
    slug: 'pregnancy-test-kit',
    description: 'A reliable, easy-to-use pregnancy test for fast and private results.',
    priceGHS: 45.00,
    studentPriceGHS: 35.00,
    active: true,
    imageUrl: 'https://images.unsplash.com/photo-1591185157258-11aec5f039d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8bWVkaWNhbCUyMHRlc3QlMjBraXR8ZW58MHx8fHwxNzU2MTQ3Mzg3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    reviews: 350
  },
  {
    id: 3,
    name: 'Support Bundle (Couple)',
    slug: 'couple-support-bundle',
    description: 'Two private HIV self-test kits. Test together, support each other.',
    priceGHS: 140.00,
    active: true,
    imageUrl: 'https://images.unsplash.com/photo-1520038410233-7141be7e6f97?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxib3h8ZW58MHx8fHwxNzU2MTQ5MDkyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    reviews: 412
  },
]

export const DELIVERY_FEES = {
  standard: 20.00,
  campus: 10.00,
}

export type DiscountLocation = {
  id: number;
  audience: string;
  campus: string;
  discount: number;
  notes: string;
}
export const discounts: DiscountLocation[] = [
  { id: 1, audience: 'student', campus: 'University of Ghana, Legon', discount: 10.00, notes: 'Free delivery for all on-campus orders.' },
  { id: 2, audience: 'student', campus: 'UPSA', discount: 10.00, notes: 'Discounted delivery in partnership with UPSA SRC.' },
  { id: 3, audience: 'student', campus: 'GIMPA', discount: 10.00, notes: 'Reduced delivery fees for GIMPA students.' },
  { id: 4, audience: 'student', campus: 'Wisconsin International University College', discount: 10.00, notes: 'Special delivery rates available.' },
]

export const productBenefits = [
  { icon: ShieldCheck, title: '100% Confidential' },
  { icon: Truck, title: 'Discreet Delivery' },
  { icon: Lock, title: 'Anonymous Ordering' },
  { icon: BadgeCheck, title: 'WHO-Approved Tests' },
  { icon: Users, title: 'No Account Needed' },
];


export const features = [
  {
    icon: ShieldCheck,
    title: 'Anonymous Ordering',
    description: 'No names, no accounts. Your privacy is our top priority. We never store personal details.',
    image: 'https://picsum.photos/400/250',
    dataAiHint: 'privacy lock'
  },
   {
    icon: GraduationCap,
    title: 'Student Friendly Kits',
    description: 'Special kits and bundles created for students. Your health shouldn\'t break the bank.',
    image: 'https://picsum.photos/400/250',
    dataAiHint: 'student health'
  },
  {
    icon: Truck,
    title: 'Fast & Discreet Delivery',
    description: 'Get your order quickly in unbranded packaging. Or, choose anonymous pharmacy pickup.',
    image: 'https://picsum.photos/400/250',
    dataAiHint: 'delivery person'
  },
  {
    icon: Hospital,
    title: 'Partner Hospitals',
    description: 'We connect you with trusted health partners for follow-up care and support if needed.',
    image: 'https://picsum.photos/400/250',
    dataAiHint: 'hospital building'
  },
  {
    icon: MapPin,
    title: 'Easy Tracking',
    description: 'Use your unique, anonymous code to track your order from our hub to your hands.',
    image: 'https://picsum.photos/400/250',
    dataAiHint: 'map tracking'
  },
  {
    icon: BadgeCheck,
    title: 'Verified & Safe Tests',
    description: 'All our self-test kits are WHO-approved and sourced from trusted manufacturers.',
    image: 'https://picsum.photos/400/250',
    dataAiHint: 'medical test'
  },
]

export const testimonials = [
    {
        quote: "The process was so simple and private. I didn't have to worry about anyone knowing. Got my package the next day at my hostel.",
        name: 'A. Mensah',
        role: 'Student, University of Ghana',
        avatar: 'https://picsum.photos/100/100',
        dataAiHint: 'person portrait'
    },
    {
        quote: "The student discount really helped. It's great to see a service that actually considers our budget. The packaging was completely plain as promised.",
        name: 'F. Annan',
        role: 'Student, UPSA',
        avatar: 'https://picsum.photos/102/102',
        dataAiHint: 'person portrait'
    },
    {
        quote: "As a young professional, my schedule is tight. Ordering online was convenient, and the pharmacy pickup option was perfect for me.",
        name: 'K. Owusu',
        role: 'Young Professional, Accra',
        avatar: 'https://picsum.photos/101/101',
        dataAiHint: 'person portrait'
    }
];

export const faqItems = [
    {
        question: "How do you protect my identity?",
        answer: "We are built on privacy. We do not require names, email addresses, or account creation. Your order is tied to an anonymous code. We only ask for a delivery location and a contact number for the delivery agent, which is masked and deleted after fulfillment."
    },
    {
        question: "What areas do you deliver to?",
        answer: "We currently deliver across Greater Accra, with a focus on major university campuses like Legon, UPSA, GIMPA, and Wisconsin. We are expanding our coverage, so please check back if your area is not yet listed."
    },
    {
        question: "What tests are available?",
        answer: "We currently offer WHO-approved HIV/AIDS self-test kits and standard pregnancy test kits. We plan to add more self-test options in the future."
    },
    {
        question: "What happens if I test positive?",
        answer: "A positive self-test result is preliminary. We will connect you with our partner hospitals for a confidential, discounted confirmatory test and professional counseling. Your well-being is our priority."
    },
    {
        question: "Can I get a refund?",
        answer: "Due to the medical nature of our products, we cannot accept returns. However, if your kit is damaged upon arrival, please contact us with your order code, and we will arrange a replacement."
    },
    {
        question: "How long does delivery take?",
        answer: "Orders within Accra are typically delivered within 24-48 hours. Campus deliveries are often faster. You can follow the progress with your unique tracking code."
    }
];

export type Step = {
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
  details: string[];
  imageUrl: string;
  imageHint: string;
};

export const steps: Step[] = [
  {
    number: '1',
    title: 'Order Your Kit',
    description: 'Select the test kit you need from our shop. The process is fully anonymous and secure, with no accounts needed.',
    icon: ShoppingBag,
    details: [
      'Choose from individual or bundle packs.',
      'Student discounts are available.',
      'Pay securely with mobile money or card.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxzb21lb25lJTIwJTIwb3JkZXJpbmclMjBvbmxpbmV8ZW58MHx8fHwxNzU2Mzk1NzgxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    imageHint: 'person ordering online'
  },
  {
    number: '2',
    title: 'Private & Fast Delivery',
    description: 'Receive your kit in a plain, unbranded package. No one will know the contents. We deliver to your chosen location or a partner pharmacy.',
    icon: Truck,
    details: [
        'Unmarked packaging ensures complete privacy.',
        'Track your order with your anonymous code.',
        'Pickup options available at trusted local pharmacies.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1606830733744-0ad77a44b931?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxkaXNjcmVldCUyMHBhY2thZ2V8ZW58MHx8fHwxNzU2Mzk1ODIwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    imageHint: 'discreet package'
  },
  {
    number: '3',
    title: 'Get Your Results',
    description: 'Follow the simple, clear instructions to get your results in minutes, all in the comfort and privacy of your own space.',
    icon: MessageCircle,
    details: [
        'WHO-approved tests for reliable results.',
        'Easy-to-understand instruction manual included.',
        'Get your results in under 20 minutes.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1583324113620-910f24a2571b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxmbGF0JTIwbGF5JTIwbWVkaWNhbCUyMGtpdHxlbnwwfHx8fDE3NTYxNDg5OTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    imageHint: 'medical kit'
  },
  {
    number: '4',
    title: 'Get Support (If Needed)',
    description: 'If you test positive, we confidentially connect you with our partner hospitals for professional, non-judgmental, and discounted follow-up care.',
    icon: HeartHandshake,
    details: [
        'Access to professional counselors.',
        'Discounted confirmatory testing at partner hospitals.',
        'A responsible and supportive path to care.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxoZWFsdGhjYXJlJTIwcHJvZmVzc2lvbmFsJTIwY29uc3VsdGluZ3xlbnwwfHx8fDE3NTYzOTU4ODF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    imageHint: 'healthcare professional'
  },
];


export type Order = {
  id: string;
  code: string;
  productName: string;
  status: 'received' | 'processing' | 'out_for_delivery' | 'pickup_ready' | 'completed';
  events: { status: string; date: string; note: string }[];
};

export const generateTrackingCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result.replace(/(.{3})/, "$1-").replace(/(.{7})/, "$1-");
}

export const partners = [
  { id: 1, name: 'Ernest Chemists', type: 'pharmacy', logoUrl: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1756318479/ernest_chemist_ebxjug.webp', url: '#' },
  { id: 2, name: 'Beditah Pharmacy', type: 'pharmacy', logoUrl: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1756318479/bedita_ekekhs.png', url: '#' },
  { id: 3, name: 'Top-Up Pharmacy', type: 'pharmacy', logoUrl: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1756318480/topup_x2q874.webp', url: '#' },
  { id: 4, name: 'GIMPA', type: 'src', logoUrl: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1756318480/gimpa_vz8ko5.jpg', url: '#' },
  { id: 5, name: 'University of Ghana', type: 'src', logoUrl: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1756318481/ug_ytf3bp.png', url: '#' },
];
