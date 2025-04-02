import { SnapPoint as SnapPointType } from "./types.ts";
import { default as SheetBase } from "./components/Sheet";

export const Sheet = Object.assign(SheetBase, {});

// export types
export type { SheetProps } from "./types.ts";
export type SnapPoints = SnapPointType[];
export type SnapPoint = SnapPointType;
