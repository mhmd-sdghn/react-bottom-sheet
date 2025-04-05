import { FC, ReactNode } from "react";
import { HeaderComponentId } from "@lib/constants.ts";

const SheetWithDynamicHeight: FC<{ children: ReactNode }> = ({ children }) => {
  return children;
};

SheetWithDynamicHeight.displayName = HeaderComponentId;

export default SheetWithDynamicHeight;
