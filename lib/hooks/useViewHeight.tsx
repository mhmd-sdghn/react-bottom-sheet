import { useEffect, useState } from "react";
import { isSSR } from "../utils";

function useViewHeight(wrapper?: HTMLElement | null) {
  const [height, setHeight] = useState(
    !isSSR() ? (wrapper ? wrapper.offsetHeight : window.innerHeight) : 0,
  );

  useEffect(() => {
    if (isSSR()) return;

    console.warn("useViewHeight isSSR = false ");
    console.warn("wrapper ", wrapper);

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
