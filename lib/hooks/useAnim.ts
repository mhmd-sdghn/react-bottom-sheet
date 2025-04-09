import { useSpring } from "@react-spring/web";
import useSheetContext from "@lib/context/useSheetContext.tsx";
import useScreenHeight from "@lib/hooks/useScreenHeight.tsx";
import { UseAnimAnimateFn } from "@lib/types.ts";

const useAnim = () => {
  const state = useSheetContext();
  const screenHeight = useScreenHeight();

  const [{ y }, api] = useSpring(() => ({ y: screenHeight }));

  const animate: UseAnimAnimateFn = (_y, cb) => {
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
