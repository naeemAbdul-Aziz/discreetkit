"use client"

import * as React from "react"
import { Trash2, CheckCircle2, MoreHorizontal, X, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
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
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className={cn(
            "fixed bottom-8 left-1/2 -translate-x-1/2 z-50",
            className
          )}
        >
          <div className="bg-slate-900 text-white rounded-2xl shadow-2xl p-2 pl-6 flex items-center gap-6 border border-white/10 backdrop-blur-md bg-opacity-90 min-w-[400px]">
            <div className="flex items-center gap-3">
              <div className="bg-brand-indigo h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black">
                {selectedCount}
              </div>
              <span className="text-sm font-bold tracking-tight">Records Selected</span>
            </div>

            <div className="h-6 w-px bg-white/10" />

            <div className="flex items-center gap-2">
              {actions.map((action, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  size="sm"
                  onClick={action.onClick}
                  className={cn(
                    "bg-transparent text-white hover:bg-white/10 h-10 px-4 gap-2 rounded-xl border border-transparent hover:border-white/20 transition-all font-semibold text-xs",
                    action.variant === "destructive" && "hover:bg-rose-500/20 hover:text-rose-400"
                  )}
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))}
            </div>

            <button
              onClick={onClear}
              className="ml-2 h-8 w-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors"
              title="Clear selection"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
