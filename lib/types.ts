import { RefObject, ReactNode, FC, CSSProperties } from "react";
import { SnapPointDynamicValue } from "@lib/constants.ts";
import useScrollLock from "@lib/hooks/useScrollLock.ts";

export interface SnapPointConfigObj {
  value: number | typeof SnapPointDynamicValue;
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
  | typeof SnapPointDynamicValue
  | SnapPointConfigObj;

export interface SheetCallbacks {
  onClose: () => void;
  onSnap: (snapPointIndex: number, snapPoint: SnapPoint | null) => void;
}

export interface SheetProps extends SheetCallbacks {
  isOpen: boolean;
  snapPoints?: SnapPoint[] | null;
  activeSnapPointIndex?: number;
  children?: ReactNode;
  noInitialAnimation?: boolean;
}

export interface SheetContainerProps {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  wrapper?: boolean | RefObject<HTMLDivElement | null>;
  wrapperPortalElement?: Element | DocumentFragment;
  overlayColor?: string;
  onOverlayClick?: () => void;
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
  viewHeight: number;
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
  viewHeight: number;
  scrollLock: ReturnType<typeof useScrollLock>;
}

export interface SnapBehaviorParams {
  targetSnapIndex: number;
  contentMode: boolean;
  snapPoints: SnapPoint[];
  viewHeight: number;
  currentSnapIndex: number;
  offsetY: number;
  callbacks: RefObject<SheetCallbacks>;
  animate: UseAnimAnimateFn;
  activeSnapValue: number;
  state: DragEndEventHandlerFn;
}

export type SheetCompound = FC<SheetProps> & {
  Container: FC<SheetContainerProps>;
  DynamicHeight: FC<{ children: ReactNode }>;
};
