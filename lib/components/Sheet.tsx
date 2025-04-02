import { FC, useRef } from "react";
import { SheetProps, SheetPropsContext } from "@lib/types.ts";
import { SheetContextProvider } from "@lib/context";

const Sheet: FC<SheetProps> = ({
  isOpen = false,
  activeSnapPointIndex = 0,
  snapPoints = [],
  onClose,
  onSnap,
  onSnapPointsUpdate,
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

  return <SheetContextProvider state={context}>wsasd</SheetContextProvider>;
};

export default Sheet;
