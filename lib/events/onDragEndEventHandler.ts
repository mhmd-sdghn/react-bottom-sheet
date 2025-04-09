import { RefObject } from "react";
import { SpringValue } from "@react-spring/web";
import {
  DragEndEventHandlerFn,
  ScrollLock,
  SheetCallbacks,
  SnapBehaviorParams,
  UseAnimAnimateFn,
  SnapPoint,
} from "@lib/types.ts";
import { getClosestIndex } from "@lib/utils.ts";
import { DragOffsetThreshold } from "@lib/constants.ts";

const onDragEndEventHandler = (
  ref: RefObject<HTMLDivElement | null>,
  springY: SpringValue<number>,
  animate: UseAnimAnimateFn,
  state: DragEndEventHandlerFn,
  callbacks: RefObject<SheetCallbacks>,
) => {
  const {
    offsetY,
    contentMode,
    screenHeight,
    dynamicHeightContent,
    snapValues,
    activeSnapPointIndex: currentSnapIndex,
    snapPoints,
    activeSnapValue,
    scrollLock,
    scrollY,
  } = state;

  const currentPosition = springY.get();
  const shouldMaintainContentHeight = contentMode && offsetY <= 0;
  const isAtTop = currentPosition <= 0;

  if (isAtTop) {
    springY.set(0);
    return;
  }

  if (shouldMaintainContentHeight) {
    springY.set(screenHeight - dynamicHeightContent);
    return;
  }

  const targetSnapIndex = calculateTargetSnapIndex(
    contentMode,
    snapValues,
    currentPosition,
    offsetY,
    currentSnapIndex,
  );

  handleSnapBehavior({
    targetSnapIndex,
    contentMode,
    snapPoints,
    screenHeight,
    currentSnapIndex,
    offsetY,
    callbacks,
    animate,
    activeSnapValue,
    state,
  });

  updateScrollLock(
    ref,
    scrollLock,
    scrollY,
    state.snapPoints[targetSnapIndex ?? currentSnapIndex],
  );
};

// Helper functions
const calculateTargetSnapIndex = (
  contentMode: boolean,
  snapValues: number[],
  currentPosition: number,
  offsetY: number,
  currentSnapIndex: number,
) => {
  if (contentMode) return 0;

  const closestIndex = getClosestIndex(
    snapValues,
    currentPosition,
    offsetY,
    currentSnapIndex,
  );

  return clamp(closestIndex, 0, snapValues.length - 1);
};

const handleSnapBehavior = ({
  targetSnapIndex,
  contentMode,
  snapPoints,
  screenHeight,
  currentSnapIndex,
  offsetY,
  callbacks,
  animate,
  activeSnapValue,
  state,
}: SnapBehaviorParams) => {
  const shouldClose = determineShouldClose(
    contentMode,
    targetSnapIndex,
    currentSnapIndex,
    offsetY,
  );

  if (shouldClose) {
    handleCloseBehavior(
      targetSnapIndex,
      snapPoints,
      screenHeight,
      animate,
      callbacks,
    );
    return;
  }

  if (
    shouldTriggerSnapCallback(
      snapPoints,
      screenHeight,
      state.dynamicHeightContent,
    )
  ) {
    triggerSnapCallback(
      targetSnapIndex,
      currentSnapIndex,
      activeSnapValue,
      animate,
      callbacks,
      state,
    );
  }
};

const determineShouldClose = (
  contentMode: boolean,
  targetSnapIndex: number,
  currentSnapIndex: number,
  offsetY: number,
) => {
  if (contentMode) return offsetY > DragOffsetThreshold;

  return (
    targetSnapIndex === 0 &&
    currentSnapIndex === 0 &&
    offsetY > DragOffsetThreshold
  );
};

const handleCloseBehavior = (
  targetSnapIndex: number,
  snapPoints: SnapPoint[],
  screenHeight: number,
  animate: UseAnimAnimateFn,
  callbacks: RefObject<SheetCallbacks>,
) => {
  const nextSnap = snapPoints[targetSnapIndex];

  if (isDragDownDisabled(nextSnap)) return;

  animate(screenHeight, () => {
    callbacks.current.onSnap(-1, null);
    callbacks.current.onClose();
  });
};

const shouldTriggerSnapCallback = (
  snapPoints: SnapPoint[],
  screenHeight: number,
  dynamicHeight: number,
) => {
  const hasCustomSnapPoints =
    Array.isArray(snapPoints) && snapPoints.length > 0;
  const onlyDynamicSnap =
    snapPoints.length === 1 && snapPoints[0] === screenHeight - dynamicHeight;

  return hasCustomSnapPoints && !onlyDynamicSnap;
};

const triggerSnapCallback = (
  targetIndex: number,
  currentIndex: number,
  activeValue: number,
  animate: UseAnimAnimateFn,
  callbacks: RefObject<SheetCallbacks>,
  state: DragEndEventHandlerFn,
) => {
  if (currentIndex === targetIndex) {
    animate(activeValue);
  }

  if (callbacks.current.onSnap) {
    callbacks.current.onSnap(targetIndex, state.snapPoints[targetIndex]);
  }
};

const updateScrollLock = (
  ref: RefObject<HTMLDivElement | null>,
  scrollLock: ScrollLock,
  scrollY: RefObject<number>,
  snapPoint: SnapPoint,
) => {
  if (!ref.current) return;

  const shouldEnableScroll = typeof snapPoint === "object" && snapPoint.scroll;
  const needsScrollReset = scrollY.current !== 0;

  if (shouldEnableScroll) {
    scrollLock.current.deactivate();
  } else {
    if (needsScrollReset) {
      ref.current.scroll({ top: 0, behavior: "smooth" });
    }
    scrollLock.current.activate();
  }
};

const clamp = (num: number, min: number, max: number) => {
  return num <= min ? min : num >= max ? max : num;
};

const isDragDownDisabled = (snapPoint?: SnapPoint) => {
  if (!snapPoint) return false;
  if (typeof snapPoint === "number") return false;
  if (typeof snapPoint === "object" && "value" in snapPoint) {
    const dragConfig = snapPoint.drag;
    if (typeof dragConfig === "boolean") return !dragConfig;
    return dragConfig?.down === false;
  }

  return false;
};

export default onDragEndEventHandler;
