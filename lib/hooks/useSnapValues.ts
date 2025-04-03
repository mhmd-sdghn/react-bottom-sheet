import { useState } from "react";
import { SnapPoint } from "../types";
import { useIsomorphicLayoutEffect } from "@lib/utils.ts";
import useScreenHeight from "@lib/hooks/useScreenHeight.tsx";

const useSnapValues = (
  snapPoints: SnapPoint[],
  addDynamicContentAsSnapValue: boolean,
  dynamicContentHeight: number,
) => {
  const screenHeight = useScreenHeight();
  const [snapValues, setSnapValues] = useState<SnapPoint[]>(
    normalizeSnaps(snapPoints, screenHeight),
  );

  useIsomorphicLayoutEffect(() => {
    const values = normalizeSnaps(snapPoints, screenHeight);

    if (addDynamicContentAsSnapValue)
      values.unshift(screenHeight - dynamicContentHeight);

    setSnapValues(values);
  }, [
    snapPoints,
    screenHeight,
    dynamicContentHeight,
    addDynamicContentAsSnapValue,
  ]);

  return { snapValues, setSnapValues };
};

export function normalizeSnaps(
  snapPoints: SnapPoint[],
  screenHeight: number,
): SnapPoint[];
export function normalizeSnaps(
  snapPoints: SnapPoint,
  screenHeight: number,
): SnapPoint;
export function normalizeSnaps(
  snapPoints: SnapPoint | SnapPoint[],
  screenHeight = 0,
) {
  const result = [];
  let _snapPoints;
  let isSingleSnap = false;

  if (snapPoints && !Array.isArray(snapPoints)) {
    isSingleSnap = true;
    _snapPoints = [snapPoints];
  } else if (!Array.isArray(snapPoints) || !snapPoints.length)
    return snapPoints;
  else {
    _snapPoints = snapPoints;
  }

  for (let i = 0; i < _snapPoints.length; i++) {
    if (_snapPoints[i] >= 0 && _snapPoints[i] <= 1) {
      result.push(Math.max(screenHeight - _snapPoints[i] * screenHeight, 0));
    } else {
      result.push(Math.max(screenHeight - _snapPoints[i], 0));
    }
  }

  return isSingleSnap ? result[0] : result;
}

export default useSnapValues;
