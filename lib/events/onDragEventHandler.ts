import { RefObject } from "react";
import {
  OnDragEventHandlerState,
  ScrollLock,
  SnapPointConfigObj,
  UseAnimAnimateFn,
  SnapPoint,
} from "@lib/types.ts";

const onDragEventHandler = (
  containerRef: RefObject<HTMLDivElement | null>,
  animate: UseAnimAnimateFn,
  state: OnDragEventHandlerState,
) => {
  const { movementY, activeSnapPoint, scrollY, scrollLock, elementY } = state;

  if (!containerRef.current) return;

  const targetPosition = elementY.current + movementY;

  if (isSnapPointConfigObj(activeSnapPoint)) {
    // TODO check for block all direction drag based on user config
    if (shouldBlockDrag(activeSnapPoint, movementY)) return;

    handleScrollDrag(
      activeSnapPoint,
      movementY,
      scrollY,
      scrollLock,
      targetPosition,
      animate,
    );
    return;
  }

  animate(targetPosition);
};

// Helper functions
const isSnapPointConfigObj = (point: SnapPoint): point is SnapPointConfigObj =>
  typeof point === "object" && "value" in point;

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
) => {
  const isScrollingEnabled = snapConfig.scroll;
  const isDraggingDown = movementY > 0;
  const isAtTop = scrollY.current === 0;

  if (isScrollingEnabled && isDraggingDown && isAtTop) {
    scrollLock.current.activate();
    animate(targetPosition);
  } else if (!isScrollingEnabled) {
    animate(targetPosition);
  }
};

export default onDragEventHandler;
