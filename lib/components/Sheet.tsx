import { FC, useLayoutEffect, useRef, useState } from "react";
import type { SheetPropsContext, SheetProps } from "@lib/types.ts";
import { SheetContextProvider } from "@lib/context/context.tsx";

const Sheet: FC<SheetProps> = ({
  isOpen = false,
  activeSnapPointIndex = 0,
  wrapperElement,
  snapPoints = [],
  onClose,
  onSnap = () => null,
  noInitialAnimation = false,
  children,
}) => {
  const [present, setPresent] = useState(isOpen);
  const firstMount = useRef(true);
  const handleOnClose = () => {
    onClose();
    setPresent(false);
  };

  const callbacks = useRef({
    onSnap,
    onClose: handleOnClose,
  });

  const context: SheetPropsContext = {
    callbacks,
    isOpen,
    firstMount,
    activeSnapPointIndex,
    snapPoints,
    noInitialAnimation,
    wrapperElement,
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
