import { useIsomorphicLayoutEffect } from "@react-spring/web";
import { useMountProps } from "@lib/types.ts";

/**
 * This hook manages flows when SheetContainer component mount and unmount
 */
const useMount = ({ animate, onClose, state }: useMountProps) => {
  const { viewHeight, wrapperRef, overlayColor, wrapper, isOpen } = state;

  useIsomorphicLayoutEffect(() => {
    if (!state.isOpen) {
      animate(viewHeight, () => {
        onClose();
      });
      if (wrapperRef.current && overlayColor) {
        wrapperRef.current.style.backgroundColor = "";
      }
    } else {
      if (overlayColor) {
        if (!wrapper) {
          console.warn(
            "snap-bottom-sheet: Overlay will appear when you set value for wrapper prop",
          );
        } else if (wrapperRef.current) {
          wrapperRef.current.style.transition =
            "background-color 0.2s ease-in-out";
          wrapperRef.current.style.backgroundColor = overlayColor;
        }
      }
    }
  }, [animate, viewHeight, isOpen]);
};

export default useMount;
