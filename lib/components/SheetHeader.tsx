import { FC, ReactNode } from "react";
import { HeaderComponentId } from "@lib/constants.ts";

const SheetHeader: FC<{ children: ReactNode }> = ({ children }) => {
  return children;
};

SheetHeader.displayName = HeaderComponentId;

export default SheetHeader;
