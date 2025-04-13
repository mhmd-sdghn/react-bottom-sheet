import { RefObject } from "react";
import {
  OnDragEventHandlerState,
  ScrollLock,
  SnapPointConfigObj,
  UseAnimAnimateFn,
} from "@lib/types.ts";
import { SnapPoint } from "@lib/index.ts";

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
    if (shouldBlockDragDown(activeSnapPoint, movementY)) return;

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

const shouldBlockDragDown = (
  snapConfig: SnapPointConfigObj,
  movementY: number,
): boolean => {
  if (movementY <= 0) return false;

  const dragConfig = snapConfig.drag;
  return typeof dragConfig === "object"
    ? dragConfig.down === false
    : dragConfig === false;
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
