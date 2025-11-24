export const transitions = {
    spring: {
        type: "spring",
        stiffness: 400,
        damping: 30,
    },
    soft: {
        type: "spring",
        stiffness: 200,
        damping: 20,
    },
    easeOut: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1], // Custom cubic-bezier for "Apple-like" feel
    },
};

export const variants = {
    fadeUp: {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: transitions.easeOut
        },
    },
    staggerContainer: {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1,
            },
        },
    },
    scaleIn: {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: transitions.spring
        },
    },
    slideInRight: {
        hidden: { x: 20, opacity: 0 },
        visible: {
            x: 0,
            opacity: 1,
            transition: transitions.easeOut
        },
    },
};

export const hover = {
    scale: {
        scale: 1.02,
        transition: { duration: 0.2, ease: "easeInOut" },
    },
    lift: {
        y: -5,
        transition: { duration: 0.2, ease: "easeInOut" },
    },
};
