import React, { useState } from 'react';
import { CustomizationOptions, ReorderableSectionKey, ResumeData } from '../types';

interface LayoutEditorProps {
    customization: CustomizationOptions;
    setCustomization: React.Dispatch<React.SetStateAction<CustomizationOptions>>;
    sectionTitles: ResumeData['sectionTitles'];
}

const LayoutEditor: React.FC<LayoutEditorProps> = ({ customization, setCustomization, sectionTitles }) => {
    const { sectionOrder } = customization;
    const [draggedItem, setDraggedItem] = useState<ReorderableSectionKey | null>(null);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, item: ReorderableSectionKey) => {
        setDraggedItem(item);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetItem: ReorderableSectionKey) => {
        e.preventDefault();
        if (!draggedItem || draggedItem === targetItem) {
            setDraggedItem(null);
            return;
        }

        const currentIndex = sectionOrder.indexOf(draggedItem);
        const targetIndex = sectionOrder.indexOf(targetItem);

        const newOrder = [...sectionOrder];
        newOrder.splice(currentIndex, 1);
        newOrder.splice(targetIndex, 0, draggedItem);
        
        setCustomization(prev => ({ ...prev, sectionOrder: newOrder }));
        setDraggedItem(null);
    };
    
    const handleDragEnd = () => {
        setDraggedItem(null);
    }

    return (
        <div className="p-2 space-y-4">
            <div>
                <h3 className="text-lg font-semibold mb-2">Section Order</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Drag and drop to reorder the sections on your resume.</p>
            </div>
            <div className="space-y-2">
                {sectionOrder.map(sectionKey => (
                    <div
                        key={sectionKey}
                        draggable
                        onDragStart={(e) => handleDragStart(e, sectionKey)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, sectionKey)}
                        onDragEnd={handleDragEnd}
                        className={`p-3 flex items-center bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md cursor-grab active:cursor-grabbing transition-opacity ${draggedItem === sectionKey ? 'opacity-50' : ''}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                        <span className="font-medium">{sectionTitles[sectionKey]}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LayoutEditor;