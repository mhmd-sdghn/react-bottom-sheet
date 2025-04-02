import {
  motion,
  AnimatePresence,
  MotionConfig,
  useDragControls,
} from "motion/react";
import { Children, FC, ReactNode, useState } from "react";
import { useSheetContext } from "../context.tsx";
import { findHeaderComponent } from "../utils.ts";
import SheetDynamicHeightContent from "./SheetDynamicHeightContent.tsx";

const SheetContainer: FC<{ children: ReactNode }> = ({ children }) => {
  const state = useSheetContext();
  const [y] = useState(-200);
  const HeaderComponent = findHeaderComponent(children);

  const controls = useDragControls();

  const onHeightChange = () => {};

  const startDrag = (e) => {
    console.log("salam 1", e);
  };

  const dragging = (e) => {
    console.log("salam 2", e);
  };

  return (
    <MotionConfig transition={{ type: "spring", restSpeed: 0.1, bounce: 0.3 }}>
      <AnimatePresence>
        {state.isOpen && (
          <motion.div
            animate={{ y }}
            onPointerMoveCapture={dragging}
            exit={{ y: 0 }}
            drag="y"
            onPointerDown={startDrag}
            dragListener={false}
            onMeasureDragConstraints={(e) => console.log("salam 33 ", e)}
            dragControls={controls}
            dragElastic={0}
            dragMomentum={false}
            dragPropagation={false}
            style={{
              position: "fixed",
              touchAction: "none",
              bottom: "-100%",
              height: "100dvh",
              left: 0,
              right: 0,
              background: "gray",
            }}
          >
            {HeaderComponent ? (
              <>
                <SheetDynamicHeightContent
                  onHeightChange={onHeightChange}
                  {...HeaderComponent.props}
                />
                {Children.toArray(children).slice(1)}
              </>
            ) : (
              children
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
};

export default SheetContainer;
