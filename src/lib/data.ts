
import { BadgeCheck, Lock, ShieldCheck, Truck, Users, GraduationCap, Hospital, MapPin } from "lucide-react"

export const products = [
  {
    id: 1,
    name: 'HIV/AIDS Self-Test Kit (Individual)',
    slug: 'hiv-test-individual',
    description: 'A single-use, private HIV self-test kit. Results in 20 minutes.',
    priceGHS: 75.00,
    is_student_bundle: false,
    active: true,
    imageUrl: 'https://placehold.co/400x300',
  },
  {
    id: 2,
    name: 'HIV/AIDS Self-Test Kit (Couple Pack)',
    slug: 'hiv-test-couple',
    description: 'Two private HIV self-test kits. Test together, support each other.',
    priceGHS: 140.00,
    is_student_bundle: true,
    active: true,
    imageUrl: 'https://placehold.co/400x300',
  },
  {
    id: 3,
    name: 'Pregnancy Test Kit',
    slug: 'pregnancy-test',
    description: 'Early detection pregnancy test. Accurate and easy to use.',
    priceGHS: 40.00,
    is_student_bundle: false,
    active: true,
    imageUrl: 'https://placehold.co/400x300',
  },
  {
    id: 4,
    name: 'Student Health Bundle',
    slug: 'student-bundle',
    description: 'Includes one HIV test and one pregnancy test. Stay informed.',
    priceGHS: 110.00,
    is_student_bundle: true,
    active: true,
    imageUrl: 'https://placehold.co/400x300',
  },
]

export const partners = [
  { id: 1, name: 'University of Ghana Hospital', type: 'hospital', logoUrl: 'https://placehold.co/130x40', url: '#' },
  { id: 2, name: '37 Military Hospital', type: 'hospital', logoUrl: 'https://placehold.co/130x40', url: '#' },
  { id: 3, name: 'Korle-Bu Teaching Hospital', type: 'hospital', logoUrl: 'https://placehold.co/130x40', url: '#' },
  { id: 4, name: 'UPSA Health Services', type: 'hospital', logoUrl: 'https://placehold.co/130x40', url: '#' },
  { id: 5, name: 'GIMPA Hospital', type: 'hospital', logoUrl: 'https://placehold.co/130x40', url: '#' },
  { id: 6, name: 'Campus Pharmacy, Legon', type: 'pharmacy', logoUrl: 'https://placehold.co/130x40', url: '#' },
  { id: 7, name: 'Central Pharmacy', type: 'pharmacy', logoUrl: 'https://placehold.co/130x40', url: '#' },
  { id: 8, name: 'University of Ghana SRC', type: 'src', logoUrl: 'https://placehold.co/130x40', url: '#' },
  { id: 9, name: 'UPSA SRC', type: 'src', logoUrl: 'https://placehold.co/130x40', url: '#' },
  { id: 10, name: 'GIMPA SRC', type: 'src', logoUrl: 'https://placehold.co/130x40', url: '#' },
  { id: 11, name: 'Wisconsin SRC', type: 'src', logoUrl: 'https://placehold.co/130x40', url: '#' },
]

export const discounts = [
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
    image: 'https://placehold.co/400x250',
    dataAiHint: 'privacy lock'
  },
   {
    icon: GraduationCap,
    title: 'Student Friendly Kits',
    description: 'Special kits and bundles created for students. Your health shouldn\'t break the bank.',
    image: 'https://placehold.co/400x250',
    dataAiHint: 'student health'
  },
  {
    icon: Truck,
    title: 'Fast & Discreet Delivery',
    description: 'Get your order quickly in unbranded packaging. Or, choose anonymous pharmacy pickup.',
    image: 'https://placehold.co/400x250',
    dataAiHint: 'delivery person'
  },
  {
    icon: Hospital,
    title: 'Partner Hospitals',
    description: 'We connect you with trusted health partners for follow-up care and support if needed.',
    image: 'https://placehold.co/400x250',
    dataAiHint: 'hospital building'
  },
  {
    icon: MapPin,
    title: 'Easy Tracking',
    description: 'Use your unique, anonymous code to track your order from our hub to your hands.',
    image: 'https://placehold.co/400x250',
    dataAiHint: 'map tracking'
  },
  {
    icon: BadgeCheck,
    title: 'Verified & Safe Tests',
    description: 'All our self-test kits are WHO-approved and sourced from trusted manufacturers.',
    image: 'https://placehold.co/400x250',
    dataAiHint: 'medical test'
  },
]

export const testimonials = [
    {
        quote: "The process was so simple and private. I didn't have to worry about anyone knowing. Got my package the next day at my hostel.",
        name: 'A. Mensah',
        role: 'Student, University of Ghana',
        avatar: 'https://placehold.co/100x100',
        dataAiHint: 'person portrait'
    },
    {
        quote: "As a young professional, my schedule is tight. Ordering online was convenient, and the pharmacy pickup option was perfect for me.",
        name: 'K. Owusu',
        role: 'Young Professional, Accra',
        avatar: 'https://placehold.co/100x100',
        dataAiHint: 'person portrait'
    },
    {
        quote: "The student discount really helped. It's great to see a service that actually considers our budget. The packaging was completely plain as promised.",
        name: 'F. Annan',
        role: 'Student, UPSA',
        avatar: 'https://placehold.co/100x100',
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
        answer: "A positive result is for information, not diagnosis. Included with your kit are instructions and a list of our trusted, confidential partner clinics (like Marie Stopes) where you can get a confirmatory test and professional counseling free of charge."
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

export const steps = [
  {
    number: '1',
    title: 'Order Your Kit',
    description: 'Select the test kit you need. Your order is anonymous and secure.',
    image: 'https://placehold.co/500x500',
    dataAiHint: 'select product'
  },
  {
    number: '2',
    title: 'Private & Fast Delivery',
    description: 'Receive your kit in a plain, unbranded package. No one will know the contents.',
    image: 'https://placehold.co/500x500',
    dataAiHint: 'discreet package'
  },
  {
    number: '3',
    title: 'Get Your Results',
    description: 'Follow the simple instructions to get your results in minutes, in complete privacy.',
    image: 'https://placehold.co/500x500',
    dataAiHint: 'person results'
  },
];


export type Order = {
  id: string;
  code: string;
  productName: string;
  status: 'received' | 'processing' | 'out_for_delivery' | 'pickup_ready' | 'completed';
  events: { status: string; date: string; note: string }[];
};

// Mock database for orders
const ordersDb: Map<string, Order> = new Map();

export const createMockOrder = (productId: number): Order => {
    const product = products.find(p => p.id === productId);
    if (!product) throw new Error('Product not found');
    
    const code = generateTrackingCode();
    const order: Order = {
        id: new Date().getTime().toString(),
        code,
        productName: product.name,
        status: 'received',
        events: [
            { status: 'Received', date: new Date().toISOString(), note: 'Your order has been received and is awaiting processing.' }
        ]
    };
    ordersDb.set(code, order);
    
    // Simulate status updates
    setTimeout(() => updateOrderStatus(code, 'processing'), 5000);
    setTimeout(() => updateOrderStatus(code, 'out_for_delivery'), 15000);
    setTimeout(() => updateOrderStatus(code, 'pickup_ready'), 30000);

    return order;
};

export const getMockOrder = (code: string): Order | undefined => {
    return ordersDb.get(code);
};

const updateOrderStatus = (code: string, newStatus: Order['status']) => {
    const order = ordersDb.get(code);
    if (order && order.status !== 'completed') {
        order.status = newStatus;
        const notes = {
            processing: 'Your kit is being prepared for dispatch.',
            out_for_delivery: 'Your order is with the delivery agent and on its way.',
            pickup_ready: 'Your order is available for pickup at the designated pharmacy.',
            completed: 'Your order has been successfully delivered/picked up.',
            received: ''
        };
        order.events.push({ status: newStatus.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), date: new Date().toISOString(), note: notes[newStatus] });
        ordersDb.set(code, order);
    }
};


export const generateTrackingCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result.replace(/(.{3})/, "$1-").replace(/(.{7})/, "$1-");
}
