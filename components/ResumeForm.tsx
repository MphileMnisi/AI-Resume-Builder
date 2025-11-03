import React, { useState, useEffect, useRef } from 'react';
import { ResumeData, Experience, Education, Skill, Project, CustomSection } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { suggestImprovements, suggestSkills } from '../services/geminiService';
import RichTextInput from './RichTextInput';

type SectionWithId = 'experience' | 'education' | 'skills' | 'projects' | 'customSections';

interface ResumeFormProps {
    resumeData: ResumeData;
    setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
    onGenerate: (section: keyof ResumeData, index?: number) => void;
    isLoading: Record<string, boolean>;
    jobDescription: string;
}

interface SectionProps {
    title: string;
    onTitleChange?: (newTitle: string) => void;
    children: React.ReactNode;
    isOpen: boolean;
    onToggle: () => void;
}

const Section: React.FC<SectionProps> = ({ title, onTitleChange, children, isOpen, onToggle }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentTitle, setCurrentTitle] = useState(title);
    const inputRef = useRef<HTMLInputElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        setCurrentTitle(title);
    }, [title]);

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditing]);

    const handleSave = () => {
        setIsEditing(false);
        if (onTitleChange && currentTitle.trim()) {
            onTitleChange(currentTitle.trim());
        } else {
            setCurrentTitle(title);
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            setCurrentTitle(title);
            setIsEditing(false);
        }
    };

    return (
        <div className="border-b border-slate-200 dark:border-slate-700 py-4 group">
             <div 
                className="flex justify-between items-center cursor-pointer" 
                onClick={onToggle}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="flex items-center gap-2">
                    {isEditing ? (
                        <input 
                            ref={inputRef}
                            type="text" 
                            value={currentTitle} 
                            onChange={(e) => setCurrentTitle(e.target.value)} 
                            onBlur={handleSave}
                            onKeyDown={handleKeyDown}
                            onClick={(e) => e.stopPropagation()}
                            className="text-lg font-semibold bg-slate-100 dark:bg-slate-700 p-1 -m-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    ) : (
                        <h3 className="text-lg font-semibold">{title}</h3>
                    )}

                    {onTitleChange && !isEditing && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} 
                            className={`text-slate-400 hover:text-blue-500 p-1 rounded-full transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                            aria-label={`Edit ${title} section title`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg>
                        </button>
                    )}
                </div>
                <svg className={`w-5 h-5 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
            {isOpen && <div className="mt-4 space-y-4">{children}</div>}
        </div>
    );
};

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input {...props} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
);

const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
    <textarea {...props} rows={5} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
);

const ResumeForm: React.FC<ResumeFormProps> = ({ resumeData, setResumeData, onGenerate, isLoading, jobDescription }) => {
    const [newSkill, setNewSkill] = useState('');
    const [openSection, setOpenSection] = useState<string | null>('personalInfo');
    const [suggestionPopover, setSuggestionPopover] = useState<{ fieldId: string; suggestions: string[]; isLoading: boolean; anchorEl: HTMLElement | null }>({ fieldId: '', suggestions: [], isLoading: false, anchorEl: null });
    const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);
    const [isSuggestingSkills, setIsSuggestingSkills] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setSuggestionPopover(prev => ({ ...prev, anchorEl: null }));
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSectionToggle = (sectionKey: string) => {
        setOpenSection(prev => (prev === sectionKey ? null : sectionKey));
    };

    const handleChange = <K extends keyof ResumeData>(section: K, value: ResumeData[K]) => {
        setResumeData(prev => ({ ...prev, [section]: value }));
    };
    
    const handleSectionTitleChange = (sectionKey: keyof ResumeData['sectionTitles'], newTitle: string) => {
        setResumeData(prev => ({
            ...prev,
            sectionTitles: {
                ...prev.sectionTitles,
                [sectionKey]: newTitle
            }
        }));
    };

    const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        handleChange('personalInfo', { ...resumeData.personalInfo, [name]: value });
    };

    const handleAddItem = <K extends SectionWithId>(section: K, newItem: ResumeData[K][number]) => {
        setResumeData(prev => ({
            ...prev,
            [section]: [...prev[section], newItem],
        }));
    };

    const handleRemoveItem = <K extends SectionWithId>(section: K, id: string) => {
        setResumeData(prev => ({
            ...prev,
            [section]: (prev[section] as { id: string }[]).filter(item => item.id !== id),
        }));
    };

    const handleItemChange = <K extends SectionWithId>(section: K, index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setResumeData(prev => {
            const newItems = prev[section].map((item, i) => {
                if (i === index) {
                    return { ...item, [name]: value };
                }
                return item;
            });
            return { ...prev, [section]: newItems };
        });
    };

    const handleCustomSectionContentChange = (index: number, content: string) => {
        const currentItems = [...resumeData.customSections];
        currentItems[index] = { ...currentItems[index], content };
        handleChange('customSections', currentItems);
    };

    const handleAddSkill = (skillName: string) => {
        if (skillName.trim() && !resumeData.skills.some(s => s.name.toLowerCase() === skillName.trim().toLowerCase())) {
            handleAddItem('skills', { id: uuidv4(), name: skillName.trim() });
            setNewSkill('');
        }
    };
    
    const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddSkill(newSkill);
        }
    };

    const handleShowSuggestions = async (fieldId: string, text: string, context: string, e: React.MouseEvent<HTMLButtonElement>) => {
        setSuggestionPopover({ fieldId, suggestions: [], isLoading: true, anchorEl: e.currentTarget });
        try {
            const suggestions = await suggestImprovements(text, context);
            setSuggestionPopover(prev => ({ ...prev, suggestions, isLoading: false }));
        } catch (error) {
            console.error(error);
            alert("Failed to get suggestions.");
            setSuggestionPopover({ fieldId: '', suggestions: [], isLoading: false, anchorEl: null });
        }
    };

    const handleApplySuggestion = (suggestion: string) => {
        const { fieldId } = suggestionPopover;
        let elementId = '';
    
        if (fieldId === 'summary') {
            handleChange('summary', suggestion);
            elementId = 'summary-textarea';
        } else if (fieldId.startsWith('experience-')) {
            const index = parseInt(fieldId.split('-')[1], 10);
            const newExperience = [...resumeData.experience];
            newExperience[index].description = suggestion;
            handleChange('experience', newExperience);
            elementId = `experience-description-${index}`;
        } else if (fieldId.startsWith('project-')) {
            const index = parseInt(fieldId.split('-')[1], 10);
            const newProjects = [...resumeData.projects];
            newProjects[index].description = suggestion;
            handleChange('projects', newProjects);
            elementId = `project-description-${index}`;
        }
    
        setSuggestionPopover({ fieldId: '', suggestions: [], isLoading: false, anchorEl: null });
    
        // Highlight the updated element to give visual feedback
        if (elementId) {
            const element = document.getElementById(elementId);
            if (element) {
                element.classList.add('highlight-update');
                setTimeout(() => {
                    element.classList.remove('highlight-update');
                }, 1000); // Must match the animation duration in index.html
            }
        }
    };

    const handleSuggestSkills = async () => {
        setIsSuggestingSkills(true);
        setSkillSuggestions([]);
        try {
            const suggestions = await suggestSkills(resumeData, jobDescription);
            setSkillSuggestions(suggestions.filter(s => !resumeData.skills.some(es => es.name.toLowerCase() === s.toLowerCase())));
        } catch (error) {
            console.error(error);
            alert("Failed to suggest skills.");
        } finally {
            setIsSuggestingSkills(false);
        }
    };

    return (
        <div className="space-y-4 relative">
            {suggestionPopover.anchorEl && (
                <div 
                    ref={popoverRef}
                    className="absolute z-10 w-72 bg-white dark:bg-slate-800 border dark:border-slate-600 rounded-md shadow-lg p-2"
                    style={{ top: suggestionPopover.anchorEl.offsetTop + suggestionPopover.anchorEl.offsetHeight + 5, left: suggestionPopover.anchorEl.offsetLeft }}
                >
                    {suggestionPopover.isLoading ? (
                        <div className="text-center p-2">Loading...</div>
                    ) : (
                        <ul className="space-y-1">
                            {suggestionPopover.suggestions.map((s, i) => (
                                <li key={i}>
                                    <button onClick={() => handleApplySuggestion(s)} className="w-full text-left text-sm p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">{s}</button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
            <Section 
                title={resumeData.sectionTitles.personalInfo}
                onTitleChange={(newTitle) => handleSectionTitleChange('personalInfo', newTitle)}
                isOpen={openSection === 'personalInfo'} 
                onToggle={() => handleSectionToggle('personalInfo')}
            >
                <Input name="name" value={resumeData.personalInfo.name} onChange={handlePersonalInfoChange} placeholder="Name" />
                <Input name="title" value={resumeData.personalInfo.title} onChange={handlePersonalInfoChange} placeholder="Professional Title" />
                <Input name="email" type="email" value={resumeData.personalInfo.email} onChange={handlePersonalInfoChange} placeholder="Email" />
                <Input name="phone" value={resumeData.personalInfo.phone} onChange={handlePersonalInfoChange} placeholder="Phone" />
                <Input name="location" value={resumeData.personalInfo.location} onChange={handlePersonalInfoChange} placeholder="Location" />
                <Input name="website" value={resumeData.personalInfo.website} onChange={handlePersonalInfoChange} placeholder="Website/Portfolio" />
            </Section>

            <Section 
                title={resumeData.sectionTitles.summary} 
                onTitleChange={(newTitle) => handleSectionTitleChange('summary', newTitle)}
                isOpen={openSection === 'summary'} 
                onToggle={() => handleSectionToggle('summary')}
            >
                <TextArea id="summary-textarea" value={resumeData.summary} onChange={(e) => handleChange('summary', e.target.value)} placeholder="Write a brief summary..."/>
                <div className="flex gap-2 mt-2">
                    <button onClick={() => onGenerate('summary')} disabled={isLoading.summary} className="flex-1 bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300">
                        {isLoading.summary ? 'Generating...' : '✨ Generate'}
                    </button>
                    <button onClick={(e) => handleShowSuggestions('summary', resumeData.summary, 'professional summary', e)} className="flex-1 bg-purple-600 text-white p-2 rounded-md hover:bg-purple-700">
                        ✨ Rephrase
                    </button>
                </div>
            </Section>

            <Section 
                title={resumeData.sectionTitles.experience}
                onTitleChange={(newTitle) => handleSectionTitleChange('experience', newTitle)}
                isOpen={openSection === 'experience'} 
                onToggle={() => handleSectionToggle('experience')}
            >
                {resumeData.experience.map((exp, index) => (
                    <div key={exp.id} className="p-4 border rounded-md dark:border-slate-600 space-y-2">
                        <Input name="title" value={exp.title} onChange={(e) => handleItemChange('experience', index, e)} placeholder="Job Title" />
                        <Input name="company" value={exp.company} onChange={(e) => handleItemChange('experience', index, e)} placeholder="Company" />
                        <Input name="location" value={exp.location} onChange={(e) => handleItemChange('experience', index, e)} placeholder="Location" />
                        <div className="flex gap-2">
                           <Input name="startDate" value={exp.startDate} onChange={(e) => handleItemChange('experience', index, e)} placeholder="Start Date" />
                           <Input name="endDate" value={exp.endDate} onChange={(e) => handleItemChange('experience', index, e)} placeholder="End Date" />
                        </div>
                        <TextArea id={`experience-description-${index}`} name="description" value={exp.description} onChange={(e) => handleItemChange('experience', index, e)} placeholder="Job description and achievements..."/>
                        <div className="flex justify-between items-center gap-2">
                            <button onClick={() => onGenerate('experience', index)} disabled={isLoading[`experience${index}`]} className="bg-blue-500 text-white px-3 py-1 text-sm rounded-md hover:bg-blue-600 disabled:bg-blue-300">
                                {isLoading[`experience${index}`] ? '...' : '✨ AI Bullets'}
                            </button>
                             <button onClick={(e) => handleShowSuggestions(`experience-${index}`, exp.description, `bullet points for ${exp.title}`, e)} className="bg-purple-500 text-white px-3 py-1 text-sm rounded-md hover:bg-purple-600">
                                ✨ Rephrase
                            </button>
                            <button onClick={() => handleRemoveItem('experience', exp.id)} className="text-red-500 hover:text-red-700">Remove</button>
                        </div>
                    </div>
                ))}
                <button onClick={() => handleAddItem('experience', { id: uuidv4(), title: '', company: '', location: '', startDate: '', endDate: '', description: '' })} className="w-full border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-500 p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700">Add Experience</button>
            </Section>
            
            <Section 
                title={resumeData.sectionTitles.education}
                onTitleChange={(newTitle) => handleSectionTitleChange('education', newTitle)}
                isOpen={openSection === 'education'} 
                onToggle={() => handleSectionToggle('education')}
            >
                {resumeData.education.map((edu, index) => (
                    <div key={edu.id} className="p-4 border rounded-md dark:border-slate-600 space-y-2">
                        <Input name="degree" value={edu.degree} onChange={(e) => handleItemChange('education', index, e)} placeholder="Degree" />
                        <Input name="school" value={edu.school} onChange={(e) => handleItemChange('education', index, e)} placeholder="School/University" />
                        <Input name="location" value={edu.location} onChange={(e) => handleItemChange('education', index, e)} placeholder="Location" />
                        <Input name="graduationDate" value={edu.graduationDate} onChange={(e) => handleItemChange('education', index, e)} placeholder="Graduation Date" />
                        <div className="text-right">
                            <button onClick={() => handleRemoveItem('education', edu.id)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
                        </div>
                    </div>
                ))}
                <button onClick={() => handleAddItem('education', { id: uuidv4(), degree: '', school: '', location: '', graduationDate: '' })} className="w-full border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-500 p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700">Add Education</button>
            </Section>

            <Section 
                title={resumeData.sectionTitles.skills}
                onTitleChange={(newTitle) => handleSectionTitleChange('skills', newTitle)}
                isOpen={openSection === 'skills'} 
                onToggle={() => handleSectionToggle('skills')}
            >
                <div className="flex flex-wrap gap-2 mb-2">
                    {resumeData.skills.map(skill => (
                        <div key={skill.id} className="flex items-center bg-slate-200 dark:bg-slate-600 rounded-full px-3 py-1 text-sm">
                            <span>{skill.name}</span>
                            <button onClick={() => handleRemoveItem('skills', skill.id)} className="ml-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-bold">&times;</button>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    <Input 
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={handleSkillKeyDown}
                        placeholder="Add a new skill"
                    />
                    <button onClick={() => handleAddSkill(newSkill)} className="bg-slate-200 dark:bg-slate-600 px-4 py-2 rounded-md text-sm hover:bg-slate-300 dark:hover:bg-slate-500">Add</button>
                </div>
                <div className="mt-4">
                    <button onClick={handleSuggestSkills} disabled={isSuggestingSkills} className="w-full bg-teal-600 text-white p-2 rounded-md hover:bg-teal-700 disabled:bg-teal-300">
                        {isSuggestingSkills ? 'Suggesting...' : '✨ Suggest Skills'}
                    </button>
                    {skillSuggestions.length > 0 && (
                        <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-md">
                            <p className="text-sm font-semibold mb-2">Suggestions:</p>
                            <div className="flex flex-wrap gap-2">
                                {skillSuggestions.map((skill, index) => (
                                    <button 
                                        key={index}
                                        onClick={() => handleAddSkill(skill)}
                                        className="bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 text-xs font-medium px-2.5 py-1 rounded-full hover:bg-teal-200 dark:hover:bg-teal-800"
                                    >
                                        + {skill}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </Section>

            <Section 
                title={resumeData.sectionTitles.projects}
                onTitleChange={(newTitle) => handleSectionTitleChange('projects', newTitle)}
                isOpen={openSection === 'projects'} 
                onToggle={() => handleSectionToggle('projects')}
            >
                {resumeData.projects.map((proj, index) => (
                    <div key={proj.id} className="p-4 border rounded-md dark:border-slate-600 space-y-2">
                        <Input name="name" value={proj.name} onChange={(e) => handleItemChange('projects', index, e)} placeholder="Project Name" />
                        <TextArea id={`project-description-${index}`} name="description" value={proj.description} onChange={(e) => handleItemChange('projects', index, e)} placeholder="Project description..." rows={3} />
                        <Input name="link" value={proj.link} onChange={(e) => handleItemChange('projects', index, e)} placeholder="Project Link (e.g., github.com/user/repo)" />
                        <div className="flex justify-end items-center gap-2 mt-2">
                            <button onClick={(e) => handleShowSuggestions(`project-${index}`, proj.description, 'a project description for an ATS-friendly resume', e)} className="bg-purple-500 text-white px-3 py-1 text-sm rounded-md hover:bg-purple-600">
                                ✨ Rephrase
                            </button>
                            <button onClick={() => handleRemoveItem('projects', proj.id)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
                        </div>
                    </div>
                ))}
                <button onClick={() => handleAddItem('projects', { id: uuidv4(), name: '', description: '', link: '' })} className="w-full border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-500 p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700">Add Project</button>
            </Section>

            <Section 
                title={resumeData.sectionTitles.customSections}
                isOpen={openSection === 'customSections'} 
                onToggle={() => handleSectionToggle('customSections')}
            >
                {resumeData.customSections.map((section, index) => (
                    <div key={section.id} className="p-4 border rounded-md dark:border-slate-600 space-y-2">
                        <Input name="title" value={section.title} onChange={(e) => handleItemChange('customSections', index, e)} placeholder="Section Title" />
                        <RichTextInput 
                            value={section.content} 
                            onChange={(content) => handleCustomSectionContentChange(index, content)} 
                            placeholder="Section content..." 
                        />
                        <div className="text-right">
                           <button onClick={() => handleRemoveItem('customSections', section.id)} className="text-red-500 hover:text-red-700 text-sm">Remove Section</button>
                        </div>
                    </div>
                ))}
                <button onClick={() => handleAddItem('customSections', { id: uuidv4(), title: 'New Section', content: '' })} className="w-full border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-500 p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700">Add Custom Section</button>
            </Section>
        </div>
    );
};

export default ResumeForm;
