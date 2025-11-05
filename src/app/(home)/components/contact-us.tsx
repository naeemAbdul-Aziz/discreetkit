/**
 * @file contact-us.tsx
 * @description a section for users to get in touch with the company via a contact form,
 *              now including an option to suggest new products.
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MapPin, ArrowRight, Loader2, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// static contact information.
const contactInfo = [
  {
    icon: Mail,
    title: 'Email',
    value: 'support@discreetkit.com',
  },
  {
    icon: MapPin,
    title: 'Address',
    value: 'DiscreetKit HQ - Accra, Ghana',
  },
];

export function ContactUs() {
  const [isLoading, setIsLoading] = useState(false);
  const [inquiryType, setInquiryType] = useState('general');
  const { toast } = useToast();

  // handles the form submission with a simulated api call.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // simulate api call for demonstration purposes.
    setTimeout(() => {
        setIsLoading(false);
        toast({
            title: inquiryType === 'suggestion' ? "Suggestion Received!" : "Message Sent!",
            description: inquiryType === 'suggestion' 
                ? "Thank you for helping us improve our catalog." 
                : "Thanks for reaching out. We'll get back to you shortly.",
        });
        // Here you would reset the form fields
    }, 1500);
  }

  return (
    <section id="contact" className="py-12 md:py-24">
      <div className="container mx-auto max-w-6xl px-4 md:px-6">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16 items-start">
          
          {/* left column: information */}
          <div className="space-y-8">
            <div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
                    We're Here to Help
                </p>
                <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                    Get in Touch
                </h2>
                <p className="mt-4 text-base text-muted-foreground md:text-lg">
                    Have questions about our products, delivery, or how it works? Interested in partnership? Or have a product suggestion? We're here to provide answers and support.
                </p>
            </div>
            <div className="space-y-6">
                {contactInfo.map((info) => (
                    <div key={info.title} className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <info.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground">{info.title}</h4>
                        <p className="text-base text-muted-foreground">{info.value}</p>
                    </div>
                    </div>
                ))}
            </div>
          </div>

          {/* right column: form */}
          <div>
            <Card className="rounded-3xl p-4 sm:p-8 bg-card">
              <CardContent className="p-0">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="inquiry-type">What can we help you with?</Label>
                        <Select onValueChange={setInquiryType} defaultValue="general">
                            <SelectTrigger id="inquiry-type">
                                <SelectValue placeholder="Select an inquiry type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="general">General Question</SelectItem>
                                <SelectItem value="suggestion">
                                    <span className="flex items-center gap-2">
                                        <Lightbulb className="h-4 w-4" /> Product Suggestion
                                    </span>
                                </SelectItem>
                                <SelectItem value="partnership">Partnership Inquiry</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    {inquiryType !== 'suggestion' && (
                        <>
                            <div className="space-y-2">
                            <Label htmlFor="name">Your Name</Label>
                            <Input id="name" placeholder="e.g., Jane Doe" required />
                            </div>
                            <div className="space-y-2">
                            <Label htmlFor="email">Your Email</Label>
                            <Input id="email" type="email" placeholder="e.g., jane.doe@example.com" required />
                            </div>
                        </>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="message">
                          {inquiryType === 'suggestion' ? 'Your Suggestion' : 'Your Message'}
                        </Label>
                        <Textarea 
                            id="message" 
                            placeholder={inquiryType === 'suggestion' ? "I would love to see..." : "Enter your message here..."} 
                            rows={5} 
                            required 
                        />
                    </div>
                    <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                {inquiryType === 'suggestion' ? 'Submit Suggestion' : 'Send Message'}
                                <ArrowRight />
                            </>
                        )}
                    </Button>
                </form>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </section>
  );
}
