import { useState, useEffect } from 'react'

/**
 * Custom hook to detect media query matches
 * @param query - Media query string (e.g., "(max-width: 768px)")
 * @returns boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    
    // Set initial value
    setMatches(media.matches)

    // Create event listener
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches)
    
    // Add listener (use deprecated method for older browsers)
    if (media.addEventListener) {
      media.addEventListener('change', listener)
    } else {
      media.addListener(listener)
    }

    // Cleanup
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener)
      } else {
        media.removeListener(listener)
      }
    }
  }, [query])

  return matches
}
