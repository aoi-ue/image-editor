import React, { useEffect, useRef } from 'react';
import { useDrawing } from '../store/DrawingStore';
import * as fabric from 'fabric';
interface CanvasProps {
    fabricCanvasRef: React.RefObject<fabric.Canvas | null>;
}
const Canvas: React.FC<CanvasProps> = ({ fabricCanvasRef }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const {
        selectedTool,
        selectedShape,
        selectedColor,
        saveToHistory,
    } = useDrawing();

    // Initial Fabric Canvas Setup
    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = new fabric.Canvas(canvasRef.current, {
            width: 800,
            height: 600,
            backgroundColor: '#ffffff',
            selection: true,
        });

        fabricCanvasRef.current = canvas;

        return () => {
            if (fabricCanvasRef.current) {
                fabricCanvasRef.current.dispose();
            }
        };
    }, [fabricCanvasRef]);

    // Handler for saving the brush stroke after it's drawn
    const handlePathCreated = (e: fabric.IEvent): void => {
        const path = e.path;
        if (path) {
            (path as any)._layerId = Date.now();
            saveToHistory('brush', {
                color: path.stroke,
                objectId: (path as any)._layerId,
            });
        }
    };

    // Handle shape creation on mouse move
    const handleMouseDown = (e: fabric.TEvent): void => {
        const canvas = fabricCanvasRef.current;
        if (!selectedTool || !canvas || !e.e) return;

        if (selectedTool === 'shape') {
            canvas.selection = false;
            canvas.discardActiveObject();

            const pointer = canvas.getViewportPoint(e.e);
            let shape: fabric.Object | null = null;

            const options = {
                left: pointer.x - 50,
                top: pointer.y - 50,
                fill: selectedColor,
                selectable: true,
                hasControls: true,
                hasBorders: true,
            };

            switch (selectedShape) {
                case 'rectangle':
                    shape = new fabric.Rect({
                        ...options,
                        width: 100,
                        height: 100,
                    });
                    break;
                case 'circle':
                    shape = new fabric.Circle({
                        ...options,
                        radius: 50,
                    });
                    break;
                case 'triangle':
                    shape = new fabric.Triangle({
                        ...options,
                        width: 100,
                        height: 100,
                    });
                    break;
                default:
                    return;
            }

            if (shape) {
                (shape as any)._layerId = Date.now();
                canvas.add(shape);
                canvas.renderAll();
                saveToHistory('shape', {
                    shape: selectedShape,
                    color: selectedColor,
                    objectId: (shape as any)._layerId,
                });
            }
        }
    };

    // Event handling: brush uses native drawing mode, shapes use custom mouse handler
    useEffect(() => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        // Clean up previous listeners
        canvas.off('mouse:down', handleMouseDown);
        canvas.off('path:created', handlePathCreated);

        if (selectedTool === 'brush') {
            // Initialize PencilBrush if needed
            if (!canvas.freeDrawingBrush) {
                canvas.freeDrawingBrush = new fabric.PencilBrush(
                    canvas
                );
            }

            // Enable native free drawing mode
            canvas.isDrawingMode = true;
            canvas.freeDrawingBrush.width = 3;
            canvas.freeDrawingBrush.color = selectedColor;
            canvas.selection = false;

            // Listen for finished brush strokes
            canvas.on('path:created', handlePathCreated);
        } else if (selectedTool === 'shape') {
            // Disable free drawing mode for shape tool
            canvas.isDrawingMode = false;
            canvas.selection = false;

            // Enable shape creation handler
            canvas.on('mouse:down', handleMouseDown);
        } else {
            // For other tools (select, fill), allow normal selection
            canvas.isDrawingMode = false;
            canvas.selection = true;
        }

        return () => {
            canvas.off('mouse:down', handleMouseDown);
            canvas.off('path:created', handlePathCreated);
        };
    }, [selectedTool, selectedColor, selectedShape, fabricCanvasRef]);

    return (
        <div className="flex-1 flex items-center justify-center p-8">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <canvas ref={canvasRef} />
            </div>
        </div>
    );
};
export default Canvas;
