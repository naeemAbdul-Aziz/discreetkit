/**
 * @file chatbot.tsx
 * @description the main component for the ai chatbot interface. it manages chat history,
 *              handles user input, and communicates with the ai backend via a server action.
 */

"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, User, X } from "lucide-react";
import { BrandSpinner } from "@/components/brand-spinner";
import { handleChat } from "@/lib/actions";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { cn } from "@/lib/utils";
import { useChatbot } from "@/hooks/use-chatbot";
import { closeButtonClasses } from "@/components/ui/close-button";

const AbstractIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 2" opacity="0.3" />
    <circle cx="12" cy="12" r="3.5" fill="currentColor" />
    <circle cx="12" cy="4" r="1.5" fill="currentColor" />
    <circle cx="12" cy="20" r="1.5" fill="currentColor" />
    <circle cx="4" cy="12" r="1.5" fill="currentColor" />
    <circle cx="20" cy="12" r="1.5" fill="currentColor" />
    <circle cx="6.34" cy="6.34" r="1.2" fill="currentColor" />
    <circle cx="17.66" cy="17.66" r="1.2" fill="currentColor" />
    <circle cx="6.34" cy="17.66" r="1.2" fill="currentColor" />
    <circle cx="17.66" cy="6.34" r="1.2" fill="currentColor" />
  </svg>
);

// type definition for a chat message.
type Message = {
  role: "user" | "model";
  parts: string;
};

const FormattedMessage = ({ text }: { text: string }) => {
  // Ensure "1. **Title**" starts on a new line if it follows text
  // Pattern: Look for " N. **" preceded by non-newline
  const processedText = text.replace(/([^\n])\s(\d+\.\s\*\*)/g, "$1\n\n$2");

  // Split by bold markers
  const parts = processedText.split(/(\*\*.*?\*\*)/g);

  return (
    <span className="whitespace-pre-wrap leading-relaxed block">
      {parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={index} className="font-semibold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};

export function Chatbot() {
  const router = useRouter();
  const { isOpen, setIsOpen } = useChatbot();
  const [history, setHistory] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // initial message to greet the user.
  const initialMessage: Message = {
    role: "model",
    parts: "Hi, I'm **pacely**. How can I help you?",
  };

  const suggestions = [
    "How does it work?",
    "HIV Test Kit",
    "Emergency Contraception",
    "Delivery & Privacy",
  ];

  // effect to set the initial message when the chat opens.
  useEffect(() => {
    if (isOpen && history.length === 0) {
      setHistory([initialMessage]);
    }
  }, [isOpen, history.length]);

  // effect to auto-scroll to the bottom of the chat on new messages.
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [history]);

  // handles form submission when a user sends a message.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isPending) return;

    // Smart Action: Intercept "Shop" command to open the product menu
    const normalizedInput = input.trim().toLowerCase().replace(/['"]/g, "");
    if (["shop", "menu", "store", "order", "buy"].includes(normalizedInput)) {
      setIsOpen(false);
      setInput("");
      router.push("/products");
      return;
    }

    const userMessage: Message = { role: "user", parts: input };
    const newHistory = [...history, userMessage];
    setHistory(newHistory);
    setInput("");

    // use a transition to call the server action, preventing ui blocking.
    startTransition(async () => {
      const aiResponse = await handleChat(newHistory, input);
      setHistory((prev) => [...prev, { role: "model", parts: aiResponse }]);
    });
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="flex w-full flex-col sm:max-w-md p-0">
          <SheetHeader className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b px-6 py-4">
            <div className="flex flex-col items-center justify-center w-full">
              <SheetTitle className="flex flex-col items-center gap-2 text-brand-indigo font-headline">
                <div className="h-10 w-10 rounded-full bg-brand-indigo/5 flex items-center justify-center text-brand-indigo">
                  <AbstractIcon className="h-6 w-6" />
                </div>
                {/* <span className="text-lg tracking-tight">Pacely</span> */}
              </SheetTitle>
            </div>
            <SheetClose
              className={cn("absolute right-4 top-5 opacity-70 hover:opacity-100 transition-opacity", closeButtonClasses)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </SheetClose>
          </SheetHeader>
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full" ref={scrollAreaRef}>
              <div className="space-y-6 p-4">
                {history.map((msg, index) => {
                  const isInitial = index === 0 && msg.role === "model";
                  
                  if (isInitial) {
                    return (
                      <div key={index} className="flex flex-col items-center justify-center py-12 space-y-8">
                        <div className="space-y-4 text-center">
                          <div className="h-14 w-14 rounded-full bg-brand-indigo/5 flex items-center justify-center text-brand-indigo mx-auto mb-6">
                            <AbstractIcon className="h-8 w-8" />
                          </div>
                          <h2 className="text-2xl md:text-3xl font-headline tracking-tight text-brand-indigo max-w-[280px] mx-auto leading-tight">
                            Hi, I'm <span className="font-bold">pacely.</span><br />
                            How can I help you?
                          </h2>
                        </div>
                        
                        <div className="flex flex-col items-center space-y-3">
                          <div className="flex -space-x-2">
                            {[11, 12, 13, 14, 15].map((i) => (
                              <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-muted overflow-hidden">
                                <img src={`https://i.pravatar.cc/100?img=${i}`} alt="user" className="h-full w-full object-cover" />
                              </div>
                            ))}
                          </div>
                          <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-[0.1em] opacity-80">
                            Trusted by thousands of customers
                          </p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={index}
                      className={cn(
                        "flex items-start gap-3",
                        msg.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      {msg.role === "model" && (
                        <div className="h-8 w-8 rounded-full bg-brand-indigo/5 flex items-center justify-center text-brand-indigo border border-brand-indigo/10 flex-shrink-0 mt-1">
                          <AbstractIcon className="h-4 w-4" />
                        </div>
                      )}
                      <div
                        className={cn(
                          "max-w-[85%] rounded-2xl p-4 text-sm shadow-sm",
                          msg.role === "user"
                            ? "bg-brand-indigo text-white rounded-tr-none"
                            : "bg-brand-silver text-brand-indigo rounded-tl-none font-medium"
                        )}
                      >
                        <FormattedMessage text={msg.parts} />
                      </div>
                    </div>
                  );
                })}
                {/* show a loading indicator while the ai is "thinking". */}
                {isPending && (
                  <div className="flex items-start gap-3 justify-start">
                    <div className="h-8 w-8 rounded-full bg-brand-indigo/5 flex items-center justify-center text-brand-indigo border border-brand-indigo/10 flex-shrink-0 mt-1">
                      <AbstractIcon className="h-4 w-4 animate-pulse" />
                    </div>
                    <div className="max-w-[80%] rounded-2xl p-4 text-sm bg-brand-silver text-brand-indigo font-medium flex items-center gap-2">
                       Thinking...
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="border-t p-4 space-y-4">
            {/* Suggestion Chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar px-1">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setInput(s);
                    const el = document.getElementById("chat-input");
                    if (el) el.style.height = "auto";
                  }}
                  className="whitespace-nowrap rounded-full border border-brand-indigo/10 bg-brand-indigo/[0.03] px-4 py-2 text-xs font-semibold text-brand-teal hover:bg-brand-indigo/10 transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <Send className="h-3 w-3 opacity-50" />
                  {s}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="relative">
              <div className="relative flex items-center bg-brand-silver/50 rounded-full border border-brand-indigo/5 focus-within:border-brand-indigo/20 transition-all p-1.5 pl-5">
                <Textarea
                  id="chat-input"
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  placeholder="Ask me anything..."
                  disabled={isPending}
                  className="min-h-[44px] max-h-[120px] flex-1 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-brand-indigo resize-none py-2.5 px-0 text-sm placeholder:text-brand-indigo/40"
                  rows={1}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="h-10 w-10 bg-brand-indigo hover:opacity-90 shadow-md rounded-full transition-all flex-shrink-0 ml-2"
                  disabled={isPending || !input.trim()}
                >
                  {isPending ? (
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 text-white" />
                  )}
                  <span className="sr-only">Send Message</span>
                </Button>
              </div>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
