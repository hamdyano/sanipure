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
  left: { x: -120 },
  right: { x: 120 },
  up: { y: 120 },
  down: { y: -120 },
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
      viewport={{ once: true, amount: 0.2, margin: "0px 0px -40px 0px" }}
      transition={{ type: "tween", ease: "easeOut", duration: 0.75, delay }}
    >
      {children}
    </motion.div>
  );
};

export default DirectionalReveal;