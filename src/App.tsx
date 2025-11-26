import React, { useState, useRef, useCallback } from 'react';
import * as fabric from 'fabric';
import { DrawingProvider } from './store/DrawingStore';
import { Canvas, Layers, Panel, Toolbar } from './components';

const DrawingApp: React.FC = () => {
    const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    const removeObjectByLayerId = useCallback(
        (layerId: number): void => {
            const canvas = fabricCanvasRef.current;
            if (!canvas) {
                return;
            }

            const objects: fabric.Object[] = canvas.getObjects();

            const objToRemove = objects.find(
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
                <Toolbar
                    fabricCanvasRef={fabricCanvasRef}
                    removeObjectByLayerId={removeObjectByLayerId}
                    onToolbarClick={() => setIsPanelOpen(true)}
                />

                <Panel
                    fabricCanvasRef={fabricCanvasRef}
                    isOpen={isPanelOpen}
                    onClose={() => setIsPanelOpen(false)}
                />

                <Canvas fabricCanvasRef={fabricCanvasRef} />
            </div>

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