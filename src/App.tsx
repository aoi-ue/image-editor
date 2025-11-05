import React, { useRef } from 'react';
import * as fabric from 'fabric'; // v6
import { DrawingProvider, useDrawing } from './store/DrawingStore';
import { Canvas, Layers, Panel, Toolbar } from './components';

const DrawingApp: React.FC = () => {
    const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
    const brushPathRef = useRef<fabric.Path | null>(null);

    const {
        selectedTool,
        selectedShape,
        selectedColor,
        isDrawing,
        setIsDrawing,
        saveToHistory,
        layers,
        removeLayer,
        history,
        historyIndex,
        setHistoryIndex,
        setLayers,
        setHistory,
    } = useDrawing();

    React.useEffect(() => {
        if (!fabricCanvasRef.current) return;

        const canvas = fabricCanvasRef.current;
        canvas.off('mouse:down');
        canvas.off('mouse:move');
        canvas.off('mouse:up');

        canvas.on('mouse:down', handleMouseDown);
        canvas.on('mouse:move', handleMouseMove);
        canvas.on('mouse:up', handleMouseUp);
    }, [selectedTool, selectedColor, selectedShape, isDrawing]);

    const handleMouseDown = (e: fabric.TEvent): void => {
        if (!selectedTool || !fabricCanvasRef.current || !e.e) return;

        const pointer = fabricCanvasRef.current.getViewportPoint(e.e);

        if (selectedTool === 'shape') {
            fabricCanvasRef.current.selection = false;
            fabricCanvasRef.current.discardActiveObject();

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

            if (shape) {
                const layerId = Date.now();
                (shape as any)._layerId = layerId;
                fabricCanvasRef.current.add(shape);
                fabricCanvasRef.current.renderAll();
                saveToHistory('shape', {
                    shape: selectedShape,
                    color: selectedColor,
                    objectId: layerId,
                });
            }
        } else if (selectedTool === 'brush') {
            fabricCanvasRef.current.selection = false;
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
            fabricCanvasRef.current.add(path);
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

        const pointer = fabricCanvasRef.current.getViewportPoint(e.e);
        const path = brushPathRef.current;

        if (path && path.path) {
            (path.path as any).push(['L', pointer.x, pointer.y]);
            fabricCanvasRef.current.renderAll();
        }
    };

    const handleMouseUp = (): void => {
        if (selectedTool === 'brush' && isDrawing) {
            setIsDrawing(false);
            if (brushPathRef.current) {
                const layerId = Date.now();
                (brushPathRef.current as any)._layerId = layerId;

                // Store the path data for potential redo
                const pathData =
                    (brushPathRef.current.path as any) || [];

                saveToHistory('brush', {
                    color: selectedColor,
                    objectId: layerId,
                    pathData: pathData.map((p: any) => p.slice()), // Deep copy
                });
            }
            brushPathRef.current = null;
        }
    };

    const handleColorFill = (): void => {
        if (!fabricCanvasRef.current) return;
        const canvas = fabricCanvasRef.current;
        canvas.backgroundColor = selectedColor;
        canvas.renderAll();
        saveToHistory('fill', {
            color: selectedColor,
            objectId: null,
        });
    };
    // todo: bugged idk how to fix alr lol
    const handleImageUpload = (
        e: React.ChangeEvent<HTMLInputElement>
    ): void => {
        const file = e.target.files?.[0];
        if (!file || !fabricCanvasRef.current) return;

        const reader = new FileReader();
        reader.onload = (event: ProgressEvent<FileReader>) => {
            if (!fabricCanvasRef.current || !event.target?.result)
                return;

            const imageUrl = event.target.result as string; // Store the data URL

            //todo: upload image still using old fabric v5 method
            fabric.Image.fromURL(imageUrl, (img: fabric.Image) => {
                img.scale(0.5);
                img.set({ left: 100, top: 100 });
                const layerId = Date.now();
                (img as any)._layerId = layerId;
                fabricCanvasRef.current!.add(img);
                fabricCanvasRef.current!.renderAll();

                // Save to history including the URL for Redo
                saveToHistory('image', {
                    imageName: file.name,
                    objectId: layerId,
                    url: imageUrl, // CRITICAL: Save URL for Redo
                });
            });
        };

        // CRITICAL: Clear input value to enable re-uploading the same file
        e.target.value = '';
        reader.readAsDataURL(file);
    };

    const handleDeleteLayer = (layerIndex: number): void => {
        const layer = layers[layerIndex];
        if (!layer || !fabricCanvasRef.current) return;

        const canvas = fabricCanvasRef.current;

        if (layer.objectId) {
            const objects = canvas.getObjects();
            const objToRemove = objects.find(
                (obj: any) => obj._layerId === layer.objectId
            );

            if (objToRemove) {
                canvas.remove(objToRemove);
                canvas.renderAll();
            }
        } else if (layer.type === 'fill') {
            canvas.backgroundColor = '#ffffff';
            canvas.renderAll();
        }

        removeLayer(layerIndex);
        setHistory(
            (prev) =>
                prev.filter((item) => item.layer.id !== layer.id) // Filter by layer.id
        );
        // This history manipulation is still complex, but filtering by unique ID is better than index
        // todo: run the context state again, history did not store the last location of shapes
        if (historyIndex >= 0) {
            setHistoryIndex((prev) => Math.max(-1, prev - 1));
        }
    };

    const handleUndo = (): void => {
        if (layers.length > 0 && historyIndex >= 0) {
            const layer = layers[layers.length - 1];

            if (!fabricCanvasRef.current) return;
            const canvas = fabricCanvasRef.current;

            if (layer.objectId) {
                const objects = canvas.getObjects();
                const objToRemove = objects.find(
                    (obj: any) => obj._layerId === layer.objectId
                );

                if (objToRemove) {
                    canvas.remove(objToRemove);
                    canvas.renderAll();
                }
            } else if (layer.type === 'fill') {
                canvas.backgroundColor = '#ffffff';
                canvas.renderAll();
            }

            setLayers((prev) => prev.slice(0, -1));
            setHistoryIndex((prev) => prev - 1);
        }
    };

    const handleRedo = (): void => {
        if (
            historyIndex < history.length - 1 &&
            fabricCanvasRef.current
        ) {
            const nextIndex = historyIndex + 1;
            const historyItem = history[nextIndex];
            const canvas = fabricCanvasRef.current;
            const { data } = historyItem;

            if (historyItem.actionType === 'shape') {
                let shape: fabric.Object | null = null;
                const options = {
                    left: 100,
                    top: 100,
                    fill: data.color,
                    selectable: true,
                    hasControls: true,
                    hasBorders: true,
                };

                if (data.shape === 'rectangle') {
                    shape = new fabric.Rect({
                        ...options,
                        width: 100,
                        height: 100,
                    });
                } else if (data.shape === 'circle') {
                    shape = new fabric.Circle({
                        ...options,
                        radius: 50,
                    });
                } else if (data.shape === 'triangle') {
                    shape = new fabric.Triangle({
                        ...options,
                        width: 100,
                        height: 100,
                    });
                }

                if (shape) {
                    (shape as any)._layerId = data.objectId;
                    canvas.add(shape);
                    canvas.renderAll();
                }
            } else if (historyItem.actionType === 'brush') {
                // Redo Brush: reconstruct path using saved pathData
                if (data.pathData) {
                    const path = new fabric.Path(
                        '', // Start with empty path
                        {
                            stroke: data.color,
                            strokeWidth: 3,
                            fill: '',
                            selectable: false,
                        }
                    );
                    (path as any)._layerId = data.objectId;
                    (path.path as any) = data.pathData; // Reassign the path coordinates
                    canvas.add(path);
                    canvas.renderAll();
                }
            } else if (historyItem.actionType === 'image') {
                // Redo Image: Load from the saved data URL
                const imageUrl = data.url;
                if (imageUrl) {
                    fabric.Image.fromURL(
                        imageUrl,
                        (img: fabric.Image) => {
                            img.scale(0.5);
                            img.set({ left: 100, top: 100 });
                            (img as any)._layerId = data.objectId;
                            canvas.add(img);
                            canvas.renderAll();
                        }
                    );
                }
            } else if (historyItem.actionType === 'fill') {
                canvas.backgroundColor = historyItem.data.color;
                canvas.renderAll();
            }

            setLayers((prev) => [...prev, historyItem.layer]);
            setHistoryIndex(nextIndex);
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            <div className="flex-1 flex flex-col min-w-0">
                <Toolbar
                    onColorFill={handleColorFill}
                    onImageUpload={handleImageUpload}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                />
                <Panel onColorFill={handleColorFill} />
                <Canvas fabricCanvasRef={fabricCanvasRef} />
            </div>
            <Layers onDeleteLayer={handleDeleteLayer} />
        </div>
    );
};

const App: React.FC = () => (
    <DrawingProvider>
        <DrawingApp />
    </DrawingProvider>
);

export default App;
