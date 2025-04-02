import React, { createContext, useContext, ReactNode } from "react";
import { SheetProps, SheetPropsContext } from "@lib/types.ts";

type SheetContextProviderProps = {
  children: ReactNode;
  state: SheetPropsContext;
};

type ContextProps = SheetProps;

const SheetContext = createContext<ContextProps | undefined>(undefined);

export const SheetContextProvider: React.FC<SheetContextProviderProps> = (
  props,
) => {
  return (
    <SheetContext.Provider value={props.state}>
      {props.children}
    </SheetContext.Provider>
  );
};

export const useSheetContext = (): ContextProps => {
  const context = useContext(SheetContext);
  if (context === undefined) {
    throw new Error(
      "useSheetContext must be used within a SheetContextProvider",
    );
  }
  return context;
};

export default SheetContext;
