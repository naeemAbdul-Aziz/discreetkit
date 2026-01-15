/**
 * @file chatbot.tsx
 * @description the main component for the ai chatbot interface. it manages chat history,
 *              handles user input, and communicates with the ai backend via a server action.
 */

"use client";

import { useState, useRef, useEffect, useTransition } from "react";
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
  const { isOpen, setIsOpen } = useChatbot();
  const [history, setHistory] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // initial message to greet the user.
  const initialMessage: Message = {
    role: "model",
    parts:
      "Heyy there! I'm Pacely, your friendly assistant. I'm here to listen and help you get sorted discreetly. You can ask me about our test kits, ordering process, or delivery locations.",
  };

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

      // Wait for sheet to close then scroll
      setTimeout(() => {
        const productsSection = document.getElementById("products");
        if (productsSection) {
          productsSection.scrollIntoView({ behavior: "smooth" });
        }
      }, 300);
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
            <SheetTitle className="flex items-center gap-2">
              <Avatar className="h-8 w-8 border border-border">
                <AvatarImage
                  src="https://res.cloudinary.com/dzfa6wqb8/image/upload/v1765475269/pacely_avator_fb9b17.png"
                  alt="Pacely"
                />
                <AvatarFallback className="bg-transparent"></AvatarFallback>
              </Avatar>
              Pacely
            </SheetTitle>
            <SheetDescription>
              Your friendly AI assistant for questions about DiscreetKit.
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
              <div className="space-y-4 p-4">
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
                        "max-w-[80%] rounded-lg p-3 text-sm",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
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
          <form onSubmit={handleSubmit} className="border-t p-4">
            <div className="relative">
              <Textarea
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
                placeholder="Ask Pacely about our tests..."
                disabled={isPending}
                className="min-h-[44px] max-h-[120px] pr-12 resize-none py-3"
                rows={1}
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-2 bottom-1.5 h-8 w-8"
                disabled={isPending || !input.trim()}
              >
                {isPending ? (
                  <BrandSpinner size="sm" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span className="sr-only">Send Message</span>
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
