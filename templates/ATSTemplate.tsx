import React from 'react';
import { TemplateProps } from '../types';

const ATSTemplate: React.FC<TemplateProps> = ({ resumeData, customization }) => {
    const { personalInfo, summary, experience, education, skills, projects, customSections, sectionTitles } = resumeData;
    const { fontSize, lineHeight, sectionSpacing, sectionVisibility, sectionOrder } = customization;

    const sectionMargin = { marginTop: `${sectionSpacing * 0.25}rem` };

    // Filtering out empty items
    const filteredExperience = experience.filter(exp => exp.title || exp.company || exp.description);
    const filteredEducation = education.filter(edu => edu.degree || edu.school);
    const filteredProjects = projects.filter(proj => proj.name || proj.description);
    const filteredCustomSections = customSections.filter(section => section.title || section.content);
    
    const contactInfo = [
        personalInfo.location,
        personalInfo.phone,
        personalInfo.email,
        personalInfo.website
    ].filter(Boolean);

    const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
        <section style={sectionMargin} className="avoid-break">
            <h2 className="font-bold uppercase tracking-wide border-b-2 border-black dark:border-slate-500 pb-1" style={{ fontSize: `${fontSize * 1.4}pt` }}>
                {title}
            </h2>
            <div className="mt-2">{children}</div>
        </section>
    );

    const sectionComponents = {
        experience: filteredExperience.length > 0 ? (
            <Section key="experience" title={sectionTitles.experience}>
                {filteredExperience.map(exp => (
                    <div key={exp.id} className="mb-4">
                        <div className="flex justify-between items-baseline">
                           {exp.title && <h3 className="font-bold" style={{ fontSize: `${fontSize * 1.1}pt` }}>{exp.title}</h3>}
                            {(exp.startDate || exp.endDate) && <p className="text-slate-700 dark:text-slate-400">{exp.startDate}{exp.startDate && exp.endDate && ' - '}{exp.endDate}</p>}
                        </div>
                        {(exp.company || exp.location) && <p className="font-semibold">{exp.company}{exp.company && exp.location && ' | '}{exp.location}</p>}
                        {exp.description && (
                            <ul className="mt-1 list-disc list-outside pl-5 text-slate-800 dark:text-slate-300 space-y-1">
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
                    <div key={edu.id} className="mb-3">
                         <div className="flex justify-between items-baseline">
                            {edu.school && <h3 className="font-bold" style={{ fontSize: `${fontSize * 1.1}pt` }}>{edu.school}</h3>}
                            {edu.graduationDate && <p className="text-slate-700 dark:text-slate-400">{edu.graduationDate}</p>}
                        </div>
                        {(edu.degree || edu.location) && <p>{edu.degree}{edu.degree && edu.location && ' | '}{edu.location}</p>}
                    </div>
                ))}
            </Section>
        ) : null,
        skills: sectionVisibility.skills && skills.length > 0 ? (
            <Section key="skills" title={sectionTitles.skills}>
                <p>{skills.map(skill => skill.name).filter(Boolean).join(' | ')}</p>
            </Section>
        ) : null,
        projects: sectionVisibility.projects && filteredProjects.length > 0 ? (
            <Section key="projects" title={sectionTitles.projects}>
                {filteredProjects.map(proj => (
                    <div key={proj.id} className="mb-3">
                        {proj.name && <h3 className="font-bold" style={{ fontSize: `${fontSize * 1.1}pt` }}>{proj.name}</h3>}
                        {proj.description && <p>{proj.description}</p>}
                        {proj.link && <p className="text-sm">{proj.link}</p>}
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
        <div className="w-full h-full bg-white dark:bg-slate-800 p-8 text-black dark:text-slate-200" style={{ fontSize: `${fontSize}pt`, lineHeight }}>
            <header className="text-center mb-6">
                {personalInfo.name && <h1 className="font-extrabold" style={{ fontSize: `${fontSize * 2.8}pt` }}>{personalInfo.name}</h1>}
                {personalInfo.title && <p className="font-semibold" style={{ fontSize: `${fontSize * 1.4}pt` }}>{personalInfo.title}</p>}
                {contactInfo.length > 0 && (
                    <div className="mt-2">
                        {contactInfo.map((info, index) => (
                            <React.Fragment key={index}>
                                <span>{info}</span>
                                {index < contactInfo.length - 1 && <span className="mx-2">|</span>}
                            </React.Fragment>
                        ))}
                    </div>
                )}
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

export default ATSTemplate;