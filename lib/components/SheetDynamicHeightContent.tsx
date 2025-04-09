import { FC } from "react";
import useElementHeight from "@lib/hooks/useElementHeight.ts";
import { DynamicHeightContentComponentProps } from "@lib/types.ts";
import useSheetContext from "@lib/context/useSheetContext.tsx";

const SheetDynamicHeightContent: FC<DynamicHeightContentComponentProps> = ({
  children,
}) => {
  const state = useSheetContext();

  const onHeightChangeHandler = (value: number) => {
    state.setDynamicHeightContent(value);
  };

  const ref = useElementHeight(onHeightChangeHandler);

  return <div ref={ref}>{children}</div>;
};

export default SheetDynamicHeightContent;
