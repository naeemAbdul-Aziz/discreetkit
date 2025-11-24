export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold">Access Restricted</h1>
      <p className="max-w-md text-muted-foreground">
        You do not have permission to view this page. If you believe this is an
        error, please contact an administrator.
      </p>
    </main>
  )
}
