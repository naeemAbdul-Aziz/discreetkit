
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
          Our AI Assistant can help you with questions about our products, delivery, and privacy.
        </p>
        <Button onClick={() => setIsOpen(true)} className="mt-2">
          <MessageCircle className="mr-2 h-4 w-4" />
          Ask our AI
        </Button>
      </div>
    </div>
  );
}
