import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Test Kits | DiscreetKit Ghana',
  description: 'Shop private, WHO-approved self-test kits for HIV, Pregnancy, Syphilis, and more. Get accurate results in minutes, delivered discreetly to your door.',
};

export default function TestKitsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
