import {
  useEffect,
  useLayoutEffect,
  ReactNode,
  Children,
  isValidElement,
  ReactElement,
} from "react";
import { DragOffsetThreshold, HeaderComponentId } from "@lib/constants.ts";
import { SnapPoint } from "@lib/types.ts";

export const isSSR = () => typeof window === "undefined";

export const useIsomorphicLayoutEffect = isSSR() ? useLayoutEffect : useEffect;

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

function cached(fn: () => boolean) {
  let res: boolean | null = null;
  return () => {
    if (res == null) {
      res = fn();
    }
    return res;
  };
}

function testPlatform(re: RegExp) {
  return !isSSR() ? re.test(navigator.userAgent) : false;
}

const isMac = cached(function () {
  return testPlatform(/^Mac/i);
});

const isIPhone = cached(function () {
  return testPlatform(/^iPhone/i);
});

const isIPad = cached(function () {
  return (
    testPlatform(/^iPad/i) ||
    // iPadOS 13 lies and says it's a Mac, but we can distinguish by detecting touch support.
    (isMac() && navigator.maxTouchPoints > 1)
  );
});

export const isIOS = cached(function () {
  return isIPhone() || isIPad();
});

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
  const result = [];
  for (let i = 0; i < snapPoints.length; i++) {
    if (snapPoints[i] >= 0 && snapPoints[i] <= 1) {
      result.push(Math.max(screenHeight - snapPoints[i] * screenHeight, 0));
    } else {
      result.push(Math.max(screenHeight - snapPoints[i], 0));
    }
  }

  return result;
};
