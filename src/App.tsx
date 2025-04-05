import {  useState } from "react";
import { motion } from "motion/react";
import { Sheet, SnapPoints } from "@lib/index";


function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [snapPoints, setSnapPoints] = useState<SnapPoints>([1]);
  const [activeSnapPointIndex, setActiveSnapPointIndex] = useState(0);


  const onSnap = (index: number) => {
    console.log("onSnap switched to ", index);

    // index is -1 if onClose is called
    if (index !== -1)
      setActiveSnapPointIndex(index);
  };

  const onClose = () => {
    setActiveSnapPointIndex(0);
    setIsOpen(false);
  };

  const onSnapUpdate = (snapPoints: SnapPoints) => {
    console.log("onSnapUpdate", snapPoints);

    setSnapPoints(snapPoints)
  }





  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? "hide" : "show"}
      </button>
      <button style={{ position: "fixed", left: 100, zIndex: 999}} onClick={() => setActiveSnapPointIndex(0)}>index 0</button>
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
            <motion.div style={{ width: "100%" , background: "blue"}} animate={{ height: activeSnapPointIndex === 1 ? 300 : 100 }}>

            </motion.div>
            {/*<div>*/}
            {/*  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do*/}
            {/*  eiusmod tempor incididunt ut labore et dolore magna aliqua. Egestas*/}
            {/*  purus viverra accumsan in nisl nisi. Arcu cursus vitae congue mauris*/}
            {/*  rhoncus aenean vel elit scelerisque. In egestas erat imperdiet sed*/}
            {/*  euismod nisi porta lorem mollis. Morbi tristique senectus et netus.*/}
            {/*  Mattis pellentesque id nibh tortor id aliquet lectus proin. Sapien*/}
            {/*  faucibus et molestie ac feugiat sed lectus vestibulum. Ullamcorper*/}
            {/*  velit sed ullamcorper morbi tincidunt ornare massa eget. Dictum*/}
            {/*  varius duis at consectetur lorem. Nisi vitae suscipit tellus mauris*/}
            {/*  a diam maecenas sed enim. Velit ut tortor pretium viverra*/}

            {/*</div>*/}
          </Sheet.DynamicHeight>
        </Sheet.Container>
      </Sheet>
    </>
  );
}

export default App;
