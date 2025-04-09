import { useSpring } from "@react-spring/web";
import useScreenHeight from "@lib/hooks/useScreenHeight.tsx";
import { UseAnimAnimateFn } from "@lib/types.ts";

const useAnim = () => {
  const screenHeight = useScreenHeight();

  const [{ y }, api] = useSpring(() => ({ y: screenHeight }));

  const animate: UseAnimAnimateFn = (_y, cb) => {
    const targetY = y.get() + _y > 0 ? _y : 0;

    api.start({
      to: async (next) => {
        await next({ y: targetY });

        if (typeof cb === "function") cb();
      },
    });
  };

  return { y, animate };
};

export default useAnim;
