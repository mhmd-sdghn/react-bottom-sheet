import { animated, useIsomorphicLayoutEffect } from "@react-spring/web";
import { Children, FC, ReactNode, useMemo, useRef } from "react";
import useSheetContext from "@lib/context/useSheetContext.tsx";
import {
  findDynamicHeightComponent,
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
import onDragEventHandler from "@lib/events/onDragEventHandler.ts";
import onDragStartEventHandler from "@lib/events/onDragStartEventHandler.ts";
import onDragEndEventHandler from "@lib/events/onDragEndEventHandler.ts";
import useScrollLock from "@lib/hooks/useScrollLock.ts";

const SheetContainer: FC<{ children: ReactNode }> = ({ children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const state = useSheetContext();
  const screenHeight = useScreenHeight();
  const scrollY = useRef(0);
  const elementY = useRef(0);
  const scrollLock = useScrollLock(ref);
  const DynamicHeightComponent = findDynamicHeightComponent(children);
  const snapValues = useMemo(
    () =>
      getSnapValues(state.snapPoints, screenHeight, !!DynamicHeightComponent),
    [state.snapPoints, screenHeight, DynamicHeightComponent],
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
  const activeSnapPoint = state.snapPoints[state.activeSnapPointIndex];

  const onDragStart = useEffectEvent(() => onDragStartEventHandler(ref));
  const onDrag = useEffectEvent((movementY: number) =>
    onDragEventHandler(ref, animate, {
      scrollY,
      scrollLock,
      activeSnapPoint,
      elementY,
      movementY,
    }),
  );
  const onDragEnd = useEffectEvent((offsetY: number) =>
    onDragEndEventHandler(
      ref,
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
        scrollY,
        scrollLock,
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
      onDrag: ({ movement, last }) => (!last ? onDrag(movement[1]) : null),
      onDragEnd: ({ movement }) => onDragEnd(movement[1]),
      onScroll: ({ values }) => {
        scrollY.current = values[1];
      },
    },
    {
      drag: {
        pointer: { touch: true },
      },
    },
  );

  useIsomorphicLayoutEffect(() => {
    // handle scroll lock when active index changes from outside.
    if (typeof activeSnapPoint === "object" && activeSnapPoint.scroll) {
      scrollLock.current.deactivate();
    } else {
      ref.current?.scroll({ top: 0, behavior: "smooth" });
      scrollLock.current.activate();
    }
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
        height: contentMode ? "fit-content" : "100dvh",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        background: "gray",
      }}
    >
      {DynamicHeightComponent ? (
        <>
          <SheetDynamicHeightContent {...DynamicHeightComponent.props} />
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
