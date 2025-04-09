import { FC, useRef } from "react";
import { SheetPropsContext, SheetProps } from "@lib/types.ts";
import { SheetContextProvider } from "@lib/context/context.tsx";

const Sheet: FC<SheetProps> = ({
  isOpen = false,
  activeSnapPointIndex = 0,
  snapPoints = [],
  onClose,
  onSnap,
  setSnapPoints,
  children,
}) => {
  const callbacks = useRef({
    onSnap,
    onClose,
    setSnapPoints,
  });

  const context: SheetPropsContext = {
    callbacks,
    isOpen,
    activeSnapPointIndex,
    snapPoints,
  };

  // TODO handle close animation (isOpen sets to false from outside)
  return isOpen ? (
    <SheetContextProvider state={context}>{children}</SheetContextProvider>
  ) : null;
};

export default Sheet;
