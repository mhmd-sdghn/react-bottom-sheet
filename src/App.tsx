import { Sheet, SnapPoints } from "@lib/index";
import { useState } from "react";

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [snapPoints, setSnapPoints] = useState<SnapPoints>([0.5, 1]);
  const [activeSnapPointIndex, setActiveSnapPointIndex] = useState(0);

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
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Egestas
            purus viverra accumsan in nisl nisi. Arcu cursus vitae congue mauris
            rhoncus aenean vel elit scelerisque. In egestas erat imperdiet sed
            euismod nisi porta lorem mollis. Morbi tristique senectus et netus.
            Mattis pellentesque id nibh tortor id aliquet lectus proin. Sapien
            faucibus et molestie ac feugiat sed lectus vestibulum. Ullamcorper
            velit sed ullamcorper morbi tincidunt ornare massa eget. Dictum
            varius duis at consectetur lorem. Nisi vitae suscipit tellus mauris
            a diam maecenas sed enim. Velit ut tortor pretium viverra
            suspendisse potenti nullam. Et molestie ac feugiat sed lectus. Non
            nisi est sit amet facilisis magna. Dignissim diam quis enim lobortis
            scelerisque fermentum. Odio ut enim blandit volutpat maecenas
            volutpat. Ornare lectus sit amet est placerat in egestas erat. Nisi
            vitae suscipit tellus mauris a diam maecenas sed. Placerat duis
            ultricies lacus sed turpis tincidunt id aliquet. Lorem ipsum dolor
            sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Egestas purus viverra
            accumsan in nisl nisi. Arcu cursus vitae congue mauris rhoncus
            aenean vel elit scelerisque. In egestas erat imperdiet sed euismod
            nisi porta lorem mollis. Morbi tristique senectus et netus. Mattis
            pellentesque id nibh tortor id aliquet lectus proin. Sapien faucibus
            et molestie ac feugiat sed lectus vestibulum. Ullamcorper velit sed
            ullamcorper morbi tincidunt ornare massa eget. Dictum varius duis at
            consectetur lorem. Nisi vitae suscipit tellus mauris a diam maecenas
            sed enim. Velit ut tortor pretium viverra suspendisse potenti
            nullam. Et molestie ac feugiat sed lectus. Non nisi est sit amet
            facilisis magna. Dignissim diam quis enim lobortis scelerisque
            fermentum. Odio ut enim blandit volutpat maecenas volutpat. Ornare
            lectus sit amet est placerat in egestas erat. Nisi vitae suscipit
            tellus mauris a diam maecenas sed. Placerat duis ultricies lacus sed
            turpis tincidunt id aliquet.
          </div>
        </Sheet.Container>
      </Sheet>
    </>
  );
}

export default App;
