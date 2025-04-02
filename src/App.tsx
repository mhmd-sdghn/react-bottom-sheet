import { Sheet, SnapPoints } from "@lib/index";
import { useState } from "react";

function App() {
  const [isOpen, setIsOpen] = useState(true);
  const [snapPoints, setSnapPoints] = useState<SnapPoints>([]);
  const [activeSnapPointIndex, setActiveSnapPointIndex] = useState(0);

  const onSnap = (index: number) => {
    setActiveSnapPointIndex(index);
  };

  const onClose = () => {
    setIsOpen(false);
  };

  const onSnapPointsUpdate = (snapPoints: SnapPoints) => {
    setSnapPoints(snapPoints);
  };

  return (
    <>
      <button onClick={() => setIsOpen((value) => !value)}>
        {isOpen ? "hide" : "show"}
      </button>
      <Sheet
        isOpen={isOpen}
        snapPoints={snapPoints}
        activeSnapPointIndex={activeSnapPointIndex}
        onSnap={onSnap}
        onClose={onClose}
        onSnapPointsUpdate={onSnapPointsUpdate}
      >
        <Sheet.Container>sa</Sheet.Container>
      </Sheet>
    </>
  );
}

export default App;
