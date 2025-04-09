import { useState } from "react";
import { isSSR } from "../utils";
import { useIsomorphicLayoutEffect } from "@react-spring/web";

function useScreenHeight() {
  const [height, setHeight] = useState(!isSSR() ? window.innerHeight : 0);

  useIsomorphicLayoutEffect(() => {
    function handler() {
      setHeight(window.innerHeight);
    }

    handler();

    window.addEventListener("resize", handler);

    return () => {
      window.removeEventListener("resize", handler);
    };
  }, []);

  return height;
}

export default useScreenHeight;
