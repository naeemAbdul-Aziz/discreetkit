/**
 * @file chat-trigger.tsx
 * @description a ui component that provides a button to open the ai chatbot.
 */

'use client';

import { Button } from '@/components/ui/button';
import { useChatbot } from '@/hooks/use-chatbot';
import { MessageCircle } from 'lucide-react';

export function ChatTrigger() {
  const { setIsOpen } = useChatbot();

  return (
    <div className="flex items-center justify-center rounded-lg border-2 border-dashed bg-muted p-6 text-center">
      <div className="flex flex-col items-center gap-2">
        <h3 className="font-semibold">Have Questions?</h3>
        <p className="text-sm text-muted-foreground">
          Pacely, our AI assistant, can help with questions about products, delivery, and privacy.
        </p>
        <Button onClick={() => setIsOpen(true)} className="mt-2">
          <MessageCircle className="mr-2 h-4 w-4" />
          Ask Pacely
        </Button>
      </div>
    </div>
  );
}
