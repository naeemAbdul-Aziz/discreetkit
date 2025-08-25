
import Image from 'next/image';
import { ShieldCheck, HeartHandshake, Users } from 'lucide-react';

const stats = [
  {
    icon: Users,
    value: '10,000+',
    label: 'People Served',
  },
  {
    icon: ShieldCheck,
    value: '100%',
    label: 'Confidentiality',
  },
  {
    icon: HeartHandshake,
    value: '25+',
    label: 'Health Partners',
  },
];


export default function AboutPage() {
  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-16 md:py-24">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Making healthcare accessible and private for everyone.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            We started AnonTest with a simple mission: to make health testing accessible, private, and stigma-free for everyone in Ghana, especially young people. Your health is personal, and seeking essential services shouldn't be a source of anxiety.
          </p>
        </div>

        {/* Image Grid */}
        <div className="mt-16 grid grid-cols-2 grid-rows-2 gap-4 md:gap-6">
           <div className="col-span-1 row-span-2 rounded-xl overflow-hidden shadow-lg">
                <Image
                    src="https://placehold.co/600x800"
                    alt="Discreet packaging"
                    width={600}
                    height={800}
                    className="w-full h-full object-cover"
                    data-ai-hint="discreet package health"
                />
            </div>
            <div className="col-span-1 row-span-1 rounded-xl overflow-hidden shadow-lg">
                 <Image
                    src="https://placehold.co/600x400"
                    alt="Friends talking"
                    width={600}
                    height={400}
                    className="w-full h-full object-cover"
                    data-ai-hint="friends talking community"
                />
            </div>
            <div className="col-span-1 row-span-1 rounded-xl overflow-hidden shadow-lg">
                 <Image
                    src="https://placehold.co/600x400"
                    alt="Pharmacist helping customer"
                    width={600}
                    height={400}
                    className="w-full h-full object-cover"
                    data-ai-hint="pharmacist customer healthcare"
                />
            </div>
        </div>

        {/* Mission & Vision Section */}
        <div className="mt-24 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Our Mission is to Empower You</h2>
            <p className="text-muted-foreground">
              We saw that fear of judgment and lack of privacy were major barriers preventing people from getting the tests they needed. That's why we created a service that puts you in control. We're leveraging technology to provide a seamless and anonymous experience, from ordering to delivery.
            </p>
             <p className="text-muted-foreground">
              We partner with trusted health organizations and student bodies to ensure our service is not only discreet but also reliable and supportive. We believe that by removing these barriers, we can empower you to take proactive steps towards a healthier life.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-md text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
