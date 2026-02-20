"use client";

import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";
import { MOTION, getReducedTransition } from "@/lib/motion";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

type ApiReferenceClientProps = {
  spec: object | string;
};

export function ApiReferenceClient({ spec }: ApiReferenceClientProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="max-w-full overflow-x-auto rounded-xl border border-border bg-card p-2 sm:p-3"
      initial={{ opacity: 0, y: reduceMotion ? 0 : 6 }}
      transition={getReducedTransition(reduceMotion, {
        duration: MOTION.duration.component,
        ease: MOTION.ease.out,
      })}
    >
      <SwaggerUI
        defaultModelsExpandDepth={-1}
        docExpansion="list"
        displayOperationId
        spec={spec}
        tryItOutEnabled
      />
    </motion.div>
  );
}
