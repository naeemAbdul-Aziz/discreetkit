"use client";

import * as React from "react";
import { MoveRight } from "lucide-react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface WaitlistFormProps extends HTMLMotionProps<"form"> {
  onSuccess?: (name: string) => void;
}

import { getSupabaseClient } from "@/lib/supabase";

export function WaitlistForm({ className, onSuccess, ...props }: WaitlistFormProps) {
  const [nickname, setNickname] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
        const supabase = getSupabaseClient();
        const { error } = await supabase
            .from('waitlist')
            .insert([{ nickname, phone }]);

        if (error) throw error;

        if (onSuccess) {
            onSuccess(nickname);
        }
    } catch (error) {
        console.error('Error joining waitlist:', error);
        alert("Transmission failed. Please try again.");
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
      className={cn("flex w-full max-w-sm flex-col gap-4", className)}
      {...props}
    >
      <div className="space-y-4">
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="Nicky (Nickname)"
          className="h-12 w-full border-b border-border bg-transparent px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-0"
          required
        />
        <div className="relative w-full">
            <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone Number"
            className="h-12 w-full border-b border-border bg-transparent px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-0"
            required
            />
            <button
            type="submit"
            disabled={isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
            {isLoading ? (
                <span className="animate-pulse">...</span>
            ) : (
                <MoveRight className="h-4 w-4" />
            )}
            </button>
        </div>
        <p className="text-[10px] text-muted-foreground/60 text-center px-2">
            Used only to signal when we launch. Encrypted & never shared.
        </p>
      </div>
    </motion.form>
  );
}
