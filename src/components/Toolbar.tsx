import React, { useRef } from 'react';
import {
    Square,
    Paintbrush,
    Droplet,
    Undo,
    Redo,
    Upload,
} from 'lucide-react';
import { useDrawing } from '../store/DrawingStore';

interface ToolbarProps {
    onColorFill: () => void;
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void; // Re-add change handler prop
    onUndo: () => void;
    onRedo: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
    onColorFill,
    onImageUpload,
    onUndo,
    onRedo,
}) => {
    const { selectedTool, setSelectedTool, canUndo, canRedo } =
        useDrawing();
    const fileInputRef = useRef<HTMLInputElement>(null); // Re-introduce local ref, IMPORTANT DO NOT REMOVE

    const tools = [
        { id: 'shape', icon: Square, label: 'Shape' },
        { id: 'fill', icon: Droplet, label: 'Fill' },
        { id: 'brush', icon: Paintbrush, label: 'Brush' },
        { id: 'upload', icon: Upload, label: 'Upload Image' },
    ];

    return (
        <div className="bg-white shadow-sm p-4 flex items-center gap-2">
            {tools.map((tool) => (
                <button
                    key={tool.id}
                    onClick={() => {
                        if (tool.id === 'upload') {
                            // Now we use the local ref to trigger the click
                            fileInputRef.current?.click();
                        } else {
                            setSelectedTool(tool.id);
                        }
                    }}
                    className={`p-2 rounded hover:bg-gray-100 ${
                        selectedTool === tool.id ? 'bg-blue-100' : ''
                    }`}
                    title={tool.label}
                >
                    <tool.icon size={20} />
                </button>
            ))}

            <div className="w-px h-6 bg-gray-300 mx-2" />

            <button
                onClick={onUndo}
                disabled={!canUndo}
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
                title="Undo"
            >
                <Undo size={20} />
            </button>

            <button
                onClick={onRedo}
                disabled={!canRedo}
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
                title="Redo"
            >
                <Redo size={20} />
            </button>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onImageUpload}
                className="hidden"
            />
        </div>
    );
};

export default Toolbar;
