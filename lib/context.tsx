import React, { createContext, useContext, ReactNode } from "react";
import { SheetPropsContext } from "@lib/types.ts";

type SheetContextProviderProps = {
  children: ReactNode;
  state: SheetPropsContext;
};

const SheetContext = createContext<SheetPropsContext | undefined>(undefined);

export const SheetContextProvider: React.FC<SheetContextProviderProps> = (
  props,
) => {
  return (
    <SheetContext.Provider value={props.state}>
      {props.children}
    </SheetContext.Provider>
  );
};

export const useSheetContext = (): SheetPropsContext => {
  const context = useContext(SheetContext);
  if (context === undefined) {
    throw new Error(
      "useSheetContext must be used within a SheetContextProvider",
    );
  }
  return context;
};

export default SheetContext;
