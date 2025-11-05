// src/app/(client)/layout.tsx (FIXED)
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { ChatTrigger } from '@/components/chat-trigger';
import { Chatbot } from '@/components/chatbot';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 overflow-y-auto">
        {children}
        <Footer />
      </main>
      
      <ChatTrigger />
      <Chatbot />
    </div>
  );
}
