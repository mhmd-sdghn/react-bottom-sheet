import {
  useEffect,
  useLayoutEffect,
  ReactNode,
  Children,
  isValidElement,
  ReactElement,
} from "react";
import { HeaderComponentId } from "@lib/constants.ts";

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
