import React from 'react';
import { TemplateProps } from '../types';

const MinimalistTemplate: React.FC<TemplateProps> = ({ resumeData, customization }) => {
    const { personalInfo, summary, experience, education, skills, projects, customSections, sectionTitles } = resumeData;
    const { color, fontSize, lineHeight, sectionSpacing, headerAlignment, sectionVisibility, sectionOrder } = customization;

    const accentColor = {
        black: '#111827', gray: '#4b5563', blue: '#2563eb', navy: '#1e3a8a', pink: '#db2777', purple: '#7c3aed'
    }[color] || '#111827';
    
    const headerAlignClass = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
    }[headerAlignment];

    // Filtering out empty items
    const filteredExperience = experience.filter(exp => exp.title || exp.company || exp.description);
    const filteredEducation = education.filter(edu => edu.degree || edu.school);
    const filteredProjects = projects.filter(proj => proj.name || proj.description);
    const filteredCustomSections = customSections.filter(section => section.title || section.content);
    
    const contactInfo = [
        personalInfo.email,
        personalInfo.phone,
        personalInfo.location
    ].filter(Boolean).join(' · ');

    const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
        <section style={{ marginTop: `${sectionSpacing * 0.25}rem` }} className="avoid-break">
            <h3 className="font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">{title}</h3>
            {children}
        </section>
    );

    const sectionComponents = {
        experience: filteredExperience.length > 0 ? (
             <Section key="experience" title={sectionTitles.experience}>
                 {filteredExperience.map(exp => (
                    <div key={exp.id} className="mb-4">
                        <div className="flex justify-between items-start">
                            <div>
                                {exp.title && <h4 className="font-semibold">{exp.title}</h4>}
                                {exp.company && <p className="text-slate-600 dark:text-slate-300">{exp.company}</p>}
                            </div>
                            {(exp.startDate || exp.endDate) && (
                                <p className="text-slate-500 dark:text-slate-400 flex-shrink-0 ml-4">
                                    {exp.startDate}{exp.startDate && exp.endDate && ' - '}{exp.endDate}
                                </p>
                            )}
                        </div>
                        {exp.description && (
                            <ul className="mt-1 list-disc list-outside pl-5 text-slate-600 dark:text-slate-300 space-y-1">
                                {exp.description.split('\n').filter(Boolean).map((line, i) => <li key={i}>{line.replace(/^- /, '')}</li>)}
                            </ul>
                        )}
                    </div>
                ))}
            </Section>
        ) : null,
        education: filteredEducation.length > 0 ? (
            <Section key="education" title={sectionTitles.education}>
                {filteredEducation.map(edu => (
                    <div key={edu.id} className="mb-2">
                        {edu.degree && <h4 className="font-semibold">{edu.degree}</h4>}
                        {(edu.school || edu.location || edu.graduationDate) && (
                            <p className="text-slate-600 dark:text-slate-300">
                                {[edu.school, edu.location, edu.graduationDate].filter(Boolean).join(', ')}
                            </p>
                        )}
                    </div>
                ))}
            </Section>
        ) : null,
        skills: sectionVisibility.skills && skills.length > 0 ? (
            <Section key="skills" title={sectionTitles.skills}>
                <p>{skills.map(skill => skill.name).filter(Boolean).join(', ')}</p>
            </Section>
        ) : null,
        projects: sectionVisibility.projects && filteredProjects.length > 0 ? (
            <Section key="projects" title={sectionTitles.projects}>
                {filteredProjects.map(proj => (
                    <div key={proj.id} className="mb-4">
                        {proj.name && <h4 className="font-semibold">{proj.name}</h4>}
                        {proj.description && <p className="text-slate-600 dark:text-slate-300">{proj.description}</p>}
                    </div>
                ))}
            </Section>
        ) : null,
        customSections: sectionVisibility.customSections && filteredCustomSections.length > 0 ? (
            filteredCustomSections.map(section => (
                <Section key={section.id} title={section.title}>
                    {section.content && <div dangerouslySetInnerHTML={{ __html: section.content }} />}
                </Section>
            ))
        ) : null
    };

    return (
        <div className="w-full h-full bg-white dark:bg-slate-800 p-10 text-slate-800 dark:text-slate-200" style={{ fontSize: `${fontSize}pt`, lineHeight }}>
            <header className={`mb-8 ${headerAlignClass}`}>
                {personalInfo.name && <h1 className="font-bold tracking-tighter" style={{ fontSize: `${fontSize * 3}pt` }}>{personalInfo.name}</h1>}
                {personalInfo.title && <p style={{ color: accentColor, fontSize: `${fontSize * 1.5}pt` }}>{personalInfo.title}</p>}
                 {contactInfo && (
                     <div className="mt-2 text-slate-600 dark:text-slate-400">
                        {contactInfo}
                    </div>
                )}
            </header>

            {summary && <p className="border-t border-slate-200 dark:border-slate-700 pt-6">{summary}</p>}
            
            {sectionOrder.map(key => sectionComponents[key])}
        </div>
    );
};

export default MinimalistTemplate;