import { motion, useSpring, type PanInfo, animate } from "motion/react";
import { Children, FC, ReactNode, useMemo, useRef, useState } from "react";
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
  TweenAnimationConfig,
} from "@lib/constants.ts";
import { SnapPoints } from "@lib/index.ts";

let headerSnapAddedToSnapPoints = false;
const SheetContainer: FC<{ children: ReactNode }> = ({ children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const state = useSheetContext();
  const screenHeight = useScreenHeight();
  // TODO move this to context
  const [dynamicHeightContent, setDynamicHeightContent] = useState(0);
  const [snapPoints, setSnapPoints] = useState<SnapPoints>(state.snapPoints)
  const HeaderComponent = findHeaderComponent(children);
  const snapValues = useMemo(() => getSnapValues(state.snapPoints, screenHeight) , [state.snapPoints ,screenHeight]);


  /**
   * When there is no snap point, we assume there is one snap point while the bottom sheet is open.
   * This can either be a full-screen height bottom sheet or
   * a snap point that fits the content height
   * based on the user configuration.
   * contentMode value is used
   * to help with this.
   */

  const contentMode =
    !snapValues.length ||
    (snapValues.length === 1 &&
      snapValues[0] === screenHeight - dynamicHeightContent);
  const fitShitToContent = !!(contentMode && dynamicHeightContent);

  const initialY = !contentMode
    ? state.activeSnapPointIndex === 0 &&
      HeaderComponent &&
      dynamicHeightContent
      ? screenHeight - dynamicHeightContent
      : snapValues[state.activeSnapPointIndex]
    : snapValues[0] || 0;

  const y = useSpring(initialY, {
    bounce: 0,
    visualDuration: 0.3,
  });

  const onHeightChange = (value: number) => {
    if (!Array.isArray(state.snapPoints)) {
      state.callbacks.current.setSnapPoints([value]);
    } else {
      if (!headerSnapAddedToSnapPoints) {
        state.callbacks.current.setSnapPoints([value, ...state.snapPoints]);
      } else {
        state.callbacks.current.setSnapPoints([
          value,
          ...state.snapPoints.slice(1),
        ]);
      }
    }
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

  const onDrag = useEffectEvent((_, { delta, offset }: PanInfo) => {

    // Make sure drag won't get out of the view
    if (Math.max(y.get() + delta.y, 0) === 0) {
      y.set(Math.max(y.get() + delta.y, 0));
    } else if (fitShitToContent && offset.y < 0) {
      y.set(screenHeight - dynamicHeightContent);
    }
  });

  const onDragEnd = useEffectEvent((_, { velocity, offset }: PanInfo) => {
    const currentY = y.get();

    if (currentY <= 0) {
      y.set(0);
    } else if (fitShitToContent && offset.y <= 0) {
      // Prevent moving the sheet to up when fitShitToContent is true since when fitShitToContent=true
      // whether the sheet is closed or opened and it's height fits the content
      y.set(screenHeight - dynamicHeightContent);
    } else {
      if (velocity.y > DragVelocityThreshold) {
        // User flicked the sheet down
        state.callbacks.current.onClose();
      } else {
        let snapTo = 0;

        let snapToIndex;

        const sheetHeight = ref.current!.getBoundingClientRect().height;

        if (!contentMode) {

          snapToIndex = getClosestIndex(
            snapValues,
            currentY,
            offset.y,
            state.activeSnapPointIndex,
          );

          snapTo = snapValues[snapToIndex];
        } else if (currentY / sheetHeight > DragCloseThreshold) {
          // Close if dragged over enough far
          snapTo = screenHeight - sheetHeight;
        }

        snapTo = validateSnapTo({ snapTo, sheetHeight });

        console.log('salam ' , snapTo)
        // Update the spring value so that the sheet is animated to the snap point
        animate(y, snapTo);

        const shouldClose = !contentMode
          ? snapToIndex === 0 &&
            state.activeSnapPointIndex == 0 &&
            offset.y > DragOffsetThreshold
          : offset.y > DragOffsetThreshold;

        // We don't call onSnap function if user has not defined any snap point
        // we add dynamic content height as snap
        if (
          !shouldClose &&
          !contentMode &&
          Array.isArray(state.snapPoints) &&
          (state.snapPoints.length > 1 || state.snapPoints[0] !== (screenHeight - dynamicHeightContent)) && // make sure the only snap point is not the one we added as the dynamic content snap
          typeof state.callbacks.current.onSnap === "function" &&
          typeof snapToIndex === "number"
        ) {
          state.callbacks.current.onSnap(
            snapToIndex,
            state.snapPoints[snapToIndex],
          );
        } else if (shouldClose) {
          state.callbacks.current.onSnap(-1, null);
          state.callbacks.current.onClose();
        }
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
