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
                console.warn(
                    'Canvas not initialized for removeObjectByLayerId'
                );
                return;
            }

            const objects = canvas.getObjects();
            const objToRemove = objects.find(
                (obj: any) => obj._layerId === layerId
            );

            if (objToRemove) {
                canvas.remove(objToRemove);
                canvas.renderAll();
                console.log('Removed object from canvas:', layerId);
            } else {
                console.warn('Object not found on canvas:', layerId);
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
