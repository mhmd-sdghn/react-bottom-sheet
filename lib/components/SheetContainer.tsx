import { animated, useIsomorphicLayoutEffect } from "@react-spring/web";
import { Children, FC, useMemo, useRef } from "react";
import useSheetContext from "@lib/context/useSheetContext.tsx";
import {
  findDynamicHeightComponent,
  getActiveValue,
  isContentMode,
  isSSR,
  validateSnapTo,
  getSnapValues,
  getActiveSnapPoint,
} from "../utils.ts";
import SheetDynamicHeightContent from "./SheetDynamicHeightContent.tsx";
import useEffectEvent from "@lib/hooks/useEffectEvent.ts";
import { createPortal } from "react-dom";
import { useGesture } from "@use-gesture/react";
import useAnim from "@lib/hooks/useAnim.ts";
import onDragEventHandler from "@lib/events/onDragEventHandler.ts";
import onDragStartEventHandler from "@lib/events/onDragStartEventHandler.ts";
import onDragEndEventHandler from "@lib/events/onDragEndEventHandler.ts";
import useScrollLock from "@lib/hooks/useScrollLock.ts";
import useWatchHeight from "@lib/hooks/useWatchHeight.ts";
import type { SheetContainerProps } from "@lib/types.ts";
import useWrapperRef from "@lib/hooks/useWrapperRef.ts";

const SheetContainer: FC<SheetContainerProps> = ({
  children,
  style,
  className,
  wrapper,
  wrapperPortalElement,
  overlayColor,
  onOverlayClick,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const state = useSheetContext();
  const wrapperRef = useWrapperRef(wrapper);
  const viewHeight = useWatchHeight(wrapperRef);
  const firstMount = useRef(true);
  const scrollY = useRef(0);
  const elementY = useRef(0);
  const scrollLock = useScrollLock(ref);
  const DynamicHeightComponent = findDynamicHeightComponent(children);

  const snapValues = useMemo(
    () =>
      getSnapValues(viewHeight, state.dynamicHeightContent, state.snapPoints),
    [state.snapPoints, viewHeight, state.dynamicHeightContent],
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
    viewHeight,
    state.dynamicHeightContent,
  );
  const activeSnapValue = getActiveValue(
    snapValues,
    viewHeight,
    contentMode,
    state.activeSnapPointIndex || 0,
    state.dynamicHeightContent,
  );
  const { y, animate } = useAnim(viewHeight);
  const activeSnapPoint = getActiveSnapPoint(
    state.activeSnapPointIndex || 0,
    state.dynamicHeightContent,
    state.snapPoints,
  );

  const onDragStart = useEffectEvent(() => onDragStartEventHandler(ref));
  const onDrag = useEffectEvent((movementY: number) =>
    onDragEventHandler(ref, animate, {
      scrollY,
      scrollLock,
      activeSnapPoint,
      elementY,
      movementY,
      viewHeight,
    }),
  );
  const onDragEnd = useEffectEvent((offsetY: number) =>
    onDragEndEventHandler(
      ref,
      y,
      animate,
      {
        activeSnapPointIndex: state.activeSnapPointIndex || 0,
        snapPoints: state.snapPoints || [activeSnapPoint],
        dynamicHeightContent: state.dynamicHeightContent,
        viewHeight,
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
      onDragEnd: ({ movement }) => {
        onDragEnd(movement[1]);
      },
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
      () => {
        firstMount.current = false;
      },
      { jump: firstMount.current && state.noInitialAnimation },
    );
  }, [activeSnapValue, state.noInitialAnimation]);

  useIsomorphicLayoutEffect(() => {
    if (!state.isOpen) {
      animate(viewHeight, () => {
        state.callbacks.current.onClose();
      });
      if (wrapperRef.current && overlayColor) {
        wrapperRef.current.style.backgroundColor = "";
      }
    } else {
      if (overlayColor) {
        if (!wrapper) {
          console.warn(
            "snap-bottom-sheet: Overlay will appear when you set value for wrapper prop",
          );
        } else if (wrapperRef.current) {
          wrapperRef.current.style.transition =
            "background-color 0.2s ease-in-out";
          wrapperRef.current.style.backgroundColor = overlayColor;
        }
      }
    }
  }, [animate, viewHeight, state.callbacks, state.isOpen]);

  // to fix type issue of react-spring
  const AnimatedDiv = animated("div");
  const Sheet = (
    <AnimatedDiv
      ref={ref}
      {...gestureProps()}
      className={className}
      onClick={(e) => e.stopPropagation()}
      style={{
        ...style,
        y,
        height: contentMode ? "fit-content" : wrapper ? "100%" : "100dvh",
        position: wrapper ? "absolute" : "fixed",
        top: 0,
        left: 0,
        right: 0,
        overscrollBehavior: "none",
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

  if (!wrapper) return createPortal(Sheet, document.body);
  if (wrapperPortalElement) {
    return createPortal(
      <div
        onClick={onOverlayClick}
        ref={wrapperRef}
        style={{ position: "fixed", inset: 0 }}
      >
        {Sheet}
      </div>,
      wrapperPortalElement,
    );
  }
  return (
    <div
      onClick={onOverlayClick}
      ref={wrapperRef}
      style={{ position: "fixed", inset: 0 }}
    >
      {Sheet}
    </div>
  );
};

export default SheetContainer;
