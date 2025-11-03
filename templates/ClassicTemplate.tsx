import React from 'react';
import { TemplateProps } from '../types';

const ClassicTemplate: React.FC<TemplateProps> = ({ resumeData, customization }) => {
    const { personalInfo, summary, experience, education, skills, projects, customSections, sectionTitles } = resumeData;
    const { color, fontSize, lineHeight, sectionSpacing, headerAlignment, sectionVisibility, sectionOrder } = customization;

    const accentColor = {
        black: '#111827', gray: '#4b5563', blue: '#2563eb', navy: '#1e3a8a', pink: '#db2777', purple: '#7c3aed'
    }[color] || '#111827';
    
    const sectionMargin = { marginTop: `${sectionSpacing * 0.25}rem` };
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
        personalInfo.location,
        personalInfo.website
    ].filter(Boolean).join(' | ');


    const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
        <section style={sectionMargin} className="avoid-break">
            <h3 className="font-bold uppercase tracking-wider pb-1 border-b-2" style={{ borderColor: accentColor, fontSize: `${fontSize * 1.5}pt` }}>{title}</h3>
            <div className="mt-2">{children}</div>
        </section>
    );

    const sectionComponents = {
        experience: filteredExperience.length > 0 ? (
            <Section key="experience" title={sectionTitles.experience}>
                {filteredExperience.map(exp => (
                    <div key={exp.id} className="mt-3">
                        <div className="flex justify-between items-baseline">
                            {(exp.title || exp.company) && (
                                <h4 className="font-bold" style={{ fontSize: `${fontSize * 1.2}pt` }}>
                                    {exp.title}{exp.title && exp.company && ', '}<span className="font-normal italic">{exp.company}</span>
                                </h4>
                            )}
                            {(exp.startDate || exp.endDate) && (
                                <p className="font-normal text-slate-600 dark:text-slate-400">{exp.startDate}{exp.startDate && exp.endDate && ' - '}{exp.endDate}</p>
                            )}
                        </div>
                        {exp.description && (
                            <ul className="mt-1 list-disc list-outside pl-5 text-slate-700 dark:text-slate-300 space-y-1">
                                {exp.description.split('\n').map((line, i) => line && <li key={i}>{line.replace(/^- /, '')}</li>)}
                            </ul>
                        )}
                    </div>
                ))}
            </Section>
        ) : null,
        education: filteredEducation.length > 0 ? (
            <Section key="education" title={sectionTitles.education}>
                {filteredEducation.map(edu => (
                    <div key={edu.id} className="mt-2 flex justify-between">
                        <p>
                            {edu.degree && <span className="font-bold">{edu.degree}</span>}
                            {(edu.degree && (edu.school || edu.location)) && ', '}
                            {edu.school}{edu.school && edu.location && ', '}
                            {edu.location}
                        </p>
                        {edu.graduationDate && <p>{edu.graduationDate}</p>}
                    </div>
                ))}
            </Section>
        ) : null,
        skills: sectionVisibility.skills && skills.length > 0 ? (
            <Section key="skills" title={sectionTitles.skills}>
                <p>
                    {skills.map(skill => skill.name).filter(Boolean).join(' ・ ')}
                </p>
            </Section>
        ) : null,
        projects: sectionVisibility.projects && filteredProjects.length > 0 ? (
             <Section key="projects" title={sectionTitles.projects}>
                {filteredProjects.map(proj => (
                    <div key={proj.id} className="mt-2">
                        {proj.name && <h4 className="font-bold">{proj.name}</h4>}
                        {proj.description && <p className="text-slate-700 dark:text-slate-300">{proj.description}</p>}
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
        <div className="w-full h-full bg-white dark:bg-slate-800 p-8 text-slate-900 dark:text-slate-200" style={{ fontSize: `${fontSize}pt`, lineHeight }}>
            <header className={headerAlignClass}>
                {personalInfo.name && <h1 className="font-bold" style={{ fontSize: `${fontSize * 3}pt` }}>{personalInfo.name}</h1>}
                {personalInfo.title && <p className="font-medium" style={{ color: accentColor, fontSize: `${fontSize * 1.5}pt` }}>{personalInfo.title}</p>}
                {contactInfo && <div className="mt-2">{contactInfo}</div>}
            </header>

            {summary && (
                <Section title={sectionTitles.summary}>
                    <p>{summary}</p>
                </Section>
            )}

            {sectionOrder.map(key => sectionComponents[key])}
        </div>
    );
};

export default ClassicTemplate;