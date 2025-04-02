import { RefObject } from "react";

export type SnapPoint = number[];

export interface SheetCallbacks {
  onClose: () => void;
  onSnap: (snapPointIndex: number[], snapPoint: SnapPoint) => void;
}

export interface SheetProps extends SheetCallbacks {
  isOpen: boolean;
  snapPoints: SnapPoint;
  activeSnapPointIndex: number;
}

export type SheetPropsContext = Omit<SheetProps, keyof SheetCallbacks> & {
  callbacks: RefObject<SheetCallbacks>;
};
