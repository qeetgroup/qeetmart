import type { Transition, Variants } from "framer-motion";

type ReduceMotion = boolean | null;

export const MOTION = {
  duration: {
    micro: 0.14,
    component: 0.18,
    page: 0.24,
  },
  ease: {
    out: "easeOut" as const,
    inOut: "easeInOut" as const,
  },
  maxStaggerWindow: 0.12,
};

export const getReducedTransition = (reduceMotion: ReduceMotion, transition: Transition): Transition => {
  if (reduceMotion !== true) {
    return transition;
  }

  return {
    ...transition,
    duration: 0.01,
    delay: 0,
  };
};

export const getFadeInUpVariants = (reduceMotion: ReduceMotion, y = 8): Variants => ({
  hidden: {
    opacity: 0,
    y: reduceMotion === true ? 0 : y,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
});

export const getStaggerDelay = (index: number, count: number): number => {
  if (count <= 1) {
    return 0;
  }
  const step = MOTION.maxStaggerWindow / (count - 1);
  return Math.min(step * index, MOTION.maxStaggerWindow);
};
