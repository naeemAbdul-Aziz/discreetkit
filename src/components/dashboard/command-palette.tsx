"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Home, LineChart, Package, ShoppingCart, Users, Search, Terminal, Activity, Zap, Globe } from "lucide-react"
import { cn } from "@/lib/utils"

export function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  return (
    <>
      <div 
        onClick={() => setOpen(true)}
        className="relative hidden sm:flex h-11 w-64 items-center justify-start rounded-full border border-slate-100 bg-slate-50/50 px-6 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-none hover:bg-white hover:text-slate-900 hover:border-slate-200 cursor-pointer lg:w-80"
      >
        <Search className="mr-3 h-3.5 w-3.5 text-slate-300" />
        <span className="hidden lg:inline-flex">Search Nodes, Orders, Metrics...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-2 top-1.5 hidden h-8 select-none items-center gap-1 rounded-full bg-slate-900 px-3 font-mono text-[10px] font-black text-white opacity-100 sm:flex">
          <span className="text-[10px]">⌘</span>K
        </kbd>
      </div>
      
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="PROTOCOL SEARCH: ORDERS, NODES, OPERATIONAL METRICS..." />
        <CommandList>
          <CommandEmpty>Protocol search nominal. No matching nodes detected.</CommandEmpty>
          <CommandGroup heading="System Protocols">
            <CommandItem onSelect={() => runCommand(() => router.push("/admin/orders"))}>
                <div className="h-8 w-8 rounded-lg bg-brand-teal/10 flex items-center justify-center mr-3">
                    <ShoppingCart className="h-4 w-4 text-brand-teal" />
                </div>
                <span>Logistics Monitoring</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/admin/products"))}>
                <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center mr-3">
                    <Package className="h-4 w-4 text-emerald-600" />
                </div>
                <span>Inventory Synchronization</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/admin/analytics"))}>
                <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center mr-3">
                    <LineChart className="h-4 w-4 text-amber-500" />
                </div>
                <span>Intelligence Analysis</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/admin/partners"))}>
                <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center mr-3">
                    <Globe className="h-4 w-4 text-slate-900" />
                </div>
                <span>Node Network Matrix</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Recent Operational Identifiers">
            <CommandItem onSelect={() => runCommand(() => router.push("/admin/orders?search=S72-57E-Z2S"))}>
              <Terminal className="mr-4 h-4 w-4 text-slate-300" />
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-slate-900">DK-S72-57E-Z2S</span>
                <span className="text-[8px] font-black text-slate-400 tracking-[0.2em]">LOGISTICS_NODE_ID: 1024</span>
              </div>
            </CommandItem>
             <CommandItem onSelect={() => runCommand(() => router.push("/admin/orders?search=B83-RXS-8GE"))}>
              <Terminal className="mr-4 h-4 w-4 text-slate-300" />
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-slate-900">DK-B83-RXS-8GE</span>
                <span className="text-[8px] font-black text-slate-400 tracking-[0.2em]">LOGISTICS_NODE_ID: 1025</span>
              </div>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Master Navigation">
            <CommandItem onSelect={() => runCommand(() => router.push("/admin"))}>
              <Zap className="mr-4 h-4 w-4 text-brand-teal" />
              <span>Master Dashboard</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/admin/customers"))}>
              <Users className="mr-4 h-4 w-4 text-slate-400" />
              <span>Registry Directory</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
