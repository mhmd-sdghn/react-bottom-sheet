import { RefObject } from "react";
import { OnDragEventHandlerState, UseAnimAnimateFn } from "@lib/types.ts";

const onDragEventHandler = (
  ref: RefObject<HTMLDivElement | null>,
  animate: UseAnimAnimateFn,
  {
    movementY,
    activeSnapPoint,
    scrollY,
    scrollLock,
    elementY,
  }: OnDragEventHandlerState,
) => {
  if (!ref.current) return;

  if (typeof activeSnapPoint === "object") {
    if (
      movementY > 0 &&
      (typeof activeSnapPoint.drag === "object"
        ? activeSnapPoint.drag.down === false
        : activeSnapPoint.drag === false)
    )
      return;
    if (
      movementY > 0 &&
      (typeof activeSnapPoint.drag === "object"
        ? activeSnapPoint.drag.down === false
        : activeSnapPoint.drag === false)
    )
      return;

    if (activeSnapPoint.scroll && scrollY.current === 0 && movementY > 0) {
      scrollLock.current.activate();
      animate(elementY.current + movementY);
    } else if (!activeSnapPoint.scroll) {
      animate(elementY.current + movementY);
    }
  } else {
    animate(elementY.current + movementY);
  }
};

export default onDragEventHandler;
