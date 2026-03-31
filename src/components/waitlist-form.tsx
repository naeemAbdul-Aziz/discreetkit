import * as React from "react";
import { MoveRight, Lock } from "lucide-react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface WaitlistFormProps extends HTMLMotionProps<"form"> {
  onSuccess?: (name: string) => void;
}

import { joinWaitlist } from "@/lib/actions";

export function WaitlistForm({
  className,
  onSuccess,
  ...props
}: WaitlistFormProps) {
  const [nickname, setNickname] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await joinWaitlist(nickname, phone);

      if (!result.success) {
        alert(result.message);
        setIsLoading(false);
        return;
      }

      if (onSuccess) {
        onSuccess(nickname);
      }
    } catch (error) {
      console.error("Error joining waitlist:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      onSubmit={handleSubmit}
      className={cn("flex w-full max-w-sm flex-col gap-5", className)}
      {...props}
    >
      <div className="space-y-4">
        
        <div className="relative">
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Nickname"
            className="h-14 w-full bg-[#f5f5f1] border border-black/5 rounded-[2rem] px-6 text-sm font-semibold text-foreground placeholder:text-muted-foreground/50 placeholder:font-medium focus:border-brand-indigo focus:ring-1 focus:ring-brand-indigo/20 focus:outline-none transition-all"
            required
            autoComplete="off"
          />
        </div>

        <div className="relative">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone Number"
            className="h-14 w-full bg-[#f5f5f1] border border-black/5 rounded-[2rem] px-6 text-sm font-semibold text-foreground placeholder:text-muted-foreground/50 placeholder:font-medium focus:border-brand-indigo focus:ring-1 focus:ring-brand-indigo/20 focus:outline-none transition-all"
            required
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-14 mt-4 rounded-full bg-brand-indigo hover:bg-brand-indigo/90 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {isLoading ? (
            <span className="animate-pulse">Locking In...</span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Secure Delivery Spot <MoveRight className="h-4 w-4" />
            </span>
          )}
        </Button>

        <p className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 text-center px-2 mt-4">
          <Lock className="w-3 h-3" />
          <span>Zero Spam. 100% Private.</span>
        </p>
      </div>
    </motion.form>
  );
}
