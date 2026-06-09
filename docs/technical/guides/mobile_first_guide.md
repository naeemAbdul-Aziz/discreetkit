# Mobile-First Responsive Design Guide

This guide outlines the responsive design principles and implementation strategies used in the DiscreetKit project. Use this as a blueprint for building high-fidelity, premium mobile experiences.

## 1. The Mobile-First Philosophy
In this project, mobile is not an afterthought—it's the primary platform. We follow a "Mobile-First" approach, meaning:
- **Default styles are for mobile**: Base CSS classes target narrow viewports.
- **Progressive Enhancement**: We use Tailwind breakpoints (`sm:`, `md:`, `lg:`) to add complexity and space as the screen grows.
- **Touch-Optimized**: Interactive elements are sized for easy tapping (min 44px) and use active states (`active:scale-95`) for immediate feedback.

---

## 2. Breakpoint Strategy
We stick to standard Tailwind breakpoints but with specific intent for each:

| Breakpoint | Target Device | Layout Strategy |
| :--- | :--- | :--- |
| **Default** | Mobile (Portrait) | Single column, full-width components, fixed CTAs. |
| `sm` (640px) | Mobile (Landscape) | Multi-column grids (2 cols), medium padding. |
| `md` (768px) | Tablet | Sidebars become visible, grids expand to 3 cols. |
| `lg` (1024px)| Desktop | Full navigation, sticky side panels, 4+ col grids. |
| `xl` (1280px)| Large Desktop | Max container width reached, increased whitespace. |

---

## 3. Core Layout Patterns

### A. The Responsive Grid
Always use flexible grids that adapt count based on viewport.
```tsx
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
  {items.map(item => <Card key={item.id} />)}
</div>
```

### B. Adaptive UI Components
Common patterns for components that change behavior by device:

1. **Modals & Overlays**:
   - **Mobile**: Use a `Drawer` (bottom sheet) for better thumb reachability.
   - **Desktop**: Use a `Dialog` (centered modal) for focus.
   
2. **Navigation**:
   - **Mobile**: Sticky bottom navigation or a hamburger menu drawer.
   - **Desktop**: Horizontal header links.

3. **Tables**:
   - **Mobile**: Card-based lists (horizontal or vertical cards).
   - **Desktop**: Standard `<table>` structures.

---

## 4. Touch & Interaction Design
Premium feel comes from micro-interactions. Never leave an action without feedback.

- **Active States**: Use `active:scale-95` and `active:opacity-80` to simulate physical button presses.
- **Haptic Hints**: Use subtle shadows (`shadow-sm` to `shadow-lg`) to indicate elevation.
- **Loading states**: Use skeleton loaders or `Loader2` icons during async actions to maintain a "live" feel.

---

## 5. Typography & Spacing
- **Font Scaling**: Use `text-xs` to `text-lg` on mobile; bump to `text-base` to `text-xl` on desktop.
- **Consistent Gaps**: Standardize on `gap-4` (16px) for mobile lists and `gap-8` (32px) for desktop sections.
- **Line Heights**: Use `leading-tight` or `leading-snug` for headlines to keep them readable even when they wrap on small screens.

---

## 6. Implementation Checklist
- [ ] Does it overflow horizontally on a 320px screen?
- [ ] Are buttons at least 44px tall?
- [ ] Does the UI use a `Drawer` on mobile and a `Dialog` on desktop?
- [ ] Are images lazy-loaded with shimmers or placeholders?
- [ ] Is the "main" CTA sticky on mobile long-form pages?

---

> [!TIP]
> **Pro Detail**: Use `motion.div` from Framer Motion for entry animations. A subtle `fade-up` effect on page load (0.5s duration) makes the app feel significantly more premium.
