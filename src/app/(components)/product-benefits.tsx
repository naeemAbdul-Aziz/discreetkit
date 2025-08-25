
import { productBenefits } from '@/lib/data';

export function ProductBenefits() {
  return (
    <section className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-y-4 gap-x-8 justify-items-center">
          {productBenefits.map((benefit) => (
            <div key={benefit.title} className="flex items-center gap-3 text-center md:text-left">
              <benefit.icon className="h-6 w-6 flex-shrink-0" />
              <span className="font-medium text-sm">{benefit.title}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
