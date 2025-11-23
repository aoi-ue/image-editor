import React from 'react';
import { Square, Circle, Triangle } from 'lucide-react';
import * as fabric from 'fabric';
import { useDrawing } from '../store/DrawingStore';

interface PanelProps {
    fabricCanvasRef: React.RefObject<fabric.Canvas | null>;
}

const Panel: React.FC<PanelProps> = ({ fabricCanvasRef }) => {
    const {
        selectedTool,
        selectedShape,
        setSelectedShape,
        selectedColor,
        setSelectedColor,
        saveToHistory,
    } = useDrawing();

    // --- HANDLER FUNCTION ---
    const handleColorFill = (): void => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) {
            return;
        }

        canvas.backgroundColor = selectedColor;
        canvas.renderAll();

        saveToHistory('fill', {
            color: selectedColor,
            objectId: null,
        });
    };

    // --- RENDER LOGIC ---

    if (
        !selectedTool ||
        (selectedTool !== 'shape' &&
            selectedTool !== 'fill' &&
            selectedTool !== 'brush')
    ) {
        return null;
    }

    return (
        <div className="absolute top-20 left-4 bg-white shadow-lg rounded-lg p-4 z-10 min-w-[200px]">
            <h3 className="font-semibold mb-3 text-sm">Controls</h3>

            {selectedTool === 'shape' && (
                <div className="space-y-3">
                    <div>
                        <label className="text-xs text-gray-600 block mb-2">
                            Shape
                        </label>
                        <div className="flex gap-2">
                            {['rectangle', 'circle', 'triangle'].map(
                                (shape) => (
                                    <button
                                        key={shape}
                                        onClick={() =>
                                            setSelectedShape(shape)
                                        }
                                        className={`p-2 rounded border transition-colors ${
                                            selectedShape === shape
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                        type="button"
                                    >
                                        {shape === 'rectangle' && (
                                            <Square size={16} />
                                        )}
                                        {shape === 'circle' && (
                                            <Circle size={16} />
                                        )}
                                        {shape === 'triangle' && (
                                            <Triangle size={16} />
                                        )}
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-gray-600 block mb-2">
                            Color
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={selectedColor}
                                onChange={(e) =>
                                    setSelectedColor(e.target.value)
                                }
                                className="w-12 h-12 rounded cursor-pointer border border-gray-300"
                            />
                            <span className="text-xs text-gray-500">
                                {selectedColor}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {selectedTool === 'fill' && (
                <div className="space-y-3">
                    <div>
                        <label className="text-xs text-gray-600 block mb-2">
                            Background Color
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={selectedColor}
                                onChange={(e) =>
                                    setSelectedColor(e.target.value)
                                }
                                className="w-12 h-12 rounded cursor-pointer border border-gray-300"
                            />
                            <span className="text-xs text-gray-500">
                                {selectedColor}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={handleColorFill}
                        className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors font-medium"
                        type="button"
                    >
                        Apply Fill
                    </button>
                </div>
            )}

            {selectedTool === 'brush' && (
                <div>
                    <label className="text-xs text-gray-600 block mb-2">
                        Brush Color
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            type="color"
                            value={selectedColor}
                            onChange={(e) =>
                                setSelectedColor(e.target.value)
                            }
                            className="w-12 h-12 rounded cursor-pointer border border-gray-300"
                        />
                        <span className="text-xs text-gray-500">
                            {selectedColor}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Panel;
