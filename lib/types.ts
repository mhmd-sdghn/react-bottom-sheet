import { RefObject, ReactNode } from "react";
import { SnapPointValues } from "@lib/constants.ts";
import useScrollLock from "@lib/hooks/useScrollLock.ts";

export interface SnapPointConfigObj {
  value: number | SnapPointValues.DynamicContentValue;
  scroll?: boolean;
  drag?:
    | boolean
    | {
        up?: boolean;
        down?: boolean;
      };
}

export type SnapPoint =
  | number
  | SnapPointValues.DynamicContentValue
  | SnapPointConfigObj;

export interface SheetCallbacks {
  onClose: () => void;
  onSnap: (snapPointIndex: number, snapPoint: SnapPoint | null) => void;
}

export interface SheetProps extends SheetCallbacks {
  isOpen: boolean;
  snapPoints: SnapPoint[];
  activeSnapPointIndex: number;
  children?: ReactNode;
  noInitialAnimation?: boolean;
  wrapperElement?: HTMLElement;
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
};

export interface DynamicHeightContentComponentProps {
  children?: ReactNode;
}

export interface UseAnimAnimateFnOption {
  jump?: boolean;
}

export type UseAnimAnimateFn = (
  _y: number,
  cb?: () => void,
  options?: UseAnimAnimateFnOption,
) => void;

export type ScrollLock = ReturnType<typeof useScrollLock>;

export interface DragEndEventHandlerFn {
  offsetY: number;
  contentMode: boolean;
  screenHeight: number;
  dynamicHeightContent: number;
  snapValues: number[];
  activeSnapPointIndex: number;
  snapPoints: SnapPoint[];
  activeSnapValue: number;
  scrollLock: ScrollLock;
  scrollY: RefObject<number>;
}

export interface OnDragEventHandlerState {
  movementY: number;
  activeSnapPoint: SnapPoint;
  elementY: RefObject<number>;
  scrollY: RefObject<number>;
  scrollLock: ReturnType<typeof useScrollLock>;
}

export interface SnapBehaviorParams {
  targetSnapIndex: number;
  contentMode: boolean;
  snapPoints: SnapPoint[];
  screenHeight: number;
  currentSnapIndex: number;
  offsetY: number;
  callbacks: RefObject<SheetCallbacks>;
  animate: UseAnimAnimateFn;
  activeSnapValue: number;
  state: DragEndEventHandlerFn;
}
