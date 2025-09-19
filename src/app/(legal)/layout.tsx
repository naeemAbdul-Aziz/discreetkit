/**
 * @file layout.tsx
 * @description the shared layout for all legal pages (e.g., privacy, terms).
 *              it provides a consistent background and padding.
 */

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-muted">
      <div className="container mx-auto max-w-4xl px-4 py-12 md:py-24">
        {children}
      </div>
    </div>
  );
}
