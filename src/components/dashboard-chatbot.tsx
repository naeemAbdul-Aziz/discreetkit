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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialMessage: Message = {
    role: "model",
    parts:
      role === "admin"
        ? "Systems Intelligence online. How can I assist with DiscreetKit HQ operations today?"
        : "Pharmacy partner active. Ready to assist with order verification, riders, and stock balancing.",
  };

  useEffect(() => {
    if (history.length === 0) {
      setHistory([initialMessage]);
    }
  }, [history.length, initialMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-hidden relative">
        <ScrollArea className="h-full">
          <div className="space-y-6 p-6">
            {history.map((msg, index) => {
              const isInitial = index === 0 && msg.role === "model";

              if (isInitial) {
                return (
                  <div key={index} className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
                    <div className="h-16 w-16 rounded-full overflow-hidden shadow-sm border border-slate-100 mb-2">
                       <img src="https://res.cloudinary.com/dzfa6wqb8/image/upload/v1765475269/pacely_avator_fb9b17.png" alt="Pacely" className="h-full w-full object-cover" />
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-xs font-black tracking-[0.2em] text-slate-400 uppercase">
                         {role === "admin" ? "Systems Intelligence" : "Pharmacy Protocol"}
                      </h2>
                      <p className="text-[13px] text-slate-600 max-w-[280px] mx-auto font-medium leading-relaxed">
                        {msg.parts}
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
                    <div className="h-8 w-8 rounded-full overflow-hidden flex-shrink-0 mt-1 shadow-sm border border-brand-indigo/10">
                      <img src="https://res.cloudinary.com/dzfa6wqb8/image/upload/v1765475269/pacely_avator_fb9b17.png" alt="Pacely" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl p-4 text-sm",
                      msg.role === "user"
                        ? "bg-slate-900 text-white rounded-tr-none"
                        : "bg-slate-100 text-slate-900 rounded-tl-none font-medium"
                    )}
                  >
                    <FormattedMessage text={msg.parts} />
                  </div>
                </div>
              );
            })}
            
            {isPending && (
              <div className="flex items-start gap-3 justify-start">
                <div className="h-8 w-8 rounded-full overflow-hidden flex-shrink-0 mt-1 shadow-sm border border-brand-indigo/10">
                  <img
                    src="https://res.cloudinary.com/dzfa6wqb8/image/upload/v1765475269/pacely_avator_fb9b17.png"
                    alt="Pacely"
                    className="h-full w-full object-cover opacity-80"
                  />
                </div>
                <div className="max-w-[80%] rounded-2xl p-4 text-sm bg-brand-silver text-brand-indigo font-medium flex items-center gap-2">
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      <div className="p-4 border-t bg-white">
        <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
          <div className="relative flex-1 group">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={role === "admin" ? "Query system records..." : "Query pharmacy records..."}
              className="min-h-[52px] w-full resize-none rounded-2xl border-brand-indigo/5 bg-brand-silver/30 px-5 py-4 text-sm focus-visible:ring-brand-indigo/10 shadow-none font-medium placeholder:text-brand-indigo/30"
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
              className="absolute right-2 bottom-2 h-9 w-9 shrink-0 rounded-xl bg-brand-indigo hover:opacity-90 transition-all shadow-md group-active:scale-95"
            >
              <Send className="h-4 w-4 text-white" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
