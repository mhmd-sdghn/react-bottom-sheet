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
