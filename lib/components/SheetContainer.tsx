import { motion } from "motion/react";
import { FC, ReactNode, useState } from "react";

const SheetContainer: FC<{ children: ReactNode }> = ({ children }) => {
  const [y] = useState(100);

  return (
    <motion.div
      animate={{ y }}
      style={{
        position: "fixed",
        bottom: "-100%",
        left: 0,
        right: 0,
        background: "gray",
      }}
    >
      {children}
    </motion.div>
  );
};

export default SheetContainer;
