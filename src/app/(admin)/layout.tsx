/**
 * @file src/app/(admin)/layout.tsx
 * @description This is the root layout for the entire admin section.
 *              It establishes the core UI shell, including the sidebar
 *              and main content area, which is completely separate
 *              from the public-facing storefront layout.
 */
import { Toaster } from "@/components/ui/toaster";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
          <div className="flex min-h-screen w-full flex-col bg-muted/40">
            {/* TODO: Implement a shared sidebar component here */}
            <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
                {/* TODO: Implement a shared admin header component here */}
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                  {children}
                </main>
            </div>
             <Toaster />
          </div>
      </body>
    </html>
  );
}
