import { FC } from "react";
import type { SheetOverlayProps } from "@lib/types.ts";
import { OverlayElementId } from "@lib/constants.ts";

const SheetOverlay: FC<SheetOverlayProps> = ({
  overlayClassName,
  overlayStyle,
  onOverlayClick,
  overlayColor,
}) => {
  return overlayColor ? (
    <div
      id={OverlayElementId}
      onClick={onOverlayClick}
      className={overlayClassName}
      style={{
        position: "absolute",
        inset: 0,
        transition: "background-color 0.2s ease-in-out",
        ...overlayStyle,
      }}
    />
  ) : null;
};

export default SheetOverlay;
