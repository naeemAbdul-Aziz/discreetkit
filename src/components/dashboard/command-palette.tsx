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
import { Home, LineChart, Package, ShoppingCart, Users, Search } from "lucide-react"

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
        className="relative hidden sm:flex h-9 w-64 items-center justify-start rounded-[0.5rem] border border-slate-200 bg-slate-50/50 px-4 py-2 text-sm text-slate-500 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] transition-all duration-200 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06)] hover:bg-white hover:text-slate-900 cursor-pointer lg:w-80"
      >
        <Search className="mr-2 h-3.5 w-3.5 opacity-70" />
        <span className="hidden lg:inline-flex text-xs font-medium tracking-wide">Search orders, pharmacies...</span>
        <span className="inline-flex lg:hidden text-xs">Search...</span>
        <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-[1.3rem] select-none items-center gap-1 rounded border bg-slate-100/80 px-1.5 font-mono text-[10px] font-bold text-slate-500 opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </div>
      
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search for orders, pharmacies..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem onSelect={() => runCommand(() => router.push("/admin/orders"))}>
              <ShoppingCart className="mr-2 h-4 w-4 text-brand-indigo" />
              <span>Recent Orders</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/admin/products"))}>
              <Package className="mr-2 h-4 w-4 text-emerald-600" />
              <span>Top Products Fast-Track</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/admin/analytics"))}>
              <LineChart className="mr-2 h-4 w-4 text-amber-500" />
              <span>Revenue Analytics</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Recent Order Identifiers (Mocked)">
            <CommandItem onSelect={() => runCommand(() => router.push("/admin/orders?search=S72-57E-Z2S"))}>
              <ShoppingCart className="mr-2 h-4 w-4 text-slate-400" />
              <div className="flex flex-col">
                <span className="font-mono text-xs font-bold">S72-57E-Z2S</span>
                <span className="text-[10px] text-slate-400">Order from naeemabdulaziz...</span>
              </div>
            </CommandItem>
             <CommandItem onSelect={() => runCommand(() => router.push("/admin/orders?search=B83-RXS-8GE"))}>
              <ShoppingCart className="mr-2 h-4 w-4 text-slate-400" />
              <div className="flex flex-col">
                <span className="font-mono text-xs font-bold">B83-RXS-8GE</span>
                <span className="text-[10px] text-slate-400">Order from naeemabdulaziz...</span>
              </div>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => runCommand(() => router.push("/admin/dashboard"))}>
              <Home className="mr-2 h-4 w-4 text-slate-400" />
              <span>Dashboard Home</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/admin/customers"))}>
              <Users className="mr-2 h-4 w-4 text-slate-400" />
              <span>Customers Directory</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
