/**
 * @file layout.tsx
 * @description The shared layout for the admin section. It provides a
 *              consistent container and styling for all admin pages.
 */

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-muted/40">
      <div className="container mx-auto max-w-7xl px-4 py-12 md:py-24">
        {children}
      </div>
    </div>
  );
}
