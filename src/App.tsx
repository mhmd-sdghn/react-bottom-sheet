import { Sheet, SnapPoints } from "@lib/index";
import { useState } from "react";

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [snapPoints, setSnapPoints] = useState<SnapPoints>([0.5, 0.8, 1]);
  const [activeSnapPointIndex, setActiveSnapPointIndex] = useState(1);

  const onSnap = (index: number) => {
    console.log("onSnap switched to ", snapPoints[index]);
    setActiveSnapPointIndex(index);
  };

  const onClose = () => {
    setActiveSnapPointIndex(1);
    setIsOpen(false);
  };

  const onSnapPointsUpdate = (snapPoints: SnapPoints) => {
    setSnapPoints(snapPoints);
  };

  return (
    <>
      <div
        style={{
          height: 10,
          width: "100%",
          background: "yellow",
          position: "fixed",
          bottom: 650,
          zIndex: 9999,
        }}
      ></div>
      <button onClick={() => setIsOpen(!isOpen)}>
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
        <Sheet.Container>
          <Sheet.Header>
            <div
              style={{
                background: "red",
                height: activeSnapPointIndex === 1 ? 400 : 200,
                transition: "all ease 0.2s",
              }}
            >
              <h1>header</h1>
            </div>
          </Sheet.Header>
          <div>
            <h2>Content</h2>
          </div>
        </Sheet.Container>
      </Sheet>
    </>
  );
}

export default App;
