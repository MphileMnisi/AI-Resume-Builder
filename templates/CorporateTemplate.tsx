import React from 'react';
import { TemplateProps } from '../types';

const formatLink = (link: string) => {
    if (!link) return link;
    if (link.startsWith('http://') || link.startsWith('https://')) {
        return link;
    }
    return `https://${link}`;
};

const CorporateTemplate: React.FC<TemplateProps> = ({ resumeData, customization }) => {
    const { personalInfo, summary, experience, education, skills, projects, customSections, sectionTitles } = resumeData;
    const { color, fontSize, lineHeight, sectionSpacing, headerAlignment, sectionVisibility, sectionOrder } = customization;
    
    const colorHex = {
        black: '#1f2937',
        gray: '#4b5563',
        blue: '#1e40af',
        navy: '#172554',
        pink: '#9d174d',
        purple: '#5b21b6',
    }[color] || '#1f2937';

    const sectionMargin = { marginTop: `${sectionSpacing * 0.25}rem` };
    const headerAlignClass = {
        left: 'items-start',
        center: 'items-center text-center',
        right: 'items-end text-right',
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
    ].filter(Boolean);

    const Section: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
        <section style={sectionMargin} className={`avoid-break ${className || ''}`.trim()}>
            <h3 className="font-bold uppercase tracking-widest text-white px-2 py-1" style={{backgroundColor: colorHex}}>{title}</h3>
            <div className="mt-3 border-l-2 pl-4" style={{ borderColor: colorHex }}>
                {children}
            </div>
        </section>
    );
    
    const sectionComponents = {
        experience: filteredExperience.length > 0 ? (
            <Section key="experience" title={sectionTitles.experience}>
                {filteredExperience.map(exp => (
                    <div key={exp.id} className="mb-4 break-inside-avoid">
                        <div className="flex justify-between items-baseline">
                           {exp.title && <h4 className="font-bold" style={{ fontSize: `${fontSize * 1.2}pt` }}>{exp.title}</h4>}
                            {(exp.startDate || exp.endDate) && <p className="font-medium text-slate-500 dark:text-slate-400">{exp.startDate}{exp.startDate && exp.endDate && ' - '}{exp.endDate}</p>}
                        </div>
                        {(exp.company || exp.location) && <p className="font-semibold">{exp.company}{exp.company && exp.location && ', '}{exp.location}</p>}
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
                    <div key={edu.id} className="mb-3">
                        {edu.degree && <p className="font-bold">{edu.degree}</p>}
                        {(edu.school || edu.location) && <p>{edu.school}{edu.school && edu.location && ', '}{edu.location}</p>}
                        {edu.graduationDate && <p className="text-slate-500 dark:text-slate-400">{edu.graduationDate}</p>}
                    </div>
                ))}
            </Section>
        ) : null,
        skills: sectionVisibility.skills && skills.length > 0 ? (
            <Section key="skills" title={sectionTitles.skills}>
                <ul className="space-y-1">
                    {skills.map(skill => skill.name && <li key={skill.id}>{skill.name}</li>)}
                </ul>
            </Section>
        ) : null,
        projects: sectionVisibility.projects && filteredProjects.length > 0 ? (
            <Section key="projects" title={sectionTitles.projects}>
                {filteredProjects.map(proj => (
                    <div key={proj.id} className="mb-4 break-inside-avoid">
                        {proj.name && <h4 className="font-bold" style={{ fontSize: `${fontSize * 1.2}pt` }}>{proj.name}</h4>}
                        {proj.description && <p className="text-slate-700 dark:text-slate-300">{proj.description}</p>}
                        {proj.link && <a href={formatLink(proj.link)} target="_blank" rel="noopener noreferrer" style={{ color: colorHex }}>{proj.link}</a>}
                    </div>
                ))}
            </Section>
        ) : null,
        customSections: sectionVisibility.customSections && filteredCustomSections.length > 0 ? (
             filteredCustomSections.map(section => (
                <Section key={section.id} title={section.title}>
                    {section.content && <div className="text-slate-700 dark:text-slate-300" dangerouslySetInnerHTML={{ __html: section.content }} />}
                </Section>
            ))
        ) : null,
    };

    return (
        <div className="w-full h-full bg-white dark:bg-slate-800 p-8 text-slate-900 dark:text-slate-200" style={{ fontSize: `${fontSize}pt`, lineHeight }}>
            <header className={`border-b-4 pb-2 flex flex-col ${headerAlignClass}`} style={{ borderColor: colorHex }}>
                {personalInfo.name && <h1 className="font-extrabold tracking-tight" style={{ fontSize: `${fontSize * 3}pt` }}>{personalInfo.name}</h1>}
                {personalInfo.title && <p className="font-semibold" style={{color: colorHex, fontSize: `${fontSize * 1.8}pt`}}>{personalInfo.title}</p>}
                {contactInfo.length > 0 && (
                     <div className="text-slate-600 dark:text-slate-400 mt-2">
                        {contactInfo.map((info, index) => (
                            <React.Fragment key={index}>
                                <span>{info}</span>
                                {index < contactInfo.length - 1 && <span className="mx-2">|</span>}
                            </React.Fragment>
                        ))}
                    </div>
                )}
            </header>

            {summary && <p className="mt-4">{summary}</p>}
            
            {sectionOrder.map(key => sectionComponents[key])}

        </div>
    );
};

export default CorporateTemplate;