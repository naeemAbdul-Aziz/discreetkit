
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MapPin } from 'lucide-react';

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
  return (
    <section id="contact" className="bg-muted py-12 md:py-24">
      <div className="container mx-auto max-w-2xl px-4 md:px-6">
        <div className="grid gap-12 md:grid-cols-1">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
                <CardTitle className="font-headline text-3xl font-bold">Get in Touch</CardTitle>
                 <CardDescription>
                    Have questions or want to learn more? Send us a message!
                 </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input id="name" placeholder="e.g., John Smith" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Your Email</Label>
                  <Input id="email" type="email" placeholder="e.g., john.smith@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Your Message</Label>
                  <Textarea id="message" placeholder="Enter your message here..." rows={4} />
                </div>
                <Button type="submit" className="w-full">
                  <Mail />
                  Send Message
                </Button>
              </form>
              <Separator className="my-6" />
              <div className="space-y-4">
                {contactInfo.map((info) => (
                    <div key={info.title} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <info.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h4 className="font-semibold">{info.title}</h4>
                        <p className="text-sm text-muted-foreground">{info.value}</p>
                    </div>
                    </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
