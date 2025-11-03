import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ResumeData, CustomizationOptions, JobMatchReport, TemplateKey, FontKey, ATSReport } from './types';
import { DEFAULT_RESUME_DATA, TEMPLATES, FONTS, COLORS } from './constants';
import ResumeForm from './components/ResumeForm';
import ResumePreview from './components/ResumePreview';
import CustomizationPanel from './components/CustomizationPanel';
import JobMatchAnalyzer from './components/JobMatchAnalyzer';
import ATSAnalyzer from './components/ATSAnalyzer';
import ExportControls from './components/ExportControls';
import LayoutEditor from './components/LayoutEditor';
import ThemeToggle from './components/ThemeToggle';
import { generateResumeContent, analyzeJobMatch, analyzeATS } from './services/geminiService';
import { useLocalStorage } from './hooks/useLocalStorage';

type Theme = 'light' | 'dark';

// --- Undo/Redo Controls Component ---
interface UndoRedoControlsProps {
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
}

const UndoRedoControls: React.FC<UndoRedoControlsProps> = ({ onUndo, onRedo, canUndo, canRedo }) => {
    return (
        <div className="flex items-center space-x-1">
            <button
                onClick={onUndo}
                disabled={!canUndo}
                className="p-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Undo"
                title="Undo"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 15l-3-3m0 0l3-3m-3 3h8A5 5 0 0 0 9 5" />
                </svg>
            </button>
            <button
                onClick={onRedo}
                disabled={!canRedo}
                className="p-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Redo"
                title="Redo"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 15l3-3m0 0l-3-3m3 3H8A5 5 0 0 1 8 5" />
                </svg>
            </button>
        </div>
    );
};

// --- History State Hook ---
type SetStateAction<S> = S | ((prevState: S) => S);

const useHistoryState = <T,>(initialState: T): [T, (action: SetStateAction<T>) => void, () => void, () => void, boolean, boolean] => {
    const [history, setHistory] = useState<T[]>([initialState]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const currentState = history[currentIndex];

    const setState = useCallback((action: SetStateAction<T>) => {
        const newState = typeof action === 'function'
            ? (action as (prevState: T) => T)(currentState)
            : action;
        
        if (JSON.stringify(newState) === JSON.stringify(currentState)) {
            return;
        }
        
        const newHistory = history.slice(0, currentIndex + 1);
        newHistory.push(newState);
        setHistory(newHistory);
        setCurrentIndex(newHistory.length - 1);
    }, [history, currentIndex, currentState]);

    const undo = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    }, [currentIndex]);

    const redo = useCallback(() => {
        if (currentIndex < history.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    }, [currentIndex, history.length]);

    const canUndo = currentIndex > 0;
    const canRedo = currentIndex < history.length - 1;

    return [currentState, setState, undo, redo, canUndo, canRedo];
};


const App: React.FC = () => {
    const [initialResumeData] = useLocalStorage<ResumeData>('resumeData', DEFAULT_RESUME_DATA);
    const [resumeData, setResumeData, undo, redo, canUndo, canRedo] = useHistoryState<ResumeData>(initialResumeData);

    const [customization, setCustomization] = useLocalStorage<CustomizationOptions>('customizationOptions', {
        template: 'modern',
        color: 'blue',
        font: 'inter',
        fontSize: 10,
        lineHeight: 1.5,
        sectionSpacing: 6, // 1.5rem
        headerAlignment: 'left',
        sectionOrder: ['experience', 'education', 'skills', 'projects', 'customSections'],
        sectionVisibility: {
            skills: true,
            projects: true,
            customSections: true,
        },
    });
    const [jobDescription, setJobDescription] = useState('');
    const [matchReport, setMatchReport] = useState<JobMatchReport | null>(null);
    const [atsReport, setAtsReport] = useState<ATSReport | null>(null);
    const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
    const [activeTab, setActiveTab] = useState('form');
    const [theme, setTheme] = useLocalStorage<Theme>('theme', 'light');

    // Effect to save the current resume data state to localStorage whenever it changes
    useEffect(() => {
        window.localStorage.setItem('resumeData', JSON.stringify(resumeData));
    }, [resumeData]);

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(theme === 'light' ? 'dark' : 'light');
        root.classList.add(theme);
    }, [theme]);

    // Validate saved color theme on initial load
    useEffect(() => {
        const validColors = COLORS.map(c => c.key);
        if (!validColors.includes(customization.color)) {
            setCustomization(prev => ({ ...prev, color: 'blue' }));
        }
    }, []);


    const handleThemeToggle = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    const handleGenerate = useCallback(async (section: keyof ResumeData, index?: number) => {
        setIsLoading(prev => ({ ...prev, [`${section}${index ?? ''}`]: true }));
        try {
            const result = await generateResumeContent(section, resumeData);
            if (section === 'experience' && typeof index === 'number') {
                const newExperience = [...resumeData.experience];
                newExperience[index].description = result;
                setResumeData(prev => ({ ...prev, experience: newExperience }));
            } else if (section === 'summary') {
                setResumeData(prev => ({ ...prev, summary: result }));
            }
        } catch (error) {
            console.error(`Error generating ${section}:`, error);
            alert(`Failed to generate content for ${section}. Please check your API key and try again.`);
        } finally {
            setIsLoading(prev => ({ ...prev, [`${section}${index ?? ''}`]: false }));
        }
    }, [resumeData, setResumeData]);

    const handleJobMatch = useCallback(async () => {
        if (!jobDescription.trim()) {
            alert('Please paste a job description first.');
            return;
        }
        setIsLoading(prev => ({ ...prev, jobMatch: true }));
        setMatchReport(null);
        try {
            const report = await analyzeJobMatch(resumeData, jobDescription);
            setMatchReport(report);
        } catch (error) {
            console.error('Error analyzing job match:', error);
            alert('Failed to analyze job match. Please check your API key and try again.');
        } finally {
            setIsLoading(prev => ({ ...prev, jobMatch: false }));
        }
    }, [resumeData, jobDescription]);
    
    const handleATSCheck = useCallback(async () => {
        setIsLoading(prev => ({ ...prev, atsCheck: true }));
        setAtsReport(null);
        try {
            const report = await analyzeATS(resumeData);
            setAtsReport(report);
        } catch (error) {
            console.error('Error analyzing ATS friendliness:', error);
            alert('Failed to analyze ATS friendliness. Please check your API key and try again.');
        } finally {
            setIsLoading(prev => ({ ...prev, atsCheck: false }));
        }
    }, [resumeData]);

    const fontClass = useMemo(() => FONTS.find(f => f.key === customization.font)?.className || 'font-inter', [customization.font]);

    return (
        <div className={`min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 ${fontClass}`}>
            <header className="bg-white dark:bg-slate-800 shadow-md p-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">PentaHire</h1>
                <div className="flex items-center gap-2">
                    <UndoRedoControls onUndo={undo} onRedo={redo} canUndo={canUndo} canRedo={canRedo} />
                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-600"></div>
                    <ExportControls resumeData={resumeData} customization={customization} />
                    <ThemeToggle theme={theme} onToggle={handleThemeToggle} />
                </div>
            </header>

            <main className="flex flex-col lg:flex-row p-4 gap-4 max-w-screen-2xl mx-auto">
                <div className="w-full lg:w-2/5 xl:w-1/3 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-1 md:p-4 flex flex-col">
                    <div className="border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                        <nav className="flex space-x-2" aria-label="Tabs">
                            <button onClick={() => setActiveTab('form')} className={`px-3 py-2 font-medium text-sm rounded-t-md ${activeTab === 'form' ? 'bg-slate-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>Content</button>
                            <button onClick={() => setActiveTab('design')} className={`px-3 py-2 font-medium text-sm rounded-t-md ${activeTab === 'design' ? 'bg-slate-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>Design</button>
                            <button onClick={() => setActiveTab('layout')} className={`px-3 py-2 font-medium text-sm rounded-t-md ${activeTab === 'layout' ? 'bg-slate-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>Layout</button>
                            <button onClick={() => setActiveTab('match')} className={`px-3 py-2 font-medium text-sm rounded-t-md ${activeTab === 'match' ? 'bg-slate-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>Job Match</button>
                            <button onClick={() => setActiveTab('ats')} className={`px-3 py-2 font-medium text-sm rounded-t-md ${activeTab === 'ats' ? 'bg-slate-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>ATS Check</button>
                        </nav>
                    </div>
                    <div className="pt-4 overflow-y-auto flex-1 min-h-0">
                        {activeTab === 'form' && <ResumeForm resumeData={resumeData} setResumeData={setResumeData} onGenerate={handleGenerate} isLoading={isLoading} jobDescription={jobDescription} />}
                        {activeTab === 'design' && <CustomizationPanel customization={customization} setCustomization={setCustomization} />}
                        {activeTab === 'layout' && <LayoutEditor customization={customization} setCustomization={setCustomization} sectionTitles={resumeData.sectionTitles} />}
                        {activeTab === 'match' && <JobMatchAnalyzer jobDescription={jobDescription} setJobDescription={setJobDescription} onAnalyze={handleJobMatch} report={matchReport} isLoading={isLoading.jobMatch} resumeData={resumeData} setResumeData={setResumeData} />}
                        {activeTab === 'ats' && <ATSAnalyzer onAnalyze={handleATSCheck} report={atsReport} isLoading={isLoading.atsCheck} />}
                    </div>
                </div>

                <div className="w-full lg:w-3/5 xl:w-2/3 min-w-0">
                    <ResumePreview resumeData={resumeData} customization={customization} />
                </div>
            </main>
        </div>
    );
};

export default App;