import { useEffect, useLayoutEffect } from "react";

export const isSSR = () => typeof window === "undefined";
export const useIsomorphicLayoutEffect = isSSR() ? useLayoutEffect : useEffect;
