import { useEffect, useRef } from "react";

const useElementHeight = (onHeightChange: (height: number) => void) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const lastHeight = useRef(0);

  useEffect(() => {
    if (!ref.current) {
      onHeightChange(0);
      return;
    }

    const updateHeight = () => {
      const newHeight = ref.current?.offsetHeight || 0;
      if (newHeight !== lastHeight.current) {
        onHeightChange(newHeight);
        lastHeight.current = newHeight;
      }
    };

    updateHeight(); // Initial update

    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(ref.current);

    return () => resizeObserver.disconnect();
  }, [onHeightChange]);

  return ref;
};

export default useElementHeight;
