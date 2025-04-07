import { useSpring } from "@react-spring/web";
import { useSheetContext } from "@lib/context.tsx";
import useScreenHeight from "@lib/hooks/useScreenHeight.tsx";

const useAnim = () => {
  const state = useSheetContext();
  const screenHeight = useScreenHeight();

  const [{ y }, api] = useSpring(() => ({ y: screenHeight }));

  const animate = (_y: number, cb?: () => void) => {
    const targetY = y.get() + _y > 0 ? _y : 0;

    state.setIsAnimating(true);
    api.start({
      to: async (next) => {
        await next({ y: targetY });
        state.setIsAnimating(false);

        if (typeof cb === "function") cb();
      },
    });
  };

  return { y, animate };
};

export default useAnim;
