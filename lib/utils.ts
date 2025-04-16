import { ReactNode, Children, isValidElement, ReactElement } from "react";
import {
  DragOffsetThreshold,
  DynamicHeightComponentId,
  SnapPointDynamicValue,
} from "@lib/constants.ts";
import { SnapPoint, SnapPointConfigObj } from "@lib/types.ts";

export const isSSR = () =>
  typeof window === "undefined" ||
  !window.navigator ||
  /ServerSideRendering|^Deno\//.test(window.navigator.userAgent) ||
  (typeof process !== "undefined" &&
    process.versions &&
    process.versions.node !== undefined);

export const findDynamicHeightComponent = (
  children: ReactNode,
): ReactElement<{ children: ReactNode }> | null => {
  const _children = Children.toArray(children);

  if (_children.length === 0) return null;

  const child = _children[0] as ReactElement<{ children: ReactNode }> & {
    type: { displayName: string };
  };

  if (!isValidElement(child)) return null;

  if (child.type.displayName !== DynamicHeightComponentId) return null;

  return child;
};

export function getClosestIndex(
  arr: number[],
  target: number,
  offset: number,
  activeIndex: number,
) {
  let closestIndex = 0;
  let minDiff = Math.abs(target - arr[0]);

  for (let i = 1; i < arr.length; i++) {
    const currentDiff = Math.abs(arr[i] - target);

    if (currentDiff < minDiff) {
      closestIndex = i;
      minDiff = currentDiff;
    }
  }

  // Avoid getting back to the same snap point if y movement is more than DragOffsetThreshold
  if (activeIndex === closestIndex && Math.abs(offset) > DragOffsetThreshold) {
    if (offset > 0) {
      return Math.max(closestIndex - 1, 0);
    }

    return closestIndex + 1;
  }

  return closestIndex;
}

export function validateSnapTo({
  snapTo,
  sheetHeight,
}: {
  snapTo: number;
  sheetHeight: number;
}) {
  if (snapTo < 0) {
    console.warn(
      `Snap point is out of bounds. Sheet height is ${sheetHeight} but snap point is ${
        sheetHeight + Math.abs(snapTo)
      }.`,
    );
  }

  return Math.max(Math.round(snapTo), 0);
}

export const isContentMode = (
  snapValues: SnapPoint[],
  viewHeight: number,
  dynamicHeightContent: number,
) => {
  // if there is no snap value or if the only snap value is
  // dynamic content height value then, content mode is on.
  return (
    !snapValues.length ||
    (snapValues.length === 1 &&
      snapValues[0] === viewHeight - dynamicHeightContent)
  );
};

export const getActiveValue = (
  snapValues: number[],
  viewHeight: number,
  contentMode: boolean,
  activeSnapPointIndex: number,
  dynamicHeightContent: number,
) => {
  if (!contentMode) {
    if (activeSnapPointIndex === 0 && dynamicHeightContent)
      return viewHeight - dynamicHeightContent;
    return snapValues[activeSnapPointIndex];
  }

  return snapValues[0] || 0;
};

export const getActiveSnapPoint = (
  activeSnapPointIndex: number,
  dynamicContentHeight: number,
  snapPoints?: SnapPoint[] | null,
) => {
  if (Array.isArray(snapPoints) && snapPoints.length > 0)
    return snapPoints[activeSnapPointIndex];
  if (dynamicContentHeight) return dynamicContentHeight;
  return 1; // full-height
};

const isDynamicSnapValue = (snap: SnapPoint) => {
  if (
    typeof snap === "object" &&
    "value" in snap &&
    snap.value === SnapPointDynamicValue
  )
    return true;
  return snap === SnapPointDynamicValue;
};

/** Converts any valid snap point format to pixels */
const convertSnapToPixels = (snap: SnapPoint, viewHeight: number): number => {
  if (typeof snap === "object" && "value" in snap) {
    return calculatePixelValue(snap.value, viewHeight);
  }
  return calculatePixelValue(snap, viewHeight);
};

const calculatePixelValue = (
  value: string | number,
  viewHeight: number,
): number => {
  const numericValue = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(numericValue)) {
    console.warn("Invalid snap value:", value);
    return 0;
  }

  // Handle percentage values (<=1) vs absolute pixels
  const heightOffset =
    numericValue <= 1 ? numericValue * viewHeight : numericValue;

  return Math.max(viewHeight - heightOffset, 0);
};

const validateDynamicSnapPosition = (
  hasDynamicComponent: boolean,
  dynamicIndex: number,
) => {
  if (!hasDynamicComponent) return;

  if (dynamicIndex === -1) {
    console.warn(
      "[DynamicHeight] Required configuration missing: \n" +
        "    When using DynamicHeight component, you must include 'SnapPointDynamicValue' \n" +
        "    as your FIRST snap point for proper layout calculations.",
    );
  } else if (dynamicIndex > 0) {
    console.warn(`[DynamicHeight] Invalid configuration:
    'SnapPointDynamicValue' must be the FIRST snap point in the array 
    to ensure correct dynamic content height calculations. Found at position ${dynamicIndex}.`);
  }
};

const sortSnapValues = (values: number[]): number[] =>
  [...values].sort((a, b) => {
    // Keep 0 (bottom position) at the end
    if (a === 0) return 1;
    if (b === 0) return -1;
    return b - a;
  });

export const getSnapValues = (
  viewHeight: number,
  dynamicContentHeight: number,
  snapPoints?: SnapPoint[] | null,
): number[] => {
  if (!Array.isArray(snapPoints)) {
    const defaultSnapValue = getActiveSnapPoint(
      0,
      dynamicContentHeight,
      snapPoints,
    );

    return [defaultSnapValue as number];
  }

  let dynamicSnapIndex = -1;
  const processedValues: number[] = [];

  snapPoints.forEach((snap, index) => {
    // Handle dynamic content marker
    if (isDynamicSnapValue(snap)) {
      dynamicSnapIndex = index;
      processedValues.push(viewHeight);
      return;
    }

    // Convert different formats to pixel value
    const pixelValue = convertSnapToPixels(snap, viewHeight);
    processedValues.push(pixelValue);
  });

  // Validate dynamic snap point requirements
  validateDynamicSnapPosition(!!dynamicContentHeight, dynamicSnapIndex);

  // Sort zero (full-height) last
  return sortSnapValues(processedValues);
};

export const clamp = (num: number, min: number, max: number) => {
  return num <= min ? min : num >= max ? max : num;
};

export const isSnapPointConfigObj = (
  point?: SnapPoint | null,
): point is SnapPointConfigObj =>
  typeof point === "object" && point !== null && "value" in point;
