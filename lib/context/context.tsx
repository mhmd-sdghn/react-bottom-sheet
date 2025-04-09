import React, { createContext, useState } from "react";
import type {
  SheetContextProviderValues,
  SheetContextProviderProps,
} from "@lib/types.ts";

const SheetContext = createContext<SheetContextProviderValues | undefined>(
  undefined,
);

export const SheetContextProvider: React.FC<SheetContextProviderProps> = (
  props,
) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [dynamicHeightContent, setDynamicHeightContent] = useState(1);

  return (
    <SheetContext.Provider
      value={{
        dynamicHeightContent,
        setDynamicHeightContent,
        isAnimating,
        setIsAnimating,
        ...props.state,
      }}
    >
      {props.children}
    </SheetContext.Provider>
  );
};

export default SheetContext;
