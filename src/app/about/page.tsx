
import Image from 'next/image';
import { ShieldCheck, HeartHandshake, Users } from 'lucide-react';

const stats = [
  {
    icon: Users,
    value: 'Thousands',
    label: 'Served Confidentially',
  },
  {
    icon: ShieldCheck,
    value: '100%',
    label: 'Privacy Guarantee',
  },
  {
    icon: HeartHandshake,
    value: '25+',
    label: 'Health Partners',
  },
];


export default function AboutPage() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <section className="text-center py-16 md:py-24 bg-muted">
        <div className="container mx-auto px-4">
          <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Your Health, Your Terms.
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-lg text-muted-foreground">
            We started AnonTest with a simple but powerful mission: to make essential health testing accessible, private, and stigma-free for every young person in Ghana.
          </p>
        </div>
      </section>

      {/* Image Grid Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 h-96">
                <div className="col-span-1 md:col-span-2 row-span-2 rounded-xl overflow-hidden shadow-lg group">
                    <Image
                        src="https://placehold.co/800x800"
                        alt="A discreet package being handed over"
                        width={800}
                        height={800}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        data-ai-hint="discreet package health"
                    />
                </div>
                <div className="col-span-1 rounded-xl overflow-hidden shadow-lg group">
                    <Image
                        src="https://placehold.co/600x400"
                        alt="A group of supportive friends"
                        width={600}
                        height={400}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        data-ai-hint="friends community support"
                    />
                </div>
                <div className="col-span-1 rounded-xl overflow-hidden shadow-lg group">
                    <Image
                        src="https://placehold.co/600x400"
                        alt="A trusted pharmacist"
                        width={600}
                        height={400}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        data-ai-hint="pharmacist healthcare professional"
                    />
                </div>
                <div className="col-span-1 md:col-span-2 rounded-xl overflow-hidden shadow-lg group">
                    <Image
                        src="https://placehold.co/800x400"
                        alt="A university campus in Ghana"
                        width={800}
                        height={400}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        data-ai-hint="university campus ghana"
                    />
                </div>
            </div>
        </div>
      </section>
      
      {/* Our Story Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div>
              <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Our Story: Closing the Gap</h2>
              <p className="mt-6 text-lg text-muted-foreground">
                We saw a critical gap. Too many young people in our communities were avoiding essential health tests because of fear—fear of judgment, lack of privacy, and the anxiety of walking into a clinic. Your health is personal, and seeking care should never be a source of stress.
              </p>
              <p className="mt-4 text-lg text-muted-foreground">
                That's why we created AnonTest. We leverage technology to build a bridge of trust, providing a seamless, anonymous, and supportive experience from the privacy of your own space to the confirmation of your health status.
              </p>
            </div>
            <div className="space-y-8">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <stat.icon className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-md text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
