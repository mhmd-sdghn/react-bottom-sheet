import { ReactNode, Children, isValidElement, ReactElement } from "react";
import {
  DragOffsetThreshold,
  HeaderComponentId,
  SnapPointValues,
} from "@lib/constants.ts";
import { SnapPoint } from "@lib/types.ts";

export const isSSR = () => typeof window === "undefined";

export const findHeaderComponent = (
  children: ReactNode,
): ReactElement<{ children: ReactNode }> | null => {
  const _children = Children.toArray(children);

  if (_children.length === 0) return null;

  const child = _children[0] as ReactElement<{ children: ReactNode }> & {
    type: { displayName: string };
  };

  if (!isValidElement(child)) return null;

  if (child.type.displayName !== HeaderComponentId) return null;

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

export const getSnapValues = (
  snapPoints: SnapPoint[],
  screenHeight: number,
) => {
  if (!Array.isArray(snapPoints)) return [];

  const result = [];
  for (const snap of snapPoints) {
    const snapValue = (() => {
      if (
        typeof snap === "string" &&
        snap === SnapPointValues.DynamicContentValue
      )
        return 0;
      if (typeof snap === "object" && snap !== null && "value" in snap)
        return (snap as { value: number }).value;
      if (typeof snap === "number") return snap;
      return null;
    })();

    if (snapValue === null) {
      console.warn("Invalid snap value, got ", snap);
    } else {
      const heightOffset =
        snapValue <= 1 ? snapValue * screenHeight : snapValue;
      result.push(Math.max(screenHeight - heightOffset, 0));
    }
  }

  return result.sort((a, b) => {
    if (a === 0) return 1;
    return b - a;
  });
};

export const isContentMode = (
  snapValues: SnapPoint[],
  screenHeight: number,
  dynamicHeightContent: number,
) => {
  // if there is no snap value or if the only snap value is
  // dynamic content height value then, content mode is on.
  return (
    !snapValues.length ||
    (snapValues.length === 1 &&
      snapValues[0] === screenHeight - dynamicHeightContent)
  );
};

export const getActiveValue = (
  snapValues: number[],
  screenHeight: number,
  contentMode: boolean,
  activeSnapPointIndex: number,
  dynamicHeightContent: number,
) => {
  if (!contentMode) {
    if (
      activeSnapPointIndex === 0 &&
      dynamicHeightContent &&
      dynamicHeightContent
    )
      return screenHeight - dynamicHeightContent;
    return snapValues[activeSnapPointIndex];
  }

  return snapValues[0] || 0;
};
