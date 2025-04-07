import {
  animated,
  useIsomorphicLayoutEffect,
  useSpring,
} from "@react-spring/web";
import {
  Children,
  FC,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import { DragCloseThreshold, DragOffsetThreshold } from "@lib/constants.ts";
import { useDrag } from "@use-gesture/react";
import useAnim from "@lib/hooks/useAnim.ts";

const headerSnapAddedToSnapPoints = false;

const SheetContainer: FC<{ children: ReactNode }> = ({ children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const state = useSheetContext();
  const screenHeight = useScreenHeight();
  const elementY = useRef(0);

  const HeaderComponent = findHeaderComponent(children);
  const snapValues = useMemo(
    () => getSnapValues(state.snapPoints, screenHeight),
    [state.snapPoints, screenHeight],
  );

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
      snapValues[0] === screenHeight - state.dynamicHeightContent);
  const fitShitToContent = !!(contentMode && state.dynamicHeightContent);

  const activeSnapValue = !contentMode
    ? state.activeSnapPointIndex === 0 &&
      HeaderComponent &&
      state.dynamicHeightContent
      ? screenHeight - state.dynamicHeightContent
      : snapValues[state.activeSnapPointIndex]
    : snapValues[0] || 0;

  // const onHeightChange = (value: number) => {
  //   if (!Array.isArray(state.snapPoints)) {
  //     state.callbacks.current.setSnapPoints([value]);
  //   } else {
  //     if (!headerSnapAddedToSnapPoints) {
  //       state.callbacks.current.setSnapPoints([value, ...state.snapPoints]);
  //     } else {
  //       state.callbacks.current.setSnapPoints([
  //         value,
  //         ...state.snapPoints.slice(1),
  //       ]);
  //     }
  //   }
  //   headerSnapAddedToSnapPoints = true;
  //   setDynamicHeightContent(value);
  // };

  const { y, animate } = useAnim();

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

  const onDragEnd = useEffectEvent((offsetY: number) => {
    const currentY = y.get();

    if (currentY <= 0) {
      y.set(0);
    } else if (fitShitToContent && offsetY <= 0) {
      // Prevent moving the sheet to up when fitShitToContent is true since when fitShitToContent=true
      // whether the sheet is closed or opened, and it's height fits the content
      y.set(screenHeight - state.dynamicHeightContent);
    } else {
      let snapTo = 0;

      let snapToIndex;

      const sheetHeight = ref.current!.getBoundingClientRect().height;

      if (!contentMode) {
        snapToIndex = getClosestIndex(
          snapValues,
          currentY,
          offsetY,
          state.activeSnapPointIndex,
        );

        snapTo = snapValues[snapToIndex];
      } else if (currentY / sheetHeight > DragCloseThreshold) {
        // Close if dragged over enough far
        snapTo = screenHeight - sheetHeight;
      }

      snapTo = validateSnapTo({ snapTo, sheetHeight });

      // Update the spring value so that the sheet is animated to the snap point
      //api.start({ y: snapTo });

      const shouldClose = !contentMode
        ? snapToIndex === 0 &&
          state.activeSnapPointIndex == 0 &&
          offsetY > DragOffsetThreshold
        : offsetY > DragOffsetThreshold;

      // We don't call onSnap function if user has not defined any snap point
      // we add dynamic content height as snap
      if (
        !shouldClose &&
        !contentMode &&
        Array.isArray(state.snapPoints) &&
        (state.snapPoints.length > 1 ||
          state.snapPoints[0] !== screenHeight - state.dynamicHeightContent) && // make sure the only snap point is not the one we added as the dynamic content snap
        typeof state.callbacks.current.onSnap === "function" &&
        typeof snapToIndex === "number"
      ) {
        state.callbacks.current.onSnap(
          snapToIndex,
          state.snapPoints[snapToIndex],
        );
      } else if (shouldClose) {
        // call onClose after close animation os done to unmount the element
        animate(screenHeight, () => {
          state.callbacks.current.onSnap(-1, null);
          state.callbacks.current.onClose();
        });
      }
    }
  });

  const dragProps = useDrag(
    (state) => {
      if (state.first) {
        elementY.current = y.get();
        onDragStart();
      } else if (state.last) {
        onDragEnd(state.movement[1]);
      } else {
        animate(elementY.current + state.movement[1]);
      }
    },
    {
      pointer: { touch: true },
    },
  );

  useIsomorphicLayoutEffect(() => {
    animate(activeSnapValue);
  }, [activeSnapValue]);

  // to fix type issue of react-spring
  const AnimatedDiv = animated("div");
  const Sheet = (
    <AnimatedDiv
      ref={ref}
      {...dragProps()}
      style={{
        y,
        position: "absolute",
        touchAction: "none",
        top: 0,
        height: "100dvh",
        left: 0,
        right: 0,
        background: "gray",
        overflowY: "auto",
      }}
    >
      {HeaderComponent ? (
        <>
          <SheetDynamicHeightContent {...HeaderComponent.props} />
          {Children.toArray(children).slice(1)}
        </>
      ) : (
        children
      )}
    </AnimatedDiv>
  );

  if (isSSR()) return Sheet;

  return createPortal(Sheet, document.body);
};

export default SheetContainer;
