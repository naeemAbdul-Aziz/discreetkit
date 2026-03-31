"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Terminal } from "lucide-react";
import { handleDashboardChat } from "@/lib/dashboard-chat-actions";
import { cn } from "@/lib/utils";

type Message = {
  role: "user" | "model";
  parts: string;
};

const FormattedMessage = ({ text }: { text: string }) => {
  const processedText = text.replace(/([^\n])\s(\d+\.\s\*\*)/g, "$1\n\n$2");
  const parts = processedText.split(/(\*\*.*?\*\*)/g);

  return (
    <span className="whitespace-pre-wrap leading-relaxed block text-sm">
      {parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={index} className="font-semibold text-foreground">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};

export function DashboardChatbot({ role }: { role: "admin" | "pharmacy" }) {
  const [history, setHistory] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const initialMessage: Message = {
    role: "model",
    parts:
      role === "admin"
        ? "Admin link established. How can I assist with platform operations today?"
        : "Pharmacy link established. Ready to assist with prescription fulfillment or stock queries.",
  };

  useEffect(() => {
    if (history.length === 0) {
      setHistory([initialMessage]);
    }
  }, [history.length, initialMessage]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [history]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isPending) return;

    const userMessage: Message = { role: "user", parts: input };
    const newHistory = [...history, userMessage];
    setHistory(newHistory);
    setInput("");

    startTransition(async () => {
      const aiResponse = await handleDashboardChat(newHistory, input, role);
      setHistory((prev) => [...prev, { role: "model", parts: aiResponse }]);
    });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl overflow-hidden shadow-sm border mt-4">
      <div className="flex-1 overflow-hidden relative">
        <ScrollArea className="h-full px-4" ref={scrollAreaRef}>
          <div className="space-y-4 py-4">
            {history.map((msg, index) => {
              const isInitial = index === 0 && msg.role === "model";

              if (isInitial) {
                return (
                  <div key={index} className="flex flex-col items-center justify-center py-6 space-y-4 text-center">
                    <div className="h-12 w-12 rounded-full overflow-hidden flex items-center justify-center bg-primary/10 border border-primary/20">
                      <Terminal className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground max-w-[250px] font-mono leading-relaxed">
                      {msg.parts}
                    </p>
                  </div>
                );
              }

              return (
                <div
                  key={index}
                  className={cn(
                    "flex max-w-[90%] md:max-w-[85%]",
                    msg.role === "user" ? "ml-auto" : "mr-auto"
                  )}
                >
                  <div
                    className={cn(
                      "px-4 py-3 rounded-2xl",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-muted text-muted-foreground rounded-tl-sm border"
                    )}
                  >
                    <FormattedMessage text={msg.parts} />
                  </div>
                </div>
              );
            })}
            
            {isPending && (
              <div className="flex mr-auto max-w-[85%]">
                <div className="px-4 py-3 rounded-2xl bg-muted rounded-tl-sm border flex gap-1 items-center h-[44px]">
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.3s]" />
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.15s]" />
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="p-4 border-t bg-white">
        <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={role === "admin" ? "Query system records..." : "Query pharmacy records..."}
            className="min-h-[52px] w-full resize-none rounded-2xl border-muted bg-muted/50 px-4 py-3.5 pr-12 text-sm focus-visible:ring-primary/20 shadow-none font-medium"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button
            type="submit"
            disabled={!input.trim() || isPending}
            size="icon"
            className="absolute right-1.5 bottom-1.5 h-10 w-10 shrink-0 rounded-xl transition-all"
          >
            <Send className="h-4 w-4 ml-0.5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
