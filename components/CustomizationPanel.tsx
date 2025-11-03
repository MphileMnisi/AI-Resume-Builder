import React, { useEffect } from 'react';
import { CustomizationOptions, HeaderAlignment } from '../types';
import { TEMPLATES, COLORS, FONTS } from '../constants';

interface CustomizationPanelProps {
    customization: CustomizationOptions;
    setCustomization: React.Dispatch<React.SetStateAction<CustomizationOptions>>;
}

const ToggleSwitch: React.FC<{ label: string; checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ label, checked, onChange }) => (
    <label className="flex items-center justify-between cursor-pointer">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
        <div className="relative">
            <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
            <div className="w-11 h-6 bg-slate-200 dark:bg-slate-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </div>
    </label>
);

const CustomizationPanel: React.FC<CustomizationPanelProps> = ({ customization, setCustomization }) => {
    const handleChange = (field: keyof CustomizationOptions, value: any) => {
        setCustomization(prev => ({ ...prev, [field]: value }));
    };

    // This effect ensures the font size stays within the allowed range (5-10).
    // If a value from localStorage is outside this range, it will be adjusted.
    useEffect(() => {
        if (customization.fontSize > 10) {
            handleChange('fontSize', 10);
        }
    }, [customization.fontSize]);

    const handleVisibilityChange = (section: keyof CustomizationOptions['sectionVisibility'], isVisible: boolean) => {
        setCustomization(prev => ({
            ...prev,
            sectionVisibility: {
                ...prev.sectionVisibility,
                [section]: isVisible
            }
        }));
    };

    return (
        <div className="space-y-6 p-2">
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Template</label>
                <div className="grid grid-cols-2 gap-2">
                    {TEMPLATES.map(template => (
                        <button
                            key={template.key}
                            onClick={() => handleChange('template', template.key)}
                            className={`p-2 border rounded-md text-center text-sm transition ${customization.template === template.key ? 'border-blue-500 ring-2 ring-blue-500' : 'border-slate-300 dark:border-slate-600 hover:border-blue-400'}`}
                        >
                            {template.name}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Accent Color</label>
                <div className="flex space-x-2 mt-2">
                    {COLORS.map(color => (
                        <button
                            key={color.key}
                            onClick={() => handleChange('color', color.key)}
                            className={`w-8 h-8 rounded-full border-2 ${customization.color === color.key ? 'ring-2 ring-offset-2 ring-offset-slate-100 dark:ring-offset-slate-800 ring-blue-500' : 'border-transparent'}`}
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                        />
                    ))}
                </div>
            </div>

            <div>
                <label htmlFor="font-select" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Font Family</label>
                <select
                    id="font-select"
                    value={customization.font}
                    onChange={(e) => handleChange('font', e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                    {FONTS.map(font => (
                        <option key={font.key} value={font.key}>{font.name}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="font-size" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Font Size ({customization.fontSize}pt)</label>
                    <input
                        id="font-size"
                        type="range"
                        min="5"
                        max="10"
                        step="0.5"
                        value={customization.fontSize}
                        onChange={(e) => handleChange('fontSize', parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer mt-2"
                    />
                </div>
                 <div>
                    <label htmlFor="line-height" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Line Height ({customization.lineHeight.toFixed(1)})</label>
                    <input
                        id="line-height"
                        type="range"
                        min="1.2"
                        max="2.0"
                        step="0.1"
                        value={customization.lineHeight}
                        onChange={(e) => handleChange('lineHeight', parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer mt-2"
                    />
                </div>
            </div>
            
            <div>
                <label htmlFor="section-spacing" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Section Spacing ({(customization.sectionSpacing * 0.25).toFixed(2)}rem)</label>
                <input
                    id="section-spacing"
                    type="range"
                    min="4"
                    max="12"
                    step="1"
                    value={customization.sectionSpacing}
                    onChange={(e) => handleChange('sectionSpacing', parseInt(e.target.value, 10))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer mt-2"
                />
            </div>
            
             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Header Alignment</label>
                <div className="grid grid-cols-3 gap-2">
                    {(['left', 'center', 'right'] as HeaderAlignment[]).map(align => (
                        <button
                            key={align}
                            onClick={() => handleChange('headerAlignment', align)}
                            // FIX: Corrected the invalid ternary operator which had an extra condition, causing a syntax error.
                            className={`p-2 border rounded-md text-center text-sm capitalize transition ${customization.headerAlignment === align ? 'border-blue-500 ring-2 ring-blue-500' : 'border-slate-300 dark:border-slate-600 hover:border-blue-400'}`}
                        >
                            {align}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Section Visibility</label>
                <div className="space-y-2">
                    <ToggleSwitch label="Skills" checked={customization.sectionVisibility.skills} onChange={e => handleVisibilityChange('skills', e.target.checked)} />
                    <ToggleSwitch label="Projects" checked={customization.sectionVisibility.projects} onChange={e => handleVisibilityChange('projects', e.target.checked)} />
                    <ToggleSwitch label="Custom Sections" checked={customization.sectionVisibility.customSections} onChange={e => handleVisibilityChange('customSections', e.target.checked)} />
                </div>
            </div>

        </div>
    );
};

export default CustomizationPanel;