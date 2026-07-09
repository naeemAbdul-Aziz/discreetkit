"use client";

import { DashboardChatbot } from "@/components/dashboard-chatbot";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useRouter } from "next/navigation";

export default function PharmacyCopilotPage() {
    const router = useRouter();

    return (
        <div className="h-[calc(100vh-140px)] md:h-[calc(100vh-110px)] flex flex-col bg-white rounded-3xl border border-slate-200/60 overflow-hidden shadow-sm animate-in fade-in duration-500">
            <div className="p-4 border-b bg-slate-50/50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => router.back()}
                        className="h-10 w-10 rounded-xl hover:bg-slate-100"
                    >
                        <Icon name="arrow_back" opticalSize={20} />
                    </Button>
                    <div>
                        <h1 className="text-sm font-black text-slate-900 tracking-tight">Pharmacy Copilot</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pacely Protocol Assistant</p>
                    </div>
                </div>
            </div>
            <div className="flex-1 overflow-hidden relative">
                <DashboardChatbot role="pharmacy" />
            </div>
        </div>
    );
}
