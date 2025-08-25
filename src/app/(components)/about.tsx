
import Image from 'next/image';

export function About() {
  return (
    <section className="py-12 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            About Our Company
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            We started DiscreetKit with a simple mission: to make health testing accessible, private, and stigma-free for everyone in Ghana, especially young people.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <p className="text-muted-foreground">
              Your health is personal. In a world where privacy is precious, seeking essential health services shouldn't be a source of anxiety. We saw that fear of judgment and lack of privacy were major barriers preventing people from getting the tests they needed. That's why we created a service that puts you in control.
            </p>
            <p className="text-muted-foreground">
              Our mission is to simplify communication, enhance customer engagement, and to the streamline operations. We're leveraging technology to provide a seamless and anonymous experience, from ordering to delivery. We partner with trusted health organizations and student bodies to ensure our service is not only discreet but also reliable and supportive.
            </p>
          </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <Image
                  src="https://placehold.co/400x500"
                  alt="A person looking at their phone"
                  width={400}
                  height={500}
                  className="rounded-lg shadow-lg object-cover w-full h-full"
                  data-ai-hint="person phone lifestyle"
                />
              </div>
              <div className="space-y-4">
                 <Image
                  src="https://placehold.co/400x300"
                  alt="Friends talking"
                  width={400}
                  height={300}
                  className="rounded-lg shadow-lg object-cover w-full h-full"
                  data-ai-hint="friends talking community"
                />
                 <Image
                  src="https://placehold.co/400x300"
                  alt="Discreet package"
                  width={400}
                  height={300}
                  className="rounded-lg shadow-lg object-cover w-full h-full"
                  data-ai-hint="discreet package health"
                />
              </div>
            </div>
        </div>
      </div>
    </section>
  );
}
