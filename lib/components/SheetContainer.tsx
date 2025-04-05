import { motion, useSpring, type PanInfo, animate } from "motion/react";
import { Children, FC, ReactNode, useRef, useState } from "react";
import { useSheetContext } from "../context.tsx";
import {
  findHeaderComponent,
  getClosestIndex,
  isSSR,
  validateSnapTo,
} from "../utils.ts";
import SheetDynamicHeightContent from "./SheetDynamicHeightContent.tsx";
import useEffectEvent from "@lib/hooks/useEffectEvent.ts";
import { getSnapValues } from "../utils.ts";
import useScreenHeight from "@lib/hooks/useScreenHeight.tsx";
import { createPortal } from "react-dom";
import {
  DragCloseThreshold,
  DragOffsetThreshold,
  DragVelocityThreshold,
  TweenAnimationConfig
} from "@lib/constants.ts";

let headerSnapAddedToSnapPoints = false;
const SheetContainer: FC<{ children: ReactNode }> = ({ children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const state = useSheetContext();
  const screenHeight = useScreenHeight();
  // TODO move this to context
  const [dynamicHeightContent, setDynamicHeightContent] = useState(0);
  const HeaderComponent = findHeaderComponent(children);

  const snapValues = getSnapValues(state.snapPoints, screenHeight);

  const initialY = state.activeSnapPointIndex === 0 && HeaderComponent && dynamicHeightContent ? (screenHeight - dynamicHeightContent) : snapValues[state.activeSnapPointIndex]



  const y = useSpring(initialY, {
    bounce: 0,
    visualDuration: 0.3,
  });

  const onHeightChange = (value: number) => {
    if (!headerSnapAddedToSnapPoints) {
      state.callbacks.current.onSnapPointsUpdate([value, ...state.snapPoints]);
    } else
      state.callbacks.current.onSnapPointsUpdate([
        value,
        ...state.snapPoints.slice(1),
      ]);
    headerSnapAddedToSnapPoints = true;
    setDynamicHeightContent(value);
  };

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
    if (y.get() <= 0) {
       y.set(0);
      return;
    }

    if (velocity.y > DragVelocityThreshold) {
      // User flicked the sheet down
      state.callbacks.current.onClose();
    } else {
      const sheetHeight = ref.current!.getBoundingClientRect().height;
      const currentY = y.get();

      let snapTo = 0;

      let snapToIndex;

      if (snapValues) {
         const snapToValues = [...snapValues];






        // Get the closest snap point

        snapToIndex = getClosestIndex(
          snapToValues,
          currentY,
          offset.y,
          state.activeSnapPointIndex,
        );

        snapTo = snapToValues[snapToIndex];
      } else if (currentY / sheetHeight > DragCloseThreshold) {
        // Close if dragged over enough far
        snapTo = sheetHeight;
      }

      snapTo = validateSnapTo({ snapTo, sheetHeight });

      // Update the spring value so that the sheet is animated to the snap point
      animate(y, snapTo);

      const shouldClose = snapToIndex === 0 &&  state.activeSnapPointIndex == 0 && offset.y > DragOffsetThreshold;


      if (!shouldClose && typeof state.callbacks.current.onSnap === "function" && typeof snapToIndex === "number") {
        state.callbacks.current.onSnap(snapToIndex, state.snapPoints[snapToIndex]);
      } else if (shouldClose) {
        state.callbacks.current.onSnap(-1, null);
        state.callbacks.current.onClose()
      }
    }
  });

  const Sheet = (
    <motion.div
      ref={ref}
      initial={{
        y: screenHeight || "100vh",
      }}
      exit={{ y: screenHeight || "100vh" }}
      animate={{
        y: initialY,
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
  );

  if (isSSR()) return Sheet;

  return createPortal(Sheet, document.body);
};

export default SheetContainer;
