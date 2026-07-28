"use client";

import { DashboardChatbot } from "@/components/dashboard-chatbot";
import { Icon } from "@/components/ui/icon";

export default function AdminCopilotPage() {
    return (
        <div className="h-[calc(100vh-140px)] md:h-[calc(100vh-80px)] flex flex-col bg-white rounded-3xl border border-slate-200/60 overflow-hidden shadow-sm animate-in fade-in duration-500">
            {/* Pacely Header */}
            <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-white to-slate-50/50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-brand-indigo/10 flex items-center justify-center shrink-0">
                        <Icon name="auto_awesome" opticalSize={18} className="text-brand-indigo" fill />
                    </div>
                    <div>
                        <h1 className="text-sm font-black text-slate-900 tracking-tight">Pacely</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Admin Intelligence Assistant</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full border border-emerald-100">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold">Online</span>
                </div>
            </div>
            <div className="flex-1 overflow-hidden relative">
                <DashboardChatbot role="admin" />
            </div>
        </div>
    );
}
