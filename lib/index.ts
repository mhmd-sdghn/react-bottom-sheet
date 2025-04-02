import { SnapPoint as SnapPointType } from "./types.ts";
import { default as SheetBase } from "./components/Sheet";
import SheetContainer from "@lib/components/SheetContainer.tsx";

export const Sheet = Object.assign(SheetBase, {
  Container: SheetContainer,
});

// export types
export type { SheetProps } from "./types.ts";
export type SnapPoints = SnapPointType[];
export type SnapPoint = SnapPointType;
