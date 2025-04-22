import { FC } from "react";
import type { SheetOverlayProps } from "@lib/types.ts";

const SheetOverlay: FC<SheetOverlayProps> = ({
  overlayClassName,
  overlayStyle,
  onOverlayClick,
  overlayColor,
}) => {
  return overlayColor ? (
    <div
      id="snap-bottom-sheet-wrapper-overlay"
      onClick={onOverlayClick}
      className={overlayClassName}
      style={{
        ...overlayStyle,
        position: "absolute",
        inset: 0,
        transition: "background-color 0.2s ease-in-out",
      }}
    />
  ) : null;
};

export default SheetOverlay;
