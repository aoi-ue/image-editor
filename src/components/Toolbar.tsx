import React, { useRef } from 'react';
import {
    Square,
    Paintbrush,
    Droplet,
    Undo,
    Redo,
    Upload,
} from 'lucide-react';
import * as fabric from 'fabric';
import { useDrawing } from '../store/DrawingStore';

interface ToolbarProps {
    fabricCanvasRef: React.RefObject<fabric.Canvas | null>;
    removeObjectByLayerId: (layerId: number) => void;
    onToolbarClick: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
    fabricCanvasRef,
    removeObjectByLayerId,
    onToolbarClick,
}) => {
    const {
        selectedTool,
        setSelectedTool,
        canUndo,
        canRedo,
        history,
        historyIndex,
        setHistoryIndex,
        setLayers,
        saveToHistory,
    } = useDrawing();

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (
        e: React.ChangeEvent<HTMLInputElement>
    ): void => {
        const file = e.target.files?.[0];
        const canvas = fabricCanvasRef.current;
        if (!file || !canvas) return;

        const reader = new FileReader();
        reader.onload = (event: ProgressEvent<FileReader>) => {
            if (!event.target?.result) return;

            const imageUrl = event.target.result as string;

            fabric.Image.fromURL(imageUrl, (img: fabric.Image) => {
                img.scale(0.5);
                img.set({ left: 100, top: 100 });
                const layerId = Date.now();
                (img as any)._layerId = layerId;
                canvas.add(img);
                canvas.renderAll();

                saveToHistory('image', {
                    imageName: file.name,
                    objectId: layerId,
                    url: imageUrl,
                });
            });
        };

        e.target.value = '';
        reader.readAsDataURL(file);
    };

    const handleUndo = (): void => {
        const canvas = fabricCanvasRef.current;
        if (historyIndex >= 0 && canvas) {
            const historyItem = history[historyIndex];

            if (historyItem.layer.objectId) {
                removeObjectByLayerId(historyItem.layer.objectId);
            } else if (historyItem.actionType === 'fill') {
                canvas.backgroundColor = '#ffffff';
                canvas.renderAll();
            }

            setLayers((prev) => prev.slice(0, -1));
            setHistoryIndex((prev) => prev - 1);
        }
    };

    const handleRedo = (): void => {
        const canvas = fabricCanvasRef.current;
        if (historyIndex < history.length - 1 && canvas) {
            const nextIndex = historyIndex + 1;
            const historyItem = history[nextIndex];
            const { data } = historyItem;
            const layerId = data.objectId;

            if (historyItem.actionType === 'shape') {
                let shape: fabric.Object | null = null;
                const options = {
                    left: data.left ?? 100,
                    top: data.top ?? 100,
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
                    (shape as any)._layerId = layerId;
                    canvas.add(shape);
                    canvas.renderAll();
                }
            } else if (historyItem.actionType === 'brush') {
                if (data.pathData) {
                    const path = new fabric.Path('', {
                        stroke: data.color,
                        strokeWidth: 3,
                        fill: '',
                        selectable: true,
                    });
                    (path as any)._layerId = layerId;
                    path.set({ path: data.pathData });
                    canvas.add(path);
                    canvas.renderAll();
                }
            } else if (historyItem.actionType === 'image') {
                const imageUrl = data.url;
                if (imageUrl) {
                    fabric.Image.fromURL(
                        imageUrl,
                        (img: fabric.Image) => {
                            img.scale(0.5);
                            img.set({ left: 100, top: 100 });
                            (img as any)._layerId = layerId;
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

    const tools = [
        { id: 'shape', icon: Square, label: 'Shape' },
        { id: 'fill', icon: Droplet, label: 'Fill' },
        { id: 'brush', icon: Paintbrush, label: 'Brush' },
        { id: 'upload', icon: Upload, label: 'Upload Image' },
    ];

    const handleToolClick = (toolId: string) => {
        if (toolId === 'upload') {
            fileInputRef.current?.click();
        } else {
            setSelectedTool(toolId);
            onToolbarClick();
        }
    };

    return (
        <div className="bg-white shadow-sm p-4 flex items-center gap-2">
            {tools.map((tool) => (
                <button
                    key={tool.id}
                    onClick={() => handleToolClick(tool.id)}
                    className={`p-2 rounded hover:bg-gray-100 transition-colors ${
                        selectedTool === tool.id ? 'bg-blue-100' : ''
                    }`}
                    title={tool.label}
                    type="button"
                >
                    <tool.icon size={20} />
                </button>
            ))}

            <div className="w-px h-6 bg-gray-300 mx-2" />

            <button
                onClick={handleUndo}
                disabled={!canUndo}
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 transition-colors"
                title="Undo"
                type="button"
            >
                <Undo size={20} />
            </button>

            <button
                onClick={handleRedo}
                disabled={!canRedo}
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 transition-colors"
                title="Redo"
                type="button"
            >
                <Redo size={20} />
            </button>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
            />
        </div>
    );
};

export default Toolbar;