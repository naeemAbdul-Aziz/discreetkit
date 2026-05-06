import { cn } from "@/lib/utils";

interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string;
  fill?: boolean;
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700;
  grade?: -25 | 0 | 200;
  opticalSize?: number;
}

/**
 * Premium Material Symbols Icon Component
 * Supports variable font features: Fill, Weight, Grade, and Optical Size.
 */
export function Icon({
  name,
  fill = false,
  weight = 400,
  grade = 0,
  opticalSize = 24,
  className,
  ...props
}: IconProps) {
  return (
    <span
      className={cn("material-symbols-outlined select-none", className)}
      style={{
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' ${weight}, 'GRAD' ${grade}, 'opsz' ${opticalSize}`,
        fontSize: `${opticalSize}px`,
        width: `${opticalSize}px`,
        height: `${opticalSize}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      {...props}
    >
      {name}
    </span>
  );
}
