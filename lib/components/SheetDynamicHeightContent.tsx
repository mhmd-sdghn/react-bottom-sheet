import { FC, useRef } from "react";
import { DynamicHeightContentComponentProps } from "@lib/types.ts";
import useSheetContext from "@lib/context/useSheetContext.tsx";
import useWatchHeight from "@lib/hooks/useWatchHeight.ts";

const SheetDynamicHeightContent: FC<DynamicHeightContentComponentProps> = ({
  children,
}) => {
  const state = useSheetContext();

  const ref = useRef<HTMLDivElement>(null);

  useWatchHeight(ref, state.setDynamicHeightContent);

  return <div ref={ref}>{children}</div>;
};

export default SheetDynamicHeightContent;
