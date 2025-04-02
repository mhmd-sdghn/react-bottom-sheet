import { motion, AnimatePresence } from "motion/react";
import { Children, FC, ReactNode, useState } from "react";
import { useSheetContext } from "../context.tsx";
import { findHeaderComponent, isSSR } from "../utils.ts";
import SheetDynamicHeightContent from "./SheetDynamicHeightContent.tsx";

const SheetContainer: FC<{ children: ReactNode }> = ({ children }) => {
  const state = useSheetContext();
  const [y] = useState(-100);
  const HeaderComponent = findHeaderComponent(children);

  const onHeightChange = () => {};

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
          {HeaderComponent ? (
            <>
              <SheetDynamicHeightContent
                onHeightChange={onHeightChange}
                {...HeaderComponent.props}
              />
              {Children.toArray(children).slice(1)}
            </>
          ) : (
            children
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SheetContainer;
