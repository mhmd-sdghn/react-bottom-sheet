import React, { createContext, useContext, useState } from "react";
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

export const useSheetContext = (): SheetContextProviderValues => {
  const context = useContext(SheetContext);
  if (context === undefined) {
    throw new Error(
      "useSheetContext must be used within a SheetContextProvider",
    );
  }
  return context;
};

export default SheetContext;
