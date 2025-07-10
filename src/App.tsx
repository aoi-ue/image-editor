import type Konva from "konva";
import { useRef, useState } from "react";
import { Layer, Rect, Stage, Text } from "react-konva";

type RectType = {
  x: number;
  y: number;
  width: number;
  height: number;
  id: string;
};

function App() {
  const [rects, setRects] = useState<RectType[]>([]);
  const [newRect, setNewRect] = useState<RectType | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  function downloadURI(uri: string, name: string): void {
    const link: HTMLAnchorElement = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const stageRef = useRef<Konva.Stage | null>(null);

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = stageRef.current;
    // Check if clicked on empty area (the stage itself)
    const clickedOnEmpty = e.target === stage;
    if (!clickedOnEmpty) return;

    if (stage) {
      const pointerPosition = stage.getPointerPosition();
      if (pointerPosition) {
        const { x, y } = pointerPosition;
        setNewRect({ x, y, width: 0, height: 0, id: Date.now().toString() });
        setIsDrawing(true);
      }
    }
  };

  const handleMouseMove = () => {
    if (!newRect || !isDrawing) return;
    const stage = stageRef.current;
    if (stage) {
      const pointerPosition = stage.getPointerPosition();
      if (pointerPosition) {
        const { x, y } = pointerPosition;
        setNewRect({
          ...newRect,
          width: x - newRect.x,
          height: y - newRect.y,
        });
      }
    }
  };

  const handleMouseUp = () => {
    if (newRect) {
      setRects([...rects, newRect]);
    }
    setNewRect(null);
    setIsDrawing(false);
  };

  const handleExport = () => {
    if (!stageRef.current) return;
    const uri = stageRef.current.toDataURL();
    downloadURI(uri, "stage.png");
  };

  return (
    <div>
      <h2 style={{ textAlign: "center" }}>React + Konva Drawing App</h2>
      <button onClick={handleExport}>
        Click here to export stage as image
      </button>
      <Stage
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        width={window.innerWidth}
        height={500}
        style={{
          background: "#f0f0f0",
        }}
        ref={stageRef}
      >
        <Layer>
          <Text text="Try to drag shapes" fontSize={15} />

          {rects.map((rect) => (
            <Rect key={rect.id} {...rect} fill="rgba(0,0,255,0.5)" draggable />
          ))}

          {newRect && <Rect {...newRect} fill="rgba(0,0,255,0.3)" />}
        </Layer>
      </Stage>
    </div>
  );
}

export default App;
