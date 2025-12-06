import { LoaderOne } from "@/components/ui/loader";

export default function Loading() {
  return (
    <div className="flex items-center justify-center w-full min-h-[60vh] bg-background/50 backdrop-blur-sm">
      <LoaderOne className="min-h-0" />
    </div>
  );
}
