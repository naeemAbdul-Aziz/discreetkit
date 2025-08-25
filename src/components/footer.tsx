
import Link from 'next/link';
import { ShieldCheck, Twitter, Instagram, Facebook } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <ShieldCheck className="h-6 w-6 text-green-600" />
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built for privacy and peace of mind. &copy; {new Date().getFullYear()} DiscreetKit Ghana.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
            Terms of Service
          </Link>
          <div className="flex gap-2">
             <Link href="#" className="text-muted-foreground hover:text-foreground"><Twitter size={18} /></Link>
             <Link href="#" className="text-muted-foreground hover:text-foreground"><Instagram size={18} /></Link>
             <Link href="#" className="text-muted-foreground hover:text-foreground"><Facebook size={18} /></Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
