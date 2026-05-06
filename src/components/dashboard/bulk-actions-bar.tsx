"use client"

import * as React from "react"
import { X, Zap, Activity, Terminal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface BulkAction {
  label: string
  onClick: () => void
  icon?: React.ReactNode
  variant?: "default" | "destructive" | "outline" | "secondary"
}

interface BulkActionsBarProps {
  selectedCount: number
  onClear: () => void
  actions: BulkAction[]
  className?: string
}

export function BulkActionsBar({
  selectedCount,
  onClear,
  actions,
  className,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      className={cn(
        "fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] transition-none",
        className
      )}
    >
      <div className="bg-slate-900 text-white rounded-full shadow-2xl p-3 pl-12 flex items-center gap-12 border border-slate-800 backdrop-blur-3xl min-w-[720px] h-20">
        <div className="flex items-center gap-8">
          <div className="bg-brand-teal text-white h-12 w-12 rounded-full flex items-center justify-center text-[12px] font-black shadow-2xl shadow-brand-teal/20">
            {selectedCount}
          </div>
          <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 block leading-none">STREAMS_CAPTURED</span>
              <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest leading-none">OPERATIONAL_BATCH_ACTIVE</p>
          </div>
        </div>

        <div className="h-10 w-px bg-slate-800" />

        <div className="flex-1 flex items-center gap-4">
          {actions.map((action, i) => (
            <Button
              key={i}
              variant="ghost"
              onClick={action.onClick}
              className={cn(
                "bg-transparent text-white hover:bg-white/5 h-14 px-12 gap-5 rounded-full font-black text-[11px] uppercase tracking-widest transition-none border-none",
                action.variant === "destructive" && "text-rose-400 hover:bg-rose-500/10 hover:text-rose-500"
              )}
            >
              {action.icon}
              {action.label.toUpperCase()}
            </Button>
          ))}
        </div>

        <div className="h-10 w-px bg-slate-800" />

        <button
          onClick={onClear}
          className="mr-3 h-14 w-14 rounded-full flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-none border-none shadow-sm outline-none"
          title="PROTOCOL_CLEAR_SELECTION"
        >
          <X className="h-7 w-7" />
        </button>
      </div>
    </div>
  )
}
