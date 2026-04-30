"use client"

import * as React from "react"
import { Search, Filter, ArrowUpDown, X, Zap, Activity, Terminal } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface ActionBarProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  placeholder?: string
  filters?: { label: string; value: string }[]
  activeFilter?: string
  onFilterChange?: (value: string) => void
  sortOptions?: { label: string; value: string }[]
  activeSort?: string
  onSortChange?: (value: string) => void
  className?: string
}

export function ActionBar({
  searchTerm,
  onSearchChange,
  placeholder = "PROTOCOL_SEARCH...",
  filters,
  activeFilter,
  onFilterChange,
  sortOptions,
  activeSort,
  onSortChange,
  className,
}: ActionBarProps) {
  return (
    <div className={cn("flex flex-col xl:flex-row items-center gap-10 bg-slate-50/50 p-2.5 rounded-3xl border border-slate-100 transition-none mb-16", className)}>
      <div className="relative flex-1 w-full group">
        <div className="absolute left-8 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center text-slate-300 group-focus-within:text-brand-teal transition-none">
            <Search className="h-6 w-6" />
        </div>
        <Input
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-20 bg-white border-none h-16 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] placeholder:text-slate-200 shadow-sm focus-visible:ring-0"
        />
        {searchTerm && (
          <button 
            onClick={() => onSearchChange("")}
            className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-200 hover:text-slate-900 transition-none outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto px-2">
        {filters && onFilterChange && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-16 gap-4 border-none bg-white text-slate-400 font-black text-[10px] uppercase tracking-[0.25em] rounded-full px-12 hover:bg-slate-900 hover:text-white transition-none shadow-sm group/btn">
                <Filter className="h-4 w-4 transition-none" />
                <span>{activeFilter && activeFilter !== 'all' ? filters.find(f => f.value === activeFilter)?.label : "PROTOCOL_FILTER"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-4 rounded-3xl border-none shadow-2xl bg-white transition-none">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-50 mb-2">
                  <Terminal className="h-4 w-4 text-brand-teal" />
                  <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-black p-0">OPERATIONAL_FILTER</DropdownMenuLabel>
              </div>
              <div className="space-y-1">
                  {filters.map((filter) => (
                    <DropdownMenuItem 
                      key={filter.value}
                      onClick={() => onFilterChange(filter.value)}
                      className={cn(
                        "rounded-2xl px-6 py-4 cursor-pointer text-[11px] font-black uppercase tracking-widest transition-none",
                        activeFilter === filter.value ? "bg-slate-900 text-white" : "hover:bg-slate-50 focus:bg-slate-50 text-slate-400"
                      )}
                    >
                      {filter.label}
                    </DropdownMenuItem>
                  ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {sortOptions && onSortChange && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-16 gap-4 border-none bg-white text-slate-400 font-black text-[10px] uppercase tracking-[0.25em] rounded-full px-12 hover:bg-slate-900 hover:text-white transition-none shadow-sm group/btn">
                <ArrowUpDown className="h-4 w-4 transition-none" />
                <span>{activeSort ? sortOptions.find(s => s.value === activeSort)?.label : "SEQUENCE_PRIORITY"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-4 rounded-3xl border-none shadow-2xl bg-white transition-none">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-50 mb-2">
                  <Activity className="h-4 w-4 text-brand-teal" />
                  <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-black p-0">PRIORITY_SEQUENCE</DropdownMenuLabel>
              </div>
              <div className="space-y-1">
                  {sortOptions.map((option) => (
                    <DropdownMenuItem 
                      key={option.value}
                      onClick={() => onSortChange(option.value)}
                      className={cn(
                        "rounded-2xl px-6 py-4 cursor-pointer text-[11px] font-black uppercase tracking-widest transition-none",
                        activeSort === option.value ? "bg-slate-900 text-white" : "hover:bg-slate-50 focus:bg-slate-50 text-slate-400"
                      )}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}
