
'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Loader, Send, User, X } from 'lucide-react';
import { handleChat } from '@/lib/actions';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { cn } from '@/lib/utils';

type Message = {
  role: 'user' | 'model';
  parts: string;
};

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const initialMessage: Message = {
      role: 'model',
      parts: "Hello! I'm your friendly assistant. How can I help you today? You can ask about our test kits, the ordering process, or delivery locations."
  };

  useEffect(() => {
    if (isOpen && history.length === 0) {
        setHistory([initialMessage]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
          top: scrollAreaRef.current.scrollHeight,
          behavior: 'smooth'
      });
    }
  }, [history]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isPending) return;

    const userMessage: Message = { role: 'user', parts: input };
    const newHistory = [...history, userMessage];
    setHistory(newHistory);
    setInput('');
    
    startTransition(async () => {
        const aiResponse = await handleChat(newHistory, input);
        setHistory(prev => [...prev, { role: 'model', parts: aiResponse }]);
    });
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
            <Button
                className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg"
                size="icon"
                aria-label="Open Chat"
            >
                <Bot className="h-7 w-7" />
            </Button>
        </SheetTrigger>
        <SheetContent className="flex w-full flex-col sm:max-w-md">
          <SheetHeader className="pr-8">
            <SheetTitle className="flex items-center gap-2">
                <Bot /> AI Assistant
            </SheetTitle>
          </SheetHeader>
           <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
          </Button>
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full" ref={scrollAreaRef}>
              <div className="space-y-4 p-4">
                {history.map((msg, index) => (
                  <div key={index} className={cn("flex items-start gap-3", msg.role === 'user' ? "justify-end" : "justify-start")}>
                    {msg.role === 'model' && (
                        <Avatar className="h-8 w-8">
                            <AvatarFallback><Bot size={20} /></AvatarFallback>
                        </Avatar>
                    )}
                    <div className={cn("max-w-[80%] rounded-lg p-3 text-sm", msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                      {msg.parts}
                    </div>
                     {msg.role === 'user' && (
                        <Avatar className="h-8 w-8">
                             <AvatarFallback><User size={20} /></AvatarFallback>
                        </Avatar>
                    )}
                  </div>
                ))}
                {isPending && (
                    <div className="flex items-start gap-3 justify-start">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback><Bot size={20} /></AvatarFallback>
                        </Avatar>
                        <div className="max-w-[80%] rounded-lg p-3 text-sm bg-muted flex items-center">
                            <Loader className="mr-2 h-4 w-4 animate-spin" /> Thinking...
                        </div>
                    </div>
                )}
              </div>
            </ScrollArea>
          </div>
          <form onSubmit={handleSubmit} className="border-t p-4">
            <div className="relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about our tests..."
                disabled={isPending}
              />
              <Button type="submit" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" disabled={isPending || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
