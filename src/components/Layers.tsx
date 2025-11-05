import React from 'react';
import { Trash2 } from 'lucide-react';
import { useDrawing, type Layer } from '../store/DrawingStore';

interface LayersProps {
    onDeleteLayer: (layerIndex: number) => void;
}

const Layers: React.FC<LayersProps> = ({ onDeleteLayer }) => {
    const { layers } = useDrawing();

    return (
        <div className="w-64 bg-white shadow-lg p-4 overflow-y-auto">
            <h2 className="font-semibold mb-4">Layers</h2>
            {layers.length === 0 ? (
                <p className="text-sm text-gray-500">No layers yet</p>
            ) : (
                <div className="space-y-2">
                    {layers.map((layer: Layer, index: number) => (
                        <div
                            key={layer.id}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100"
                        >
                            <div className="flex-1">
                                <div className="text-sm font-medium capitalize">
                                    {layer.type}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {layer.timestamp}
                                </div>
                            </div>
                            <button
                                onClick={() => onDeleteLayer(index)}
                                className="p-1 hover:bg-red-100 rounded"
                                title="Delete layer"
                            >
                                <Trash2
                                    size={16}
                                    className="text-red-600"
                                />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Layers;
