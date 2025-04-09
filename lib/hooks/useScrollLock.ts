import { useDebugValue, useEffect, useRef, RefObject } from "react";
import { disableScroll, enableScroll } from "@fluejs/noscroll";

function useScrollLock({
  targetRef,
  enabled,
}: {
  targetRef: RefObject<HTMLDivElement | null>;
  enabled: boolean;
}) {
  const ref = useRef<{ activate: () => void; deactivate: () => void }>({
    activate: () => {
      throw new TypeError("Tried to activate scroll lock too early");
    },
    deactivate: () => {},
  });

  useDebugValue(enabled ? "Enabled" : "Disabled");

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    if (!enabled) {
      ref.current.deactivate();
      ref.current = { activate: () => {}, deactivate: () => {} };
      return;
    }

    let active = false;

    disableScroll(document.body);

    ref.current = {
      activate: () => {
        if (active) return;
        target.style.overflowY = "none";
        target.style.touchAction = "none";
        disableScroll(target);
        active = true;
      },
      deactivate: () => {
        if (!active) return;
        target.style.overflowY = "auto";
        target.style.touchAction = "pan-y";
        enableScroll(target);
        active = false;
      },
    };

    return () => enableScroll(document.body);
  }, [enabled, targetRef]);

  return ref;
}

export default useScrollLock;
