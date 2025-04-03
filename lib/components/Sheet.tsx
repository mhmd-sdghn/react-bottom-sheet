import { FC, useRef } from "react";
import { AnimatePresence } from "motion/react"
import { SheetPropsContext, SheetProps } from "@lib/types.ts";
import { SheetContextProvider } from "@lib/context";

const Sheet: FC<SheetProps> = ({
  isOpen = false,
  activeSnapPointIndex = 0,
  snapPoints = [],
  onClose,
  onSnap,
  onSnapPointsUpdate,
  children,
}) => {
  const callbacks = useRef({
    onSnap,
    onClose,
    onSnapPointsUpdate,
  });

  const context: SheetPropsContext = {
    callbacks,
    isOpen,
    activeSnapPointIndex,
    snapPoints,
  };

  return (
    <AnimatePresence>
      {isOpen  ? <SheetContextProvider state={context}>{children}</SheetContextProvider> : null}
    </AnimatePresence>
    
  );
};

export default Sheet;
