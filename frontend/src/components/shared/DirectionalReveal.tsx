import type { ReactNode } from "react";
import { motion } from "motion/react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

type Direction = "left" | "right" | "up" | "down";

interface DirectionalRevealProps {
  children: ReactNode;
  direction: Direction;
  delay?: number;
  className?: string;
}

const OFFSET_BY_DIRECTION: Record<Direction, { x?: number; y?: number }> = {
  left: { x: -80 },
  right: { x: 80 },
  up: { y: 80 },
  down: { y: -80 },
};

const DirectionalReveal = ({
  children,
  direction,
  delay = 0,
  className,
}: DirectionalRevealProps) => {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...OFFSET_BY_DIRECTION[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: false, amount: 0.3 }}
      transition={{ type: "tween", ease: "easeOut", duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  );
};

export default DirectionalReveal;