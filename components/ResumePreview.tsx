
import React from 'react';
import { ResumeData, CustomizationOptions } from '../types';
import { TEMPLATES } from '../constants';

interface ResumePreviewProps {
    resumeData: ResumeData;
    customization: CustomizationOptions;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ resumeData, customization }) => {
    const SelectedTemplate = TEMPLATES.find(t => t.key === customization.template)?.component;

    if (!SelectedTemplate) {
        return <div className="text-red-500">Template not found!</div>;
    }

    return (
        <div id="resume-preview" className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-2 overflow-auto">
             <div className="resume-aspect-ratio-wrapper">
                <div id="resume-content" className="w-full h-full">
                    <SelectedTemplate resumeData={resumeData} customization={customization} />
                </div>
            </div>
        </div>
    );
};

export default ResumePreview;