import React from 'react';
import { Square, Circle, Triangle } from 'lucide-react';
import { useDrawing } from '../store/DrawingStore';
//todo: implement clickOutside hook to close panel when clicking... outside

interface PanelProps {
    onColorFill: () => void;
}

const Panel: React.FC<PanelProps> = ({ onColorFill }) => {
    const {
        selectedTool,
        selectedShape,
        setSelectedShape,
        selectedColor,
        setSelectedColor,
    } = useDrawing();

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
                                        className={`p-2 rounded border ${
                                            selectedShape === shape
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-300'
                                        }`}
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
                        onClick={onColorFill}
                        className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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
