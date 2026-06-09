"use client"

import * as React from "react"
import { Icon } from "@/components/ui/icon"
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
  placeholder = "Search...",
  filters,
  activeFilter,
  onFilterChange,
  sortOptions,
  activeSort,
  onSortChange,
  className,
}: ActionBarProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm mb-6", className)}>
      <div className="relative flex-1 w-full">
        <Icon name="search" opticalSize={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-slate-50/50 border-none focus-visible:ring-1 focus-visible:ring-brand-indigo/20 h-10 transition-all rounded-lg"
        />
        {searchTerm && (
          <button 
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <Icon name="close" opticalSize={14} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        {filters && onFilterChange && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-10 gap-2 border-slate-200 text-slate-600 font-medium rounded-lg px-4 hover:bg-slate-50 transition-all">
                <Icon name="filter_list" opticalSize={16} />
                <span className="hidden lg:inline">{activeFilter ? filters.find(f => f.value === activeFilter)?.label : "Filter"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 p-1 rounded-xl">
              <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-slate-400 font-bold px-2 py-1.5">Apply Filters</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {filters.map((filter) => (
                <DropdownMenuItem 
                  key={filter.value}
                  onClick={() => onFilterChange(filter.value)}
                  className={cn(
                    "rounded-lg px-2 py-1.5 cursor-pointer",
                    activeFilter === filter.value && "bg-brand-indigo/5 text-brand-indigo font-semibold"
                  )}
                >
                  {filter.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {sortOptions && onSortChange && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-10 gap-2 border-slate-200 text-slate-600 font-medium rounded-lg px-4 hover:bg-slate-50 transition-all">
                <Icon name="swap_vert" opticalSize={16} />
                <span className="hidden lg:inline">Sort</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 p-1 rounded-xl">
              <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-slate-400 font-bold px-2 py-1.5">Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {sortOptions.map((option) => (
                <DropdownMenuItem 
                  key={option.value}
                  onClick={() => onSortChange(option.value)}
                  className={cn(
                    "rounded-lg px-2 py-1.5 cursor-pointer",
                    activeSort === option.value && "bg-brand-indigo/5 text-brand-indigo font-semibold"
                  )}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}
