import { useState } from "react";
import { Sheet, SnapPoints, SnapPointValues } from "@lib/index";

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [snapPoints] = useState<SnapPoints>([
    {
      value: SnapPointValues.DynamicContentValue,
      drag: {
        down: false,
      },
    },
    {
      value: 1,
      scroll: true,
    },
  ]);
  const [activeSnapPointIndex, setActiveSnapPointIndex] = useState(0);

  const onSnap = (index: number) => {
    // index is -1 if onClose is called
    if (index !== -1) setActiveSnapPointIndex(index);
  };

  const onClose = () => {
    setActiveSnapPointIndex(0);
    setIsOpen(false);
  };

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
            <input placeholder="salam" style={{ fontSize: 18 }} />
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
