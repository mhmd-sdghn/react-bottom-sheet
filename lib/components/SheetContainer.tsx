import { animated, useIsomorphicLayoutEffect } from "@react-spring/web";
import { Children, FC, ReactNode, useMemo, useRef } from "react";
import { useSheetContext } from "../context.tsx";
import {
  findHeaderComponent,
  getActiveValue,
  isContentMode,
  isSSR,
  validateSnapTo,
} from "../utils.ts";
import SheetDynamicHeightContent from "./SheetDynamicHeightContent.tsx";
import useEffectEvent from "@lib/hooks/useEffectEvent.ts";
import { getSnapValues } from "../utils.ts";
import useScreenHeight from "@lib/hooks/useScreenHeight.tsx";
import { createPortal } from "react-dom";
import { useGesture } from "@use-gesture/react";
import useAnim from "@lib/hooks/useAnim.ts";
import {
  onDragEndEventHandler,
  onDragStartEventHandler,
} from "@lib/event-handlers.ts";

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
  const contentMode = isContentMode(
    snapValues,
    screenHeight,
    state.dynamicHeightContent,
  );

  const activeSnapValue = getActiveValue(
    snapValues,
    screenHeight,
    contentMode,
    state.activeSnapPointIndex,
    state.dynamicHeightContent,
  );

  const { y, animate } = useAnim();

  const onDragStart = useEffectEvent(() => onDragStartEventHandler(ref));

  const onDragEnd = useEffectEvent((offsetY: number) =>
    onDragEndEventHandler(
      y,
      animate,
      {
        activeSnapPointIndex: state.activeSnapPointIndex,
        snapPoints: state.snapPoints,
        dynamicHeightContent: state.dynamicHeightContent,
        screenHeight: screenHeight,
        activeSnapValue,
        contentMode,
        offsetY,
        snapValues,
      },
      state.callbacks,
    ),
  );

  const gestureProps = useGesture(
    {
      onDragStart: () => {
        elementY.current = y.get();
        onDragStart();
      },
      onDragEnd: ({ movement }) => onDragEnd(movement[1]),
      onDrag: ({ movement }) => animate(elementY.current + movement[1]),
    },
    {
      drag: {
        pointer: { touch: true },
      },
    },
  );

  useIsomorphicLayoutEffect(() => {
    animate(
      validateSnapTo({
        snapTo: activeSnapValue,
        sheetHeight: ref.current?.offsetHeight || 0,
      }),
    );
  }, [activeSnapValue]);

  // to fix type issue of react-spring
  const AnimatedDiv = animated("div");
  const Sheet = (
    <AnimatedDiv
      ref={ref}
      {...gestureProps()}
      style={{
        y,
        touchAction: state.activeSnapPointIndex === 1 ? "pan-y" : "none",
        height: contentMode ? "fit-content" : "100dvh",
        position: "absolute",
        top: 0,
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
