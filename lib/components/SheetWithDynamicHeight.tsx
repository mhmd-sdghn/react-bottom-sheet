import { FC, ReactNode } from "react";
import { DynamicHeightComponentId } from "@lib/constants.ts";

const SheetWithDynamicHeight: FC<{ children: ReactNode }> = ({ children }) => {
  return children;
};

SheetWithDynamicHeight.displayName = DynamicHeightComponentId;

export default SheetWithDynamicHeight;
