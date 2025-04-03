import {
  motion,
  AnimatePresence,
  useSpring,
  type PanInfo,
  animate,
} from "motion/react";
import { Children, FC, ReactNode, useRef } from "react";
import { useSheetContext } from "../context.tsx";
import {
  findHeaderComponent,
  getClosestIndex,
  isSSR,
  validateSnapTo,
} from "../utils.ts";
import SheetDynamicHeightContent from "./SheetDynamicHeightContent.tsx";
import useEffectEvent from "@lib/hooks/useEffectEvent.ts";
import useSnapValues from "@lib/hooks/useSnapValues.ts";
import useScreenHeight from "@lib/hooks/useScreenHeight.tsx";
import { createPortal } from "react-dom";
import {
  DragCloseThreshold,
  DragVelocityThreshold,
  TweenAnimationConfig,
} from "@lib/constants.ts";

const SheetContainer: FC<{ children: ReactNode }> = ({ children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const state = useSheetContext();

  const screenHeight = useScreenHeight();

  const HeaderComponent = findHeaderComponent(children);
  const { snapValues } = useSnapValues(state.snapPoints);

  const y = useSpring(snapValues[state.activeSnapPointIndex], {
    restSpeed: 0.1,
    bounce: 0.1,
  });

  const onHeightChange = () => {};

  const onDragStart = useEffectEvent(() => {
    // Find focused input inside the sheet and blur it when dragging starts
    // to prevent a weird ghost caret "bug" on mobile
    const focusedElement = document.activeElement as HTMLElement | null;
    if (!focusedElement || !ref.current) return;

    const isInput =
      focusedElement.tagName === "INPUT" ||
      focusedElement.tagName === "TEXTAREA";

    // Only blur the focused element if it's inside the sheet
    if (isInput && ref.current.contains(focusedElement)) {
      focusedElement.blur();
    }
  });

  const onDrag = useEffectEvent((_, { delta }: PanInfo) => {
    // Make sure drag won't get out of the view
    if (Math.max(y.get() + delta.y, 0) === 0) {
      y.set(Math.max(y.get() + delta.y, 0));
    }
  });

  const onDragEnd = useEffectEvent((_, { velocity, offset }: PanInfo) => {
    if (y.get() < 0) y.set(0);

    if (velocity.y > DragVelocityThreshold) {
      // User flicked the sheet down
      state.callbacks.current.onClose();
    } else {
      const sheetHeight = ref.current!.getBoundingClientRect().height;
      const currentY = y.get();

      let snapTo = 0;

      let snapToIndex;

      if (snapValues) {
        // const snapToValues = snapValues.map(
        //   (p) => sheetHeight - Math.min(p, sheetHeight),
        // );

        // Allow snapping to the top of the sheet if detent is set to `content-height`
        // if (detent === "content-height" && !snapToValues.includes(0)) {
        //   snapToValues.unshift(0);
        // }

        // Get the closest snap point

        snapToIndex = getClosestIndex(
          snapValues,
          currentY,
          offset.y,
          state.activeSnapPointIndex,
        );

        snapTo = snapValues[snapToIndex];
      } else if (currentY / sheetHeight > DragCloseThreshold) {
        // Close if dragged over enough far
        snapTo = sheetHeight;
      }

      snapTo = validateSnapTo({ snapTo, sheetHeight });

      // Update the spring value so that the sheet is animated to the snap point
      animate(y, snapTo, {
        type: "tween",
        ease: "easeOut",
        duration: 0.2,
      });

      if (snapValues && typeof state.callbacks.current.onSnap === "function") {
        let snapIndex = snapToIndex;

        if (typeof snapIndex === "undefined") {
          const snapValue = Math.abs(Math.round(snapValues[0] - snapTo));
          snapIndex = getClosestIndex(
            snapValues,
            snapValue,
            offset.y,
            state.activeSnapPointIndex,
          );
        }

        state.callbacks.current.onSnap(snapIndex, state.snapPoints[snapIndex]);
      }

      const roundedSheetHeight = Math.round(sheetHeight);
      const shouldClose = snapTo + 2 >= roundedSheetHeight; // 2px tolerance

      if (shouldClose) state.callbacks.current.onClose();
    }
  });

  const Sheet = (
    <AnimatePresence>
      {state.isOpen && (
        <motion.div
          ref={ref}
          initial={{
            y: screenHeight || "100vh",
          }}
          exit={{ y: screenHeight || "100vh" }}
          animate={{
            y: snapValues[state.activeSnapPointIndex],
            transition: TweenAnimationConfig,
          }}
          drag="y"
          dragConstraints={{ top: 0 }}
          dragElastic={0}
          dragMomentum={false}
          dragPropagation={false}
          onDrag={onDrag}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          style={{
            y,
            position: "absolute",
            touchAction: "none",
            top: 0,
            height: "100dvh",
            left: 0,
            right: 0,
            background: "gray",
          }}
        >
          {HeaderComponent ? (
            <>
              <SheetDynamicHeightContent
                onHeightChange={onHeightChange}
                {...HeaderComponent.props}
              />
              {Children.toArray(children).slice(1)}
            </>
          ) : (
            children
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (isSSR()) return Sheet;

  return createPortal(Sheet, document.body);
};

export default SheetContainer;
