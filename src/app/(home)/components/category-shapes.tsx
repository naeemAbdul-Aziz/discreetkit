"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CategoryShapeProps {
  category: string;
  className?: string;
}

export function CategoryShape({ category, className }: CategoryShapeProps) {
  // 1. Test Kits: Vibrant Cyan/Blue with Zig-Zags (Sharp, energetic)
  if (category === "Test Kits") {
    return (
      <div
        className={cn(
          "relative w-full h-full overflow-hidden bg-[#60A5FA]",
          className,
        )}
      >
        {" "}
        {/* Blue-400 base */}
        <motion.div
          className="absolute inset-0"
          initial="rest"
          whileHover="hover"
          animate="rest"
        >
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#93C5FD" /> {/* Blue-300 */}
                <stop offset="100%" stopColor="#3B82F6" /> {/* Blue-500 */}
              </linearGradient>
            </defs>
            <rect width="200" height="200" fill="url(#grad1)" />

            {/* Zig Zags / Diamonds */}
            <motion.path
              d="M0,100 L50,50 L100,100 L150,50 L200,100 L200,150 L150,200 L100,150 L50,200 L0,150 Z"
              className="fill-[#EF4444]" // Red-500 for that pop/clash
              variants={{
                rest: { scale: 1, y: 0 },
                hover: { scale: 1.1, y: -5 },
              }}
              transition={{ duration: 0.5, type: "spring" }}
            />
            <motion.path
              d="M0,0 L50,50 L100,0 L150,50 L200,0 L200,50 L150,100 L100,50 L50,100 L0,50 Z"
              className="fill-[#FCA5A5] opacity-50" // Red-300
              variants={{
                rest: { y: 0 },
                hover: { y: 5 },
              }}
              transition={{ duration: 0.6 }}
            />
          </svg>
        </motion.div>
      </div>
    );
  }

  // 2. Condoms: Soft Pink/Rose with Organic Shapes (Warm, intimate)
  if (category === "Condoms") {
    return (
      <div
        className={cn(
          "relative w-full h-full overflow-hidden bg-[#881337]",
          className,
        )}
      >
        {" "}
        {/* Rose-900 base */}
        <motion.div
          className="absolute inset-0"
          initial="rest"
          whileHover="hover"
          animate="rest"
        >
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            <rect width="200" height="200" fill="#881337" />

            {/* Large Pink Organic Shapes */}
            <motion.path
              d="M-20,150 C30,120 50,200 100,180 C150,160 180,220 220,200 L220,220 L-20,220 Z"
              className="fill-[#fb7185]" // Rose-400
              transform="scale(1, -1) translate(0, -200)"
              initial={{ y: 0 }}
              whileHover={{ y: -10 }}
              transition={{ duration: 0.4 }}
            />

            <motion.circle
              cx="160"
              cy="40"
              r="50"
              className="fill-[#fda4af]" // Rose-300
              variants={{
                rest: { scale: 1 },
                hover: { scale: 1.2 },
              }}
              transition={{ duration: 0.5 }}
            />

            <motion.path
              d="M-10,50 Q40,10 90,50 T190,50"
              fill="none"
              stroke="#fb7185"
              strokeWidth="20"
              strokeLinecap="round"
              variants={{
                rest: { rotate: 0 },
                hover: { rotate: 5 },
              }}
            />
          </svg>
        </motion.div>
      </div>
    );
  }

  // 3. Lubricants: Smooth, flowing waves in Teal/Cyan (fluid, slick)
  if (category === "Lubricants") {
    return (
      <div
        className={cn(
          "relative w-full h-full overflow-hidden bg-[#0f766e]",
          className,
        )}
      >
        <motion.div
          className="absolute inset-0"
          initial="rest"
          whileHover="hover"
          animate="rest"
        >
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            <rect width="200" height="200" fill="#0f766e" /> {/* Teal-700 */}
            
            <motion.path
              d="M0,150 C50,120 100,180 200,130 L200,200 L0,200 Z"
              className="fill-[#2dd4bf]" // Teal-400
              variants={{
                rest: { y: 0 },
                hover: { y: -15 },
              }}
              transition={{ duration: 0.8, type: "spring" }}
            />
            <motion.path
              d="M0,170 C80,140 120,200 200,160 L200,200 L0,200 Z"
              className="fill-[#99f6e4] opacity-50" // Teal-200
              variants={{
                rest: { y: 0 },
                hover: { y: -10 },
              }}
              transition={{ duration: 0.6 }}
            />
          </svg>
        </motion.div>
      </div>
    );
  }

  // 4. Male Enhancement: Rising Amber/Gold gradients (energy, vitality)
  if (category === "Male Enhancement" || category === "Male enhancement drugs") {
    return (
      <div
        className={cn(
          "relative w-full h-full overflow-hidden bg-[#9a3412]",
          className,
        )}
      >
        <motion.div
          className="absolute inset-0"
          initial="rest"
          whileHover="hover"
          animate="rest"
        >
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            <rect width="200" height="200" fill="#9a3412" /> {/* Orange-800 */}
            
            <motion.polygon
              points="0,200 100,50 200,200"
              className="fill-[#f97316]" // Orange-500
              variants={{
                rest: { scaleY: 1, originY: "200px" as any },
                hover: { scaleY: 1.15, originY: "200px" as any },
              }}
              transition={{ duration: 0.5 }}
            />
            <motion.polygon
              points="50,200 150,100 250,200"
              className="fill-[#fdba74] opacity-60" // Orange-300
              variants={{
                rest: { scaleY: 1, originY: "200px" as any },
                hover: { scaleY: 1.2, originY: "200px" as any },
              }}
              transition={{ duration: 0.6 }}
            />
            <motion.circle
              cx="100"
              cy="50"
              r="20"
              className="fill-[#fef08a]" // Yellow-200
              variants={{
                rest: { y: 0, scale: 1 },
                hover: { y: -10, scale: 1.2 },
              }}
              transition={{ duration: 0.4 }}
            />
          </svg>
        </motion.div>
      </div>
    );
  }

  // 5. Emergency Contraceptive: Deep Indigo with striking diagonal split (urgency, calm control)
  if (category === "Emergency Contraceptive") {
    return (
      <div
        className={cn(
          "relative w-full h-full overflow-hidden bg-[#312e81]",
          className,
        )}
      >
        <motion.div
          className="absolute inset-0"
          initial="rest"
          whileHover="hover"
          animate="rest"
        >
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            <rect width="200" height="200" fill="#312e81" /> {/* Indigo-900 */}
            
            <motion.polygon
              points="0,200 200,0 200,200"
              className="fill-[#6366f1]" // Indigo-500
              variants={{
                rest: { x: 0, y: 0 },
                hover: { x: 10, y: 10 },
              }}
              transition={{ duration: 0.4 }}
            />
            <motion.line
              x1="0" y1="0" x2="200" y2="200"
              stroke="#c7d2fe" // Indigo-200
              strokeWidth="10"
              variants={{
                rest: { strokeWidth: 10 },
                hover: { strokeWidth: 15 },
              }}
              transition={{ duration: 0.3 }}
            />
            <motion.circle
              cx="50"
              cy="150"
              r="30"
              className="fill-[#818cf8]" // Indigo-400
              variants={{
                rest: { scale: 1 },
                hover: { scale: 1.2 },
              }}
              transition={{ duration: 0.5 }}
            />
          </svg>
        </motion.div>
      </div>
    );
  }

  // 3. Value Bundles: Deep Purple with Geometric Moons (Mysterious, premium)
  if (category === "Value Bundles") {
    return (
      <div
        className={cn(
          "relative w-full h-full overflow-hidden bg-[#3b0764]",
          className,
        )}
      >
        {" "}
        {/* Purple-950 */}
        <motion.div
          className="absolute inset-0"
          initial="rest"
          whileHover="hover"
          animate="rest"
        >
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            <rect width="200" height="200" fill="#3b0764" />

            {/* Semi-circles / Moons */}
            <motion.path
              // Semicircle: M startx,starty A rx,ry x-axis-rotation large-arc-flag sweep-flag endx,endy
              d="M 20,100 A 40,40 0 0 1 100,100" // Arc
              className="fill-[#a855f7]" // Purple-500
              // Actually let's do filled semicircles
            />

            <motion.path d="M0,0 L200,0 L200,200 L0,200 Z" fill="transparent" />

            {/* Repeating pattern of semicircles */}
            <motion.path
              d="M 20,50 A 40,40 0 0 1 100,50 L 100,150 A 40,40 0 0 0 20,150 Z"
              className="fill-[#d8b4fe]" // Purple-300
              variants={{
                rest: { x: 0 },
                hover: { x: 10 },
              }}
              transition={{ duration: 0.5 }}
            />

            <motion.circle
              cx="150"
              cy="150"
              r="60"
              className="fill-[#a855f7]" // Purple-500
              variants={{
                rest: { scale: 1 },
                hover: { scale: 0.9 },
              }}
              transition={{ duration: 0.4 }}
            />
          </svg>
        </motion.div>
      </div>
    );
  }

  // 4. Medication Refills: Deep Green with Blue Circles (Calm, biological)
  if (category === "Medication Refills") {
    return (
      <div
        className={cn(
          "relative w-full h-full overflow-hidden bg-[#064e3b]",
          className,
        )}
      >
        {" "}
        {/* Emerald-900 */}
        <motion.div
          className="absolute inset-0"
          initial="rest"
          whileHover="hover"
          animate="rest"
        >
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            <rect width="200" height="200" fill="#064e3b" />

            <motion.circle
              cx="100"
              cy="100"
              r="50"
              className="fill-[#38bdf8]" // Sky-400
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.5 }}
              transition={{ duration: 0.6 }}
              opacity="0.8"
            />
            <motion.circle
              cx="40"
              cy="160"
              r="60"
              className="fill-[#0ea5e9]" // Sky-500
              initial={{ x: 0 }}
              whileHover={{ x: 10 }}
              transition={{ duration: 0.5 }}
              opacity="0.9"
            />
            <motion.circle
              cx="180"
              cy="20"
              r="40"
              className="fill-[#7dd3fc]" // Sky-300
              initial={{ y: 0 }}
              whileHover={{ y: 10 }}
              transition={{ duration: 0.4 }}
              opacity="0.8"
            />
          </svg>
        </motion.div>
      </div>
    );
  }

  // Default fallback
  return <div className={cn("bg-muted", className)} />;
}
