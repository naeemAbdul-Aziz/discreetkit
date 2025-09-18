
import { Lock } from 'lucide-react';

export function PartnerCareHeader() {
  return (
    <div className="text-center">
      <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground md:text-4xl">
        Your Next Step Towards Care
      </h1>
      <p className="mx-auto mt-4 max-w-3xl text-base text-muted-foreground">
        We've partnered with leading health facilities to provide you with confidential and supportive follow-up care. The choice to reach out is always yours.
      </p>
      <div className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-background px-4 py-2 text-sm text-muted-foreground">
        <Lock className="h-4 w-4 text-success" />
        <span>Your privacy is our priority.</span>
      </div>
    </div>
  );
}
