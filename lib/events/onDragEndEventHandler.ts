import { RefObject } from "react";
import { SpringValue } from "@react-spring/web";
import {
  DragEndEventHandlerFn,
  SheetCallbacks,
  UseAnimAnimateFn,
} from "@lib/types.ts";
import { getClosestIndex } from "@lib/utils.ts";
import { DragOffsetThreshold } from "@lib/constants.ts";

const onDragEndEventHandler = (
  ref: RefObject<HTMLDivElement | null>,
  y: SpringValue<number>,
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
    activeSnapPointIndex,
    snapPoints,
    activeSnapValue,
    scrollLock,
    scrollY,
  } = state;

  const currentY = y.get();
  let snapToIndex: number | null = null;

  if (currentY <= 0) {
    y.set(0);
  } else if (contentMode && offsetY <= 0) {
    // Prevent moving the sheet to up when contentMode is true
    // so sheet height fits the content.
    y.set(screenHeight - dynamicHeightContent);
  } else {
    if (contentMode) {
      snapToIndex = 0;
    } else {
      snapToIndex = getClosestIndex(
        snapValues,
        currentY,
        offsetY,
        activeSnapPointIndex,
      );
    }

    snapToIndex = Math.max(Math.min(snapToIndex, snapValues.length - 1), 0);

    const shouldClose = !contentMode
      ? snapToIndex === 0 &&
        activeSnapPointIndex == 0 &&
        offsetY > DragOffsetThreshold
      : offsetY > DragOffsetThreshold;

    // We don't call onSnap function if user has not defined any snap point
    // we add dynamic content height as snap
    if (
      !shouldClose &&
      !contentMode &&
      Array.isArray(snapPoints) &&
      (snapPoints.length > 1 ||
        snapPoints[0] !== screenHeight - state.dynamicHeightContent) && // make sure the only snap point is not the one we added as the dynamic content snap
      typeof callbacks.current.onSnap === "function"
    ) {
      if (state.activeSnapPointIndex === snapToIndex) animate(activeSnapValue);
      callbacks.current.onSnap(snapToIndex, state.snapPoints[snapToIndex]);
    } else if (shouldClose) {
      const nextSnapPoint = snapPoints[snapToIndex];
      if (
        snapToIndex === 0 &&
        typeof nextSnapPoint === "object" &&
        (typeof nextSnapPoint.drag === "object"
          ? nextSnapPoint.drag.down === false
          : nextSnapPoint.drag === false)
      ) {
        return;
      } else {
        // call onClose after close animation os done to unmount the element
        animate(screenHeight, () => {
          callbacks.current.onSnap(-1, null);
          callbacks.current.onClose();
        });
      }
    }
  }

  const activeIndexAfterDrag = snapToIndex ?? activeSnapPointIndex;
  const snapPointAfterDrag = state.snapPoints[activeIndexAfterDrag];

  if (ref.current) {
    if (typeof snapPointAfterDrag === "object" && snapPointAfterDrag.scroll) {
      scrollLock.current.deactivate();
    } else if (scrollY.current !== 0) {
      ref.current.scroll({ top: 0, behavior: "smooth" });
      scrollLock.current.activate();
    } else {
      scrollLock.current.activate();
    }
  }
};

export default onDragEndEventHandler;
