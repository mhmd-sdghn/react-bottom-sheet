import type { SheetContextProviderValues } from "@lib/types.ts";
import { useContext } from "react";
import SheetContext from "@lib/context/context.tsx";

const useSheetContext = (): SheetContextProviderValues => {
  const context = useContext(SheetContext);
  if (context === undefined) {
    throw new Error(
      "useSheetContext must be used within a SheetContextProvider",
    );
  }
  return context;
};

export default useSheetContext;
