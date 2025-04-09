import { useRef, RefObject } from "react";
import { disableScroll, enableScroll } from "@fluejs/noscroll";
import { useIsomorphicLayoutEffect } from "@react-spring/web";

function useScrollLock(targetRef: RefObject<HTMLDivElement | null>) {
  const ref = useRef<{ activate: () => void; deactivate: () => void }>({
    activate: () => {
      throw new TypeError("Tried to activate scroll lock too early");
    },
    deactivate: () => {},
  });

  useIsomorphicLayoutEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    let active: boolean | null = null;

    disableScroll(document.body);

    ref.current = {
      activate: () => {
        if (active === true) return;
        target.style.overflowY = "none";
        target.style.touchAction = "none";
        disableScroll(target);
        active = true;
      },
      deactivate: () => {
        if (active === false) return;
        target.style.overflowY = "auto";
        target.style.touchAction = "pan-y";
        enableScroll(target);
        active = false;
      },
    };

    return () => enableScroll(document.body);
  }, [targetRef]);

  return ref;
}

export default useScrollLock;
