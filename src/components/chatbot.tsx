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
    parts: "Hi, I'm Pacely. How can I help you?",
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
          <SheetHeader className="sticky top-0 z-50 bg-background border-b p-4">
            <SheetTitle className="flex items-center gap-2 text-[#7C3AED]">
              <Avatar className="h-8 w-8 border border-purple-100 bg-purple-50">
                <AvatarImage
                  src="https://res.cloudinary.com/dzfa6wqb8/image/upload/v1765475269/pacely_avator_fb9b17.png"
                  alt="Pacely"
                />
                <AvatarFallback className="bg-transparent text-[#7C3AED]">P</AvatarFallback>
              </Avatar>
              Pacely
            </SheetTitle>
            <SheetDescription>
              Your friendly AI assistant for DiscreetKit.
            </SheetDescription>
            <SheetClose
              className={cn("absolute right-4 top-4", closeButtonClasses)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </SheetClose>
          </SheetHeader>
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full" ref={scrollAreaRef}>
              <div className="space-y-6 p-4">
                {/* Social Proof Section */}
                <div className="flex flex-col items-center justify-center py-4 space-y-3 opacity-90">
                  <div className="flex -space-x-2">
                    {[11, 12, 13, 14, 15].map((i) => (
                      <div key={i} className="h-7 w-7 rounded-full border-2 border-background bg-muted overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?img=${i}`} alt="user" className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                    Trusted by thousands of customers
                  </p>
                </div>

                {history.map((msg, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-start gap-3",
                      msg.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {msg.role === "model" && (
                      <Avatar className="h-8 w-8 border border-border">
                        <AvatarImage
                          src="https://res.cloudinary.com/dzfa6wqb8/image/upload/v1765475269/pacely_avator_fb9b17.png"
                          alt="Pacely"
                        />
                        <AvatarFallback className="bg-transparent"></AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl p-4 text-sm shadow-sm",
                        msg.role === "user"
                          ? "bg-[#7C3AED] text-white rounded-tr-none"
                          : "bg-muted rounded-tl-none font-medium"
                      )}
                    >
                      <FormattedMessage text={msg.parts} />
                    </div>
                    {msg.role === "user" && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          <User size={20} />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {/* show a loading indicator while the ai is "thinking". */}
                {isPending && (
                  <div className="flex items-start gap-3 justify-start">
                    <Avatar className="h-8 w-8 border border-border">
                      <AvatarImage
                        src="https://res.cloudinary.com/dzfa6wqb8/image/upload/v1765475269/pacely_avator_fb9b17.png"
                        alt="Pacely"
                      />
                      <AvatarFallback className="bg-transparent"></AvatarFallback>
                    </Avatar>
                    <div className="max-w-[80%] rounded-lg p-3 text-sm bg-muted flex items-center">
                      <BrandSpinner size="sm" /> Thinking...
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="border-t p-4 space-y-4">
            {/* Suggestion Chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setInput(s);
                    // auto-height
                    const el = document.getElementById("chat-input");
                    if (el) {
                      el.style.height = "auto";
                    }
                  }}
                  className="whitespace-nowrap rounded-full border border-purple-100 bg-purple-50/50 px-3.5 py-1.5 text-xs font-medium text-[#7C3AED] hover:bg-purple-100 transition-colors shadow-sm"
                >
                  {s}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
            <div className="relative">
              <Textarea
                id="chat-input"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  // automatic height adjustment
                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.min(
                    e.target.scrollHeight,
                    120
                  )}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Ask me anything..."
                disabled={isPending}
                className="min-h-[50px] max-h-[120px] pr-12 resize-none py-3.5 px-4 rounded-xl border-purple-100 focus-visible:ring-[#7C3AED]"
                rows={1}
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-2 bottom-2 h-9 w-9 bg-[#7C3AED] hover:bg-[#6D28D9] shadow-md rounded-lg transition-all"
                disabled={isPending || !input.trim()}
              >
                {isPending ? (
                  <BrandSpinner size="sm" />
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
