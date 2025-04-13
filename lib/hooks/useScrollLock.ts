import { useRef, RefObject } from "react";
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

    document.documentElement.style.overflowY = "none";
    document.body.style.overflowY = "none";
    document.body.style.overscrollBehavior = "none";

    ref.current = {
      activate: () => {
        if (active === true) return;
        target.style.overflowY = "hidden";
        target.style.touchAction = "none";
        active = true;
      },
      deactivate: () => {
        if (active === false) return;
        target.style.overflowY = "auto";
        target.style.touchAction = "pan-y";
        //enableBodyScroll(target);
        active = false;
      },
    };

    return () => {
      document.documentElement.style.overflowY = "auto";
      document.body.style.overflowY = "auto";
      document.body.style.overscrollBehavior = "auto";
    };
  }, [targetRef]);

  return ref;
}

export default useScrollLock;
