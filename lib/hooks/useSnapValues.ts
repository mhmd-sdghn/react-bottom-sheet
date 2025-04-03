import { useRef } from "react";
import { SnapPoint } from "../types";
import { useIsomorphicLayoutEffect } from "@lib/utils.ts";
import useScreenHeight from "@lib/hooks/useScreenHeight.tsx";

const useSnapValues = (
  snapPoints: SnapPoint[],
  addDynamicContentAsSnapValue: boolean,
  dynamicContentHeight: number,
) => {
  const screenHeight = useScreenHeight();

  const snaps = snapPoints.map(point => typeof point !== "number" && point.value === "headerAsFirstSnapPointValue" ? dynamicContentHeight : typeof point == "number" ? point : 0)


  function normalizeSnaps(snapPoints: number[]) {
    const result = [];
    for (let i = 0; i < snapPoints.length; i++) {
      if (snapPoints[i] >= 0 && snapPoints[i] <= 1) {
        result.push(Math.max(screenHeight - snapPoints[i] * screenHeight, 0));
      } else {
        result.push(Math.max(screenHeight - snapPoints[i], 0));
      }
    }
    return result;
  }

  const snapValues = useRef<number[]>(normalizeSnaps(snaps));

  useIsomorphicLayoutEffect(() => {
    snapValues.current = normalizeSnaps(snaps);
  }, [
    snapPoints,
    screenHeight,
    dynamicContentHeight,
    addDynamicContentAsSnapValue,
  ]);

  return snapValues.current;
};

export default useSnapValues;
