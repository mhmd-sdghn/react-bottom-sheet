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
import { clamp, getClosestIndex, isSnapPointConfigObj } from "@lib/utils.ts";
import { DragOffsetThreshold } from "@lib/constants.ts";

const onDragEndEventHandler = (
  ref: RefObject<HTMLDivElement | null>,
  springY: SpringValue<number>,
  animate: UseAnimAnimateFn,
  wrapperRef: RefObject<HTMLDivElement | null>,
  state: DragEndEventHandlerFn,
  callbacks: RefObject<SheetCallbacks>,
) => {
  const {
    offsetY,
    contentMode,
    viewHeight,
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
  } else if (shouldMaintainContentHeight) {
    springY.set(viewHeight - dynamicHeightContent);
  } else {
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
      viewHeight,
      currentSnapIndex,
      offsetY,
      callbacks,
      animate,
      wrapperRef,
      activeSnapValue,
      state,
    });

    updateScrollLock(
      ref,
      scrollLock,
      scrollY,
      state.snapPoints[targetSnapIndex ?? currentSnapIndex],
    );
  }
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
  viewHeight,
  currentSnapIndex,
  offsetY,
  callbacks,
  animate,
  activeSnapValue,
  wrapperRef,
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
      viewHeight,
      animate,
      wrapperRef,
      callbacks,
    );
  } else if (
    shouldTriggerSnapCallback(
      snapPoints,
      viewHeight,
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
  viewHeight: number,
  animate: UseAnimAnimateFn,
  wrapperRef: RefObject<HTMLDivElement | null>,
  callbacks: RefObject<SheetCallbacks>,
) => {
  const nextSnap = snapPoints[targetSnapIndex];

  if (isDragDownDisabled(nextSnap)) return;

  if (wrapperRef && wrapperRef.current) {
    const overlay = wrapperRef.current.querySelector(
      "#snap-bottom-sheet-wrapper-overlay",
    ) as HTMLElement;

    if (overlay) overlay.style.backgroundColor = "";
  }

  animate(viewHeight, () => {
    if (typeof callbacks.current.onSnap === "function") {
      callbacks.current.onSnap(-1, null);
    }
    callbacks.current.onClose();
  });
};

const shouldTriggerSnapCallback = (
  snapPoints: SnapPoint[],
  viewHeight: number,
  dynamicHeight: number,
) => {
  const hasCustomSnapPoints =
    Array.isArray(snapPoints) && snapPoints.length > 0;
  const onlyDynamicSnap =
    snapPoints.length === 1 && snapPoints[0] === viewHeight - dynamicHeight;

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

  const shouldEnableScroll =
    isSnapPointConfigObj(snapPoint) && snapPoint.scroll;
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

const isDragDownDisabled = (snapPoint?: SnapPoint) => {
  if (!snapPoint) return false;
  if (typeof snapPoint === "number") return false;
  if (isSnapPointConfigObj(snapPoint)) {
    const dragConfig = snapPoint.drag;
    if (typeof dragConfig === "boolean") return !dragConfig;
    return dragConfig?.down === false;
  }

  return false;
};

export default onDragEndEventHandler;
