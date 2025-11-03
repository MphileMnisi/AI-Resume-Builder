import React from 'react';
import { ATSReport } from '../types';

interface ATSAnalyzerProps {
    onAnalyze: () => void;
    report: ATSReport | null;
    isLoading: boolean;
}

const ReportSection: React.FC<{ title: string; children: React.ReactNode, icon: string }> = ({ title, children, icon }) => (
    <div>
        <h4 className="font-semibold flex items-center">
            <span className="mr-2">{icon}</span>
            {title}
        </h4>
        <div className="pl-6 mt-2 text-sm text-slate-600 dark:text-slate-300">
            {children}
        </div>
    </div>
);

const ATSAnalyzer: React.FC<ATSAnalyzerProps> = ({ onAnalyze, report, isLoading }) => {
    const getScoreColorClasses = (score: number) => {
        if (score > 85) return 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300';
        if (score > 60) return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300';
        return 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300';
    };

    return (
        <div className="space-y-4 p-2">
            <div>
                <h3 className="text-lg font-semibold">ATS Friendliness Check</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Analyze how well your resume can be read and parsed by Applicant Tracking Systems (ATS).
                </p>
            </div>
            <button
                onClick={onAnalyze}
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
            >
                {isLoading ? 'Analyzing...' : 'Run ATS Check'}
            </button>

            {report && (
                <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg space-y-5">
                    <div className="text-center">
                        <div className={`w-28 h-28 rounded-full flex items-center justify-center mx-auto text-4xl font-bold ${getScoreColorClasses(report.atsScore)}`}>
                            {report.atsScore}
                        </div>
                        <p className="text-xl font-semibold mt-2">ATS Score</p>
                    </div>

                    <ReportSection title="Overall Feedback" icon="📝">
                        <p>{report.overallFeedback}</p>
                    </ReportSection>

                    {report.parsingIssues && report.parsingIssues.length > 0 && (
                        <ReportSection title="Parsing Issues" icon="⚠️">
                            <ul className="list-disc list-inside space-y-1">
                                {report.parsingIssues.map((issue, index) => <li key={index}>{issue}</li>)}
                            </ul>
                        </ReportSection>
                    )}

                    {report.keywordSuggestions && report.keywordSuggestions.length > 0 && (
                         <ReportSection title="Keyword Suggestions" icon="🔑">
                            <ul className="list-disc list-inside space-y-1">
                                {report.keywordSuggestions.map((keyword, index) => <li key={index}>{keyword}</li>)}
                            </ul>
                        </ReportSection>
                    )}
                    
                    {report.formattingSuggestions && report.formattingSuggestions.length > 0 && (
                         <ReportSection title="Formatting Suggestions" icon="📄">
                            <ul className="list-disc list-inside space-y-1">
                                {report.formattingSuggestions.map((suggestion, index) => <li key={index}>{suggestion}</li>)}
                            </ul>
                        </ReportSection>
                    )}
                </div>
            )}
        </div>
    );
};

export default ATSAnalyzer;
