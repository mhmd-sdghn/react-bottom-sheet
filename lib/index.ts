import { SnapPoint as SnapPointType } from "./types.ts";
import { default as SheetBase } from "./components/Sheet";
import SheetContainer from "./components/SheetContainer.tsx";
import SheetWithDynamicHeight from "./components/SheetWithDynamicHeight.tsx";

export const Sheet = Object.assign(SheetBase, {
  Container: SheetContainer,
  DynamicHeight: SheetWithDynamicHeight,
});

// export types
export type SnapPoints = SnapPointType[];
export type SnapPoint = SnapPointType;
export type { SheetProps } from "./types.ts";
export { SnapPointValues } from "./constants.ts";
