import React from 'react';
import { JobMatchReport, ResumeData } from '../types';

interface JobMatchAnalyzerProps {
    jobDescription: string;
    setJobDescription: (value: string) => void;
    onAnalyze: () => void;
    report: JobMatchReport | null;
    isLoading: boolean;
    resumeData: ResumeData;
    setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
}

const JobMatchAnalyzer: React.FC<JobMatchAnalyzerProps> = ({ jobDescription, setJobDescription, onAnalyze, report, isLoading, resumeData, setResumeData }) => {
    const handleApplySummary = (suggestedSummary: string) => {
        setResumeData(prev => ({ ...prev, summary: suggestedSummary }));
    };

    const handleApplyExperience = (suggestedBullets: string[]) => {
        if (resumeData.experience.length === 0) {
            alert("Please add an experience entry first.");
            return;
        }
        const newExperience = [...resumeData.experience];
        newExperience[0].description = suggestedBullets.join('\n');
        setResumeData(prev => ({ ...prev, experience: newExperience }));
    };
    
    return (
        <div className="space-y-4 p-2">
            <div>
                <label htmlFor="job-description" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Paste Job Description
                </label>
                <textarea
                    id="job-description"
                    rows={8}
                    className="mt-1 w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Paste the full job description here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                />
            </div>
            <button
                onClick={onAnalyze}
                disabled={isLoading}
                className="w-full bg-green-600 text-white p-2 rounded-md hover:bg-green-700 disabled:bg-green-300"
            >
                {isLoading ? 'Analyzing...' : 'Analyze Match'}
            </button>

            {report && (
                <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg space-y-4">
                    <h3 className="text-lg font-bold">Job Match Report</h3>
                    <div className="text-center">
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto text-3xl font-bold ${report.matchPercentage > 75 ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300' : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300'}`}>
                            {report.matchPercentage}%
                        </div>
                        <p className="text-lg font-semibold mt-2">Match Score</p>
                    </div>

                    <div>
                        <h4 className="font-semibold">Missing Keywords:</h4>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {report.missingKeywords.map((keyword, index) => (
                                <span key={index} className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs font-medium px-2.5 py-0.5 rounded-full">{keyword}</span>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold">ATS Suggestions:</h4>
                        <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                            {report.atsSuggestions.map((suggestion, index) => <li key={index}>{suggestion}</li>)}
                        </ul>
                    </div>
                     <div>
                        <h4 className="font-semibold">Overall Feedback:</h4>
                        <p className="mt-2 text-sm">{report.overallFeedback}</p>
                    </div>
                </div>
            )}

            {report && report.smartSuggestions && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-slate-900/50 rounded-lg space-y-4 border border-blue-200 dark:border-blue-800">
                    <h3 className="text-lg font-bold text-blue-800 dark:text-blue-300 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                        Smart Content Suggestions
                    </h3>
                    
                    <div>
                        <h4 className="font-semibold">Suggested Summary:</h4>
                        <div className="mt-2 p-3 bg-white dark:bg-slate-700 rounded-md shadow-sm">
                            <p className="text-sm italic text-slate-700 dark:text-slate-300">"{report.smartSuggestions.suggestedSummary}"</p>
                        </div>
                        <button 
                            onClick={() => handleApplySummary(report.smartSuggestions!.suggestedSummary)}
                            className="mt-2 bg-blue-500 text-white px-3 py-1 text-sm rounded-md hover:bg-blue-600">
                            Apply this Summary
                        </button>
                    </div>

                    <div>
                        <h4 className="font-semibold">Suggested Experience Bullet Points (for latest role):</h4>
                        <div className="mt-2 p-3 bg-white dark:bg-slate-700 rounded-md shadow-sm">
                            <ul className="list-disc list-inside text-sm space-y-1 text-slate-700 dark:text-slate-300">
                                {report.smartSuggestions.suggestedExperienceBullets.map((bullet, index) => (
                                    <li key={index}>{bullet}</li>
                                ))}
                            </ul>
                        </div>
                        <button 
                            onClick={() => handleApplyExperience(report.smartSuggestions!.suggestedExperienceBullets)}
                            className="mt-2 bg-blue-500 text-white px-3 py-1 text-sm rounded-md hover:bg-blue-600">
                            Apply to Latest Experience
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobMatchAnalyzer;