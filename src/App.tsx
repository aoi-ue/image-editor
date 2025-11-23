import React, { useRef, useCallback } from 'react';
import * as fabric from 'fabric';
import { DrawingProvider } from './store/DrawingStore';
import { Canvas, Layers, Panel, Toolbar } from './components';

const DrawingApp: React.FC = () => {
    const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

    // A centralized function to handle object removal by ID, used in Undo/Delete
    const removeObjectByLayerId = useCallback(
        (layerId: number): void => {
            const canvas = fabricCanvasRef.current;
            if (!canvas) {
                return;
            }

            // Explicitly define the objects array as an array of fabric.Object
            const objects: fabric.Object[] = canvas.getObjects();

            // Find the object. We need to tell TypeScript that obj *might* have _layerId
            const objToRemove = objects.find(
                // We extend the fabric.Object type inline to include the custom property
                (obj: fabric.Object & { _layerId?: number }) =>
                    obj._layerId === layerId
            );

            if (objToRemove) {
                canvas.remove(objToRemove);
                canvas.renderAll();
            }
        },
        []
    );

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            <div className="flex-1 flex flex-col min-w-0">
                {/* Pass ref to Toolbar */}
                <Toolbar
                    fabricCanvasRef={fabricCanvasRef}
                    removeObjectByLayerId={removeObjectByLayerId}
                />

                {/* Pass ref to Panel */}
                <Panel fabricCanvasRef={fabricCanvasRef} />

                {/* Canvas sets the ref */}
                <Canvas fabricCanvasRef={fabricCanvasRef} />
            </div>

            {/* Pass ref to Layers */}
            <Layers
                fabricCanvasRef={fabricCanvasRef}
                removeObjectByLayerId={removeObjectByLayerId}
            />
        </div>
    );
};

const App: React.FC = () => (
    <DrawingProvider>
        <DrawingApp />
    </DrawingProvider>
);

export default App;
