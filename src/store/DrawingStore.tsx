import React, {
    createContext,
    useContext,
    useState,
    type ReactNode,
} from 'react';

// --- 1. Define Types ---
export interface Layer {
    id: number;
    type: 'shape' | 'brush' | 'fill' | 'image';
    name: string; // Add name for better Layer display
    timestamp: string;
    objectId: number | null; // Corresponds to the _layerId on the fabric object
}

export interface HistoryItem {
    actionType: 'shape' | 'brush' | 'fill' | 'image';
    data: any; // Data specific to the action (color, shape type, objectId, url, etc.)
    layer: Layer;
}

interface DrawingContextType {
    // State
    selectedTool: string | null;
    selectedShape: string;
    selectedColor: string;
    isDrawing: boolean;
    layers: Layer[];
    history: HistoryItem[];
    historyIndex: number;
    canUndo: boolean;
    canRedo: boolean;

    // Setters
    setSelectedTool: (tool: string | null) => void;
    setSelectedShape: (shape: string) => void;
    setSelectedColor: (color: string) => void;
    setIsDrawing: (isDrawing: boolean) => void;
    setLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
    setHistory: React.Dispatch<React.SetStateAction<HistoryItem[]>>;
    setHistoryIndex: React.Dispatch<React.SetStateAction<number>>;

    // Actions
    addLayer: (layer: Layer) => void;
    removeLayer: (index: number) => void;
    saveToHistory: (
        actionType: 'shape' | 'brush' | 'fill' | 'image',
        data: any
    ) => void;
}

// --- 2. Create Context ---
// Initial value matches the DrawingContextType structure
const DrawingContext = createContext<DrawingContextType | undefined>(
    undefined
);

// --- 3. Context Provider Component ---
interface DrawingProviderProps {
    children: ReactNode;
}

export const DrawingProvider: React.FC<DrawingProviderProps> = ({
    children,
}) => {
    // State
    const [selectedTool, setSelectedTool] = useState<string | null>(
        'select'
    );
    const [selectedShape, setSelectedShape] =
        useState<string>('rectangle');
    const [selectedColor, setSelectedColor] =
        useState<string>('#3b82f6');
    const [layers, setLayers] = useState<Layer[]>([]);
    const [isDrawing, setIsDrawing] = useState<boolean>(false);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [historyIndex, setHistoryIndex] = useState<number>(-1);

    const addLayer = (layer: Layer): void => {
        setLayers((prev) => [...prev, layer]);
    };

    const removeLayer = (index: number): void => {
        setLayers((prev) => prev.filter((_, i) => i !== index));
    };

    // 🔑 FIXED: Improved image layer naming for the panel
    const saveToHistory = (
        actionType: 'shape' | 'brush' | 'fill' | 'image',
        data: any
    ): void => {
        let name = '';
        if (actionType === 'shape')
            name = `${data.shape} (${data.color})`;
        else if (actionType === 'brush')
            name = `Brush Stroke (${data.color})`;
        else if (actionType === 'fill')
            name = `Canvas Fill (${data.color})`;
        else if (actionType === 'image')
            name = `Image: ${data.imageName || 'New Image'}`;

        const newLayer: Layer = {
            id: Date.now(),
            type: actionType,
            name: name,
            timestamp: new Date().toLocaleTimeString(),
            objectId: data.objectId,
        };

        setHistoryIndex((prevIndex) => {
            setHistory((prev) => {
                const newHistory = prev.slice(0, prevIndex + 1);
                newHistory.push({
                    layer: newLayer,
                    actionType,
                    data,
                });
                return newHistory;
            });
            return prevIndex + 1;
        });

        addLayer(newLayer);
    };

    const canUndo = historyIndex >= 0;
    const canRedo = historyIndex < history.length - 1;

    // --- 4. Context Value ---
    const value: DrawingContextType = {
        selectedTool,
        setSelectedTool,
        selectedShape,
        setSelectedShape,
        selectedColor,
        setSelectedColor,
        layers,
        setLayers,
        isDrawing,
        setIsDrawing,
        addLayer,
        removeLayer,
        saveToHistory,
        history,
        historyIndex,
        setHistoryIndex,
        setHistory,
        canUndo,
        canRedo,
    };

    return (
        <DrawingContext.Provider value={value}>
            {children}
        </DrawingContext.Provider>
    );
};

// --- 5. Custom Hook for Usage ---
export const useDrawing = () => {
    const context = useContext(DrawingContext);
    if (context === undefined) {
        throw new Error(
            'useDrawing must be used within a DrawingProvider'
        );
    }
    return context;
};
