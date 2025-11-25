"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function MagneticCursor() {
	const [isHovering, setIsHovering] = useState(false);
	const cursorX = useMotionValue(-100);
	const cursorY = useMotionValue(-100);

	const springConfig = { damping: 25, stiffness: 700 };
	const cursorXSpring = useSpring(cursorX, springConfig);
	const cursorYSpring = useSpring(cursorY, springConfig);

	useEffect(() => {
		const moveCursor = (e: MouseEvent) => {
			cursorX.set(e.clientX - 16);
			cursorY.set(e.clientY - 16);
		};

		const handleMouseOver = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			if (
				target.tagName === "BUTTON" || 
				target.tagName === "A" || 
				target.closest("a") || 
				target.closest("button")
			) {
				setIsHovering(true);
			} else {
				setIsHovering(false);
			}
		};

		window.addEventListener("mousemove", moveCursor);
		window.addEventListener("mouseover", handleMouseOver);

		return () => {
			window.removeEventListener("mousemove", moveCursor);
			window.removeEventListener("mouseover", handleMouseOver);
		};
	}, [cursorX, cursorY]);

	return (
		<motion.div
			className="hidden md:block fixed top-0 left-0 w-8 h-8 rounded-full border border-primary pointer-events-none z-[9999] mix-blend-difference"
			style={{
				x: cursorXSpring,
				y: cursorYSpring,
			}}
			animate={{
				scale: isHovering ? 2.5 : 1,
				backgroundColor: isHovering ? "hsl(var(--primary))" : "transparent",
			}}
			transition={{ type: "spring", stiffness: 500, damping: 28 }}
		/>
	);
}
