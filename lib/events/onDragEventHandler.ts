import { RefObject } from "react";
import {
  OnDragEventHandlerState,
  ScrollLock,
  SnapPointConfigObj,
  UseAnimAnimateFn,
} from "@lib/types.ts";
import { clamp, isSnapPointConfigObj } from "@lib/utils.ts";

const onDragEventHandler = (
  containerRef: RefObject<HTMLDivElement | null>,
  animate: UseAnimAnimateFn,
  state: OnDragEventHandlerState,
) => {
  const {
    movementY,
    activeSnapPoint,
    scrollY,
    scrollLock,
    elementY,
    viewHeight,
  } = state;

  if (!containerRef.current) return;

  const targetPosition = elementY.current + movementY;

  if (isSnapPointConfigObj(activeSnapPoint)) {
    if (!shouldBlockDrag(activeSnapPoint, movementY)) {
      handleScrollDrag(
        activeSnapPoint,
        movementY,
        scrollY,
        scrollLock,
        targetPosition,
        animate,
        viewHeight,
      );
    }
  } else {
    animate(targetPosition);
  }
};

// Helper functions
const shouldBlockDrag = (
  snapConfig: SnapPointConfigObj,
  movementY: number,
): boolean => {
  const direction = movementY < 0 ? "up" : movementY > 0 ? "down" : "";
  const dragConfig = snapConfig.drag;
  const isDragConfigAnObject = typeof dragConfig === "object";

  if (isDragConfigAnObject) {
    if (direction === "down") return dragConfig.down === false;
    if (direction === "up") return dragConfig.up === false;
  }

  return dragConfig === false;
};

const handleScrollDrag = (
  snapConfig: SnapPointConfigObj,
  movementY: number,
  scrollY: RefObject<number>,
  scrollLock: ScrollLock,
  targetPosition: number,
  animate: UseAnimAnimateFn,
  viewHeight: number,
) => {
  const isScrollingEnabled = snapConfig.scroll;
  const isDraggingDown = movementY > 0;
  const isAtTop = scrollY.current === 0;

  if (isScrollingEnabled && isDraggingDown && isAtTop) {
    scrollLock.current.activate();
    animate(clamp(targetPosition, 0, viewHeight));
  } else if (!isScrollingEnabled) {
    animate(clamp(targetPosition, 0, viewHeight));
  }
};

export default onDragEventHandler;
