import { RefObject, ReactNode } from "react";

export type SnapPoint = number | "dynamic";

export interface SheetCallbacks {
  onClose: () => void;
  onSnap: (snapPointIndex: number, snapPoint: SnapPoint | null) => void;
  setSnapPoints: (SnapPoint: SnapPoint[]) => void;
}

export interface SheetProps extends SheetCallbacks {
  isOpen: boolean;
  snapPoints: SnapPoint[];
  activeSnapPointIndex: number;
  children?: ReactNode;
}

export type SheetPropsContext = Omit<SheetProps, keyof SheetCallbacks> & {
  callbacks: RefObject<SheetCallbacks>;
};

export type SheetContextProviderProps = {
  children: ReactNode;
  state: SheetPropsContext;
};

export type SheetContextProviderValues = SheetPropsContext & {
  dynamicHeightContent: number;
  setDynamicHeightContent: (value: number) => void;
  isAnimating: boolean;
  setIsAnimating: (value: boolean) => void;
};

export interface DynamicHeightContentComponentProps {
  children?: ReactNode;
}

export type UseAnimAnimateFn = (_y: number, cb?: () => void) => void;

export interface DragEndEventHandlerFn {
  offsetY: number;
  contentMode: boolean;
  screenHeight: number;
  dynamicHeightContent: number;
  snapValues: number[];
  activeSnapPointIndex: number;
  snapPoints: SnapPoint[];
  activeSnapValue: number;
}
