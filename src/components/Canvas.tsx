import React, { useEffect, useRef } from 'react';
import { useDrawing } from '../store/DrawingStore';
import * as fabric from 'fabric';

interface CanvasProps {
    fabricCanvasRef: React.RefObject<fabric.Canvas | null>;
}

const Canvas: React.FC<CanvasProps> = ({ fabricCanvasRef }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const brushPathRef = useRef<fabric.Path | null>(null);

    const {
        selectedTool,
        selectedShape,
        selectedColor,
        isDrawing,
        setIsDrawing,
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

    // TODO: v5 mouse events to v6
    useEffect(() => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        canvas.off('mouse:down');
        canvas.off('mouse:move');
        canvas.off('mouse:up');

        canvas.on('mouse:down', handleMouseDown);
        canvas.on('mouse:move', handleMouseMove);
        canvas.on('mouse:up', handleMouseUp);
    }, [
        selectedTool,
        selectedColor,
        selectedShape,
        isDrawing,
        fabricCanvasRef,
    ]);

    const handleMouseDown = (e: fabric.TEvent): void => {
        const canvas = fabricCanvasRef.current;
        if (!selectedTool || !canvas || !e.e) return;

        if (selectedTool === 'shape' || selectedTool === 'brush') {
            canvas.selection = false;
            canvas.discardActiveObject();
        }

        const pointer = canvas.getViewportPoint(e.e);

        if (selectedTool === 'shape') {
            let shape: fabric.Object | null = null;
            const options = {
                left: pointer.x - 50,
                top: pointer.y - 50,
                fill: selectedColor,
                selectable: true,
                hasControls: true,
                hasBorders: true,
            };

            if (selectedShape === 'rectangle') {
                shape = new fabric.Rect({
                    ...options,
                    width: 100,
                    height: 100,
                });
            } else if (selectedShape === 'circle') {
                shape = new fabric.Circle({ ...options, radius: 50 });
            } else if (selectedShape === 'triangle') {
                shape = new fabric.Triangle({
                    ...options,
                    width: 100,
                    height: 100,
                });
            }
            // TODO: hahahhaha no 'any' pls :)
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
        } else if (selectedTool === 'brush') {
            setIsDrawing(true);
            const path = new fabric.Path(
                `M ${pointer.x} ${pointer.y}`,
                {
                    stroke: selectedColor,
                    strokeWidth: 3,
                    fill: '',
                    selectable: false,
                }
            );
            brushPathRef.current = path;
            canvas.add(path);
        }
    };

    const handleMouseMove = (e: fabric.TEvent): void => {
        if (
            !isDrawing ||
            selectedTool !== 'brush' ||
            !brushPathRef.current ||
            !fabricCanvasRef.current ||
            !e.e
        )
            return;

        const pointer = fabricCanvasRef.current.getPointer(e.e);
        const path = brushPathRef.current;
        (path.path as any).push(['L', pointer.x, pointer.y]);
        fabricCanvasRef.current.renderAll();
    };

    // TO FIX: use freehand brush, see: https://fabricjs.com/api/classes/canvas/#freedrawingbrush
    const handleMouseUp = (): void => {
        if (selectedTool === 'brush' && isDrawing) {
            setIsDrawing(false);
            if (brushPathRef.current) {
                (brushPathRef.current as any)._layerId = Date.now();
                saveToHistory('brush', {
                    color: selectedColor,
                    objectId: (brushPathRef.current as any)._layerId,
                });
            }
            brushPathRef.current = null;
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center p-8">
            <div className="bg-white shadow-lg">
                <canvas ref={canvasRef} />
            </div>
        </div>
    );
};

export default Canvas;
