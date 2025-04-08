import { getClosestIndex } from "@lib/utils.ts";
import { DragOffsetThreshold } from "@lib/constants.ts";
import {
  DragEndEventHandlerFn,
  SheetCallbacks,
  UseAnimAnimateFn,
} from "@lib/types";
import { SpringValue } from "@react-spring/web";
import { RefObject } from "react";

export const onDragStartEventHandler = (
  ref: RefObject<HTMLDivElement | null>,
) => {
  // Find focused input inside the sheet and blur it when dragging starts
  // to prevent a unique ghost caret "bug" on mobile
  const focusedElement = document.activeElement as HTMLElement | null;
  if (!focusedElement || !ref.current) return;

  const isInput =
    focusedElement.tagName === "INPUT" || focusedElement.tagName === "TEXTAREA";

  // Only blur the focused element if it's inside the sheet
  if (isInput && ref.current.contains(focusedElement)) {
    focusedElement.blur();
  }
};

export const onDragEndEventHandler = (
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
  } = state;

  const currentY = y.get();

  if (currentY <= 0) {
    y.set(0);
  } else if (contentMode && offsetY <= 0) {
    // Prevent moving the sheet to up when contentMode is true
    // so sheet height fits the content.
    y.set(screenHeight - dynamicHeightContent);
  } else {
    let snapToIndex;

    if (!contentMode) {
      snapToIndex = getClosestIndex(
        snapValues,
        currentY,
        offsetY,
        activeSnapPointIndex,
      );
    }

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
      typeof callbacks.current.onSnap === "function" &&
      typeof snapToIndex === "number"
    ) {
      if (state.activeSnapPointIndex === snapToIndex) animate(activeSnapValue);
      callbacks.current.onSnap(snapToIndex, state.snapPoints[snapToIndex]);
    } else if (shouldClose) {
      // call onClose after close animation os done to unmount the element
      animate(screenHeight, () => {
        callbacks.current.onSnap(-1, null);
        callbacks.current.onClose();
      });
    }
  }
};
