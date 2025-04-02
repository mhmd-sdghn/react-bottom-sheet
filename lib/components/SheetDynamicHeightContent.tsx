import { FC } from "react";
import useElementHeight from "@lib/hooks/useElementHeight.ts";
import { DynamicHeightContentComponentProps } from "@lib/types.ts";

const SheetDynamicHeightContent: FC<DynamicHeightContentComponentProps> = ({
  children,
  onHeightChange,
}) => {
  const ref = useElementHeight(onHeightChange);

  return <div ref={ref}>{children}</div>;
};

export default SheetDynamicHeightContent;
