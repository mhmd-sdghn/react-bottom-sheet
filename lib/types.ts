import { RefObject, ReactNode } from "react";

// interface SnapPointConfig {
//   value: number | "headerAsFirstSnapPointValue";
// }

export type SnapPoint = number;

export interface SheetCallbacks {
  onClose: () => void;
  onSnap: (snapPointIndex: number, snapPoint: SnapPoint | null) => void;
  setSnapPoints: (SnapPoint: SnapPoint[]) => void;
}

export interface SheetProps extends SheetCallbacks {
  isOpen: boolean;
  snapPoints: SnapPoint[] ;
  activeSnapPointIndex: number;
  children?: ReactNode;
}

export type SheetPropsContext = Omit<SheetProps, keyof SheetCallbacks> & {
  callbacks: RefObject<SheetCallbacks>;
};

export interface DynamicHeightContentComponentProps {
  children?: ReactNode;
  onHeightChange: (height: number) => void;
}
