import { SnapPoint as SnapPointType } from "./types.ts";
import { default as SheetBase } from "./components/Sheet";
import SheetContainer from "./components/SheetContainer.tsx";
import SheetHeader from "./components/SheetHeader.tsx";

export const Sheet = Object.assign(SheetBase, {
  Container: SheetContainer,
  Header: SheetHeader,
});

// export types
export type SnapPoints = SnapPointType[];
export type SnapPoint = SnapPointType;
export type { SheetProps } from "./types.ts";
