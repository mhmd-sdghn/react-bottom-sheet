import { useState } from "react";
import { Sheet, SnapPoints } from "@lib/index";

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [snapPoints, setSnapPoints] = useState<SnapPoints>(["dynamic", 1]);
  const [activeSnapPointIndex, setActiveSnapPointIndex] = useState(0);

  const onSnap = (index: number) => {
    // index is -1 if onClose is called
    if (index !== -1) setActiveSnapPointIndex(index);
  };

  const onClose = () => {
    setActiveSnapPointIndex(0);
    setIsOpen(false);
  };

  const onSnapUpdate = (snapPoints: SnapPoints) => {
    console.log("onSnapUpdate", snapPoints);

    setSnapPoints(snapPoints);
  };

  // TODO add openWithoutAnimation prop
  // TODO add snap configuration (value, scroll, drag(lock drag in a certain direction)
  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? "hide" : "show"}
      </button>
      <button
        style={{ position: "fixed", left: 100, zIndex: 999 }}
        onClick={() => setActiveSnapPointIndex(0)}
      >
        index 0
      </button>
      <Sheet
        isOpen={isOpen}
        snapPoints={snapPoints}
        activeSnapPointIndex={activeSnapPointIndex}
        onSnap={onSnap}
        onClose={onClose}
        setSnapPoints={onSnapUpdate}
      >
        <Sheet.Container>
          <Sheet.DynamicHeight>
            <div
              style={{
                width: "100%",
                background: "blue",
                height: activeSnapPointIndex === 0 ? 100 : 300,
                transition: "all 0.5s ease",
              }}
            ></div>
          </Sheet.DynamicHeight>

          <div>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Egestas
            purus viverra accumsan in nisl nisi. Arcu cursus vitae congue mauris
            rhoncus aenean vel elit scelerisque. In egestas erat imperdiet sed
            euismod nisi porta lorem mollis. Morbi tristique senectus et netus.
            Mattis pellentesque id nibh tortor id aliquet lectus proin. Lorem
            ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
            tempor incididunt ut labore et dolore magna aliqua. Egestas purus
            viverra accumsan in nisl nisi. Arcu cursus vitae congue mauris
            rhoncus aenean vel elit scelerisque. In egestas erat imperdiet sed
            euismod nisi porta lorem mollis. Morbi tristique senectus et netus.
            Mattis pellentesque id nibh tortor id aliquet lectus proin. Lorem
            ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
            tempor incididunt ut labore et dolore magna aliqua. Egestas purus
            viverra accumsan in nisl nisi. Arcu cursus vitae congue mauris
            rhoncus aenean vel elit scelerisque. In egestas erat imperdiet sed
            euismod nisi porta lorem mollis. Morbi tristique senectus et netus.
            Mattis pellentesque id nibh tortor id aliquet lectus proin. Lorem
            ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
            tempor incididunt ut labore et dolore magna aliqua. Egestas purus
            viverra accumsan in nisl nisi. Arcu cursus vitae congue mauris
            rhoncus aenean vel elit scelerisque. In egestas erat imperdiet sed
            euismod nisi porta lorem mollis. Morbi tristique senectus et netus.
            Mattis pellentesque id nibh tortor id aliquet lectus proin. Lorem
            ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
            tempor incididunt ut labore et dolore magna aliqua. Egestas purus
            viverra accumsan in nisl nisi. Arcu cursus vitae congue mauris
            rhoncus aenean vel elit scelerisque. In egestas erat imperdiet sed
            euismod nisi porta lorem mollis. Morbi tristique senectus et netus.
            Mattis pellentesque id nibh tortor id aliquet lectus proin. Lorem
            ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
            tempor incididunt ut labore et dolore magna aliqua. Egestas purus
            viverra accumsan in nisl nisi. Arcu cursus vitae congue mauris
            rhoncus aenean vel elit scelerisque. In egestas erat imperdiet sed
            euismod nisi porta lorem mollis. Morbi tristique senectus et netus.
            Mattis pellentesque id nibh tortor id aliquet lectus proin.
          </div>
        </Sheet.Container>
      </Sheet>
    </>
  );
}

export default App;
