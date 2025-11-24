export type ProtectedRoute = {
  pattern: RegExp
  roles: string[] | null // null means public
}

// Data-driven role mapping; extend as needed.
export const protectedRoutes: ProtectedRoute[] = [
  { pattern: /^\/admin(\/.*)?$/, roles: ["admin"] },
  { pattern: /^\/pharmacy(\/.*)?$/, roles: ["pharmacy", "admin"] },
  // Add more protected route patterns here
]

export function matchProtectedRoute(pathname: string): ProtectedRoute | undefined {
  return protectedRoutes.find(r => r.pattern.test(pathname))
}
