import React from 'react';
import { Trash2 } from 'lucide-react';
import * as fabric from 'fabric';
import { useDrawing, type Layer } from '../store/DrawingStore';

interface LayersProps {
    fabricCanvasRef: React.RefObject<fabric.Canvas | null>;
    removeObjectByLayerId: (layerId: number) => void;
}

const Layers: React.FC<LayersProps> = ({
    fabricCanvasRef,
    removeObjectByLayerId,
}) => {
    const {
        layers,
        removeLayer,
        history,
        historyIndex,
        setHistoryIndex,
        setHistory,
    } = useDrawing();

    const handleDeleteLayer = (layerIndex: number): void => {
        const canvas = fabricCanvasRef.current;
        const layer = layers[layerIndex];
        if (!layer || !canvas) {
            return;
        }

        switch (layer.type) {
            case 'shape':
            case 'brush':
            case 'image':
                if (layer.objectId) {
                    removeObjectByLayerId(layer.objectId);
                }
                break;
            case 'fill':
                canvas.backgroundColor = '#ffffff';
                canvas.renderAll();
                break;
            default:
                break;
        }

        const historyItemIndex = history.findIndex(
            (h) => h.layer.id === layer.id
        );
        if (historyItemIndex !== -1) {
            const newHistory = history.filter(
                (_, i) => i !== historyItemIndex
            );
            setHistory(newHistory);

            if (historyIndex >= newHistory.length) {
                setHistoryIndex(Math.max(-1, newHistory.length - 1));
            }
        }

        removeLayer(layerIndex);
    };

    // Only render if there are layers
    if (layers.length === 0) {
        return null;
    }

    return (
        <div className="w-64 bg-white shadow-lg p-4 overflow-y-auto max-h-screen flex flex-col">
            <h2 className="font-semibold mb-4">
                Layers ({layers.length})
            </h2>
            <div className="space-y-2 flex-1 overflow-y-auto">
                {[...layers]
                    .reverse()
                    .map((layer: Layer, index: number) => {
                        const originalIndex =
                            layers.length - 1 - index;
                        return (
                            <div
                                key={layer.id}
                                className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium capitalize truncate">
                                        {layer.name}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {layer.timestamp}
                                    </div>
                                </div>
                                <button
                                    onClick={() =>
                                        handleDeleteLayer(
                                            originalIndex
                                        )
                                    }
                                    className="ml-2 p-1 hover:bg-red-100 rounded transition-colors shrink-0"
                                    title="Delete layer"
                                    type="button"
                                >
                                    <Trash2
                                        size={16}
                                        className="text-red-600"
                                    />
                                </button>
                            </div>
                        );
                    })}
            </div>
        </div>
    );
};

export default Layers;