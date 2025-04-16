import { useState } from "react";
import { isSSR } from "../utils";
import { useIsomorphicLayoutEffect } from "@react-spring/web";

function useViewHeight(wrapper?: HTMLElement | null) {
  const [height, setHeight] = useState(
    !isSSR() ? (wrapper ? wrapper.offsetHeight : window.innerHeight) : 0,
  );

  useIsomorphicLayoutEffect(() => {
    if (isSSR()) return;

    function handler() {
      setHeight(wrapper ? wrapper.offsetHeight : window.innerHeight);
    }

    handler();

    if (wrapper) {
      wrapper.addEventListener("resize", handler);
    } else if (window) {
      window.addEventListener("resize", handler);
    }

    return () => {
      (wrapper || window).removeEventListener("resize", handler);
    };
  }, [wrapper]);

  return height;
}

export default useViewHeight;
