
'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

const stats = [
  {
    value: 'Thousands',
    label: 'Served Confidentially',
  },
  {
    value: '4+',
    label: 'Major Campuses Covered',
  },
  {
    value: '10+',
    label: 'Health Partners',
  },
];

export function TrustStats() {
  return (
    <section className="bg-background py-12 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid items-center gap-12 md:grid-cols-2 lg:gap-16">
           <motion.div 
             className="relative flex h-[350px] min-h-[300px] items-center justify-center md:h-[450px]"
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             transition={{ duration: 0.7 }}
           >
            <div className="absolute right-0 top-0 w-3/4 max-w-[320px] md:w-2/3">
              <Image
                src="https://images.unsplash.com/photo-1584012961505-507d844cc8a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxzdHVkZW50JTIwZ2hhbmF8ZW58MHx8fHwxNzU2MTQzNzg2fDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Happy student in Ghana"
                width={400}
                height={500}
                className="rounded-xl object-cover shadow-lg"
                data-ai-hint="student ghana"
              />
            </div>
            <div className="absolute bottom-0 left-0 w-2/4 max-w-[250px] md:w-1/2 transform -rotate-6">
               <Image
                src="https://images.unsplash.com/photo-1666886573553-6548db92db79?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxoZWFsdGglMjBwcm9mZXNzaW9uYWx8ZW58MHx8fHwxNzU2MTQzNzg2fDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Health professional"
                width={400}
                height={300}
                className="rounded-xl object-cover shadow-2xl border-4 border-background"
                data-ai-hint="health professional"
              />
            </div>
          </motion.div>
          <div className="space-y-8">
            <div>
              <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Trusted by students and health professionals across Ghana
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Our service is built on a foundation of <span className="font-semibold text-primary">trust, privacy, and strong community partnerships</span>.
              </p>
            </div>
            <div className="space-y-6">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-start gap-4">
                   <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xl">
                    <span className="font-bold">{stat.value.match(/\d+/)?.[0] || '✓'}</span>
                    {stat.value.includes('+') && <span>+</span>}
                  </div>
                  <div>
                    <p className="text-xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
