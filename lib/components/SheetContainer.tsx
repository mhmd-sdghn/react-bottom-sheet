import { motion, AnimatePresence } from "motion/react";
import { FC, ReactNode, useState } from "react";
import { isSSR } from "@lib/utils.ts";
import { useSheetContext } from "@lib/context.tsx";

const SheetContainer: FC<{ children: ReactNode }> = ({ children }) => {
  const state = useSheetContext();

  const [y] = useState(-100);

  return (
    <AnimatePresence>
      {state.isOpen && (
        <motion.div
          initial={!isSSR()}
          animate={{ y }}
          exit={{ y: 0 }}
          style={{
            position: "fixed",
            bottom: "-100%",
            height: "100dvh",
            left: 0,
            right: 0,
            background: "gray",
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SheetContainer;
