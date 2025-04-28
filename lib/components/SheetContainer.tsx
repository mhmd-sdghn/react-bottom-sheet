import { animated } from "@react-spring/web";
import { Children, FC, useMemo, useRef } from "react";
import useSheetContext from "@lib/context/useSheetContext.tsx";
import {
  findDynamicHeightComponent,
  getActiveValue,
  isContentMode,
  isSSR,
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
import useSnapScroll from "@lib/hooks/useSnapScroll.ts";
import useMount from "@lib/hooks/useMount.ts";
import SheetOverlay from "@lib/components/SheetOverlay.tsx";

const SheetContainer: FC<SheetContainerProps> = ({
  children,
  style,
  className,
  wrapper,
  wrapperPortalElement,
  overlayColor,
  onOverlayClick,
  wrapperStyle = {},
  wrapperClassName,
  overlayStyle,
  overlayClassName,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const state = useSheetContext();
  const wrapperRef = useWrapperRef(wrapper);
  const viewHeight = useWatchHeight(wrapperRef);
  const scrollY = useRef(0);
  const elementY = useRef(0);
  const scrollLock = useScrollLock(ref);
  const DynamicHeightComponent = findDynamicHeightComponent(children);

  const snapValues = useMemo(
    () =>
      getSnapValues(viewHeight, state.dynamicHeightContent, state.snapPoints),
    [state.snapPoints, viewHeight, state.dynamicHeightContent],
  );

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

  useSnapScroll({
    animate,
    state: {
      activeSnapValue,
      activeSnapPoint,
      noInitialAnimation: state.noInitialAnimation,
      scrollLock,
      bottomSheetRef: ref,
    },
  });

  useMount({
    animate,
    onClose: state.callbacks.onClose,
    state: {
      isOpen: state.isOpen,
      overlayColor,
      viewHeight,
      wrapper,
      wrapperRef,
    },
  });

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
    onDragEndEventHandler(ref, animate, wrapperRef, {
      y,
      viewHeight,
      activeSnapValue,
      contentMode,
      offsetY,
      snapValues,
      scrollY,
      scrollLock,
      ...state,
    }),
  );
  const gestureProps = useGesture(
    {
      onDragStart: ({ event, cancel }) => {
        // handle the situation when another bottom sheet exists as children
        event.stopPropagation();
        const target = event.target as HTMLDivElement;
        if (
          target &&
          target.id &&
          target.id === "snap-bottom-sheet-wrapper-overlay"
        ) {
          cancel();
        }

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
        className={wrapperClassName}
        ref={wrapperRef}
        style={{ position: "fixed", inset: 0, zIndex: 1, ...wrapperStyle }}
      >
        <SheetOverlay
          overlayColor={overlayColor}
          overlayClassName={overlayClassName}
          onOverlayClick={onOverlayClick}
          overlayStyle={overlayStyle}
        />
        {Sheet}
      </div>,
      wrapperPortalElement,
    );
  }
  return (
    <div
      className={wrapperClassName}
      ref={wrapperRef}
      style={{ position: "fixed", inset: 0, zIndex: 1, ...wrapperStyle }}
    >
      <SheetOverlay
        overlayColor={overlayColor}
        overlayClassName={overlayClassName}
        onOverlayClick={onOverlayClick}
        overlayStyle={overlayStyle}
      />
      {Sheet}
    </div>
  );
};

export default SheetContainer;
