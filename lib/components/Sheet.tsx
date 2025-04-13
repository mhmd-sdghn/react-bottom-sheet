import { FC, useLayoutEffect, useRef, useState } from "react";
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
  const [present, setPresent] = useState(isOpen);
  const handleOnClose = () => {
    onClose();
    setPresent(false);
  };

  const callbacks = useRef({
    onSnap,
    onClose: handleOnClose,
    setSnapPoints,
  });

  const context: SheetPropsContext = {
    callbacks,
    isOpen,
    activeSnapPointIndex,
    snapPoints,
  };

  useLayoutEffect(() => {
    if (isOpen) {
      setPresent(true);
    }
  }, [isOpen]);

  return present ? (
    <SheetContextProvider state={context}>{children}</SheetContextProvider>
  ) : null;
};

export default Sheet;
