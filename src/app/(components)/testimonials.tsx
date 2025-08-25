
import { testimonials } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function Testimonials() {
  return (
    <section className="bg-muted py-12 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            What users are saying about AnonTest
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            We're proud to provide a service that people trust.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="flex flex-col bg-background shadow-md rounded-xl">
              <CardContent className="flex-1 p-6">
                <blockquote className="text-muted-foreground">
                  "{testimonial.quote}"
                </blockquote>
              </CardContent>
              <div className="flex items-center gap-4 border-t p-6">
                 <Avatar>
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} data-ai-hint="person avatar"/>
                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
