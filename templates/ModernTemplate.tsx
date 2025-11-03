import React from 'react';
import { TemplateProps } from '../types';

const formatLink = (link: string) => {
    if (!link) return link;
    if (link.startsWith('http://') || link.startsWith('https://')) {
        return link;
    }
    return `https://${link}`;
};


const ModernTemplate: React.FC<TemplateProps> = ({ resumeData, customization }) => {
    const { personalInfo, summary, experience, education, skills, projects, customSections, sectionTitles } = resumeData;
    const { color, fontSize, lineHeight, sectionSpacing, sectionVisibility, sectionOrder } = customization;
    
    const getAccentColor = (colorKey: string) => {
      const colors: { [key: string]: string } = {
        black: '#111827',
        gray: '#4b5563',
        blue: '#2563eb',
        navy: '#1e3a8a',
        pink: '#db2777',
        purple: '#7c3aed',
      };
      return colors[colorKey] || '#111827';
    };
    
    const accentColor = getAccentColor(color);
    const sectionMargin = { marginTop: `${sectionSpacing * 0.25}rem` };
    
    // Filtering out empty items
    const filteredExperience = experience.filter(exp => exp.title || exp.company || exp.description);
    const filteredEducation = education.filter(edu => edu.degree || edu.school);
    const filteredProjects = projects.filter(proj => proj.name || proj.description);
    const filteredCustomSections = customSections.filter(section => section.title || section.content);

    const Section: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
         <section style={sectionMargin} className="avoid-break">
            <h3 className="font-bold uppercase tracking-wider" style={{ color: accentColor, fontSize: `${fontSize * 1.5}pt` }}>{title}</h3>
            <div className="w-1/4 h-0.5 mt-1" style={{ backgroundColor: accentColor }}></div>
            {children}
        </section>
    );

    const sectionComponents = {
        experience: filteredExperience.length > 0 ? (
            <Section key="experience" title={sectionTitles.experience}>
                 {filteredExperience.map(exp => (
                    <div key={exp.id} className="mt-4">
                        <div className="flex justify-between items-baseline">
                            {exp.title && <h4 className="font-bold">{exp.title}</h4>}
                            {(exp.startDate || exp.endDate) && <p className="font-medium text-slate-600 dark:text-slate-400">{exp.startDate}{exp.startDate && exp.endDate && ' - '}{exp.endDate}</p>}
                        </div>
                        {(exp.company || exp.location) && <p className="font-medium text-slate-700 dark:text-slate-300">{exp.company}{exp.company && exp.location && ', '}{exp.location}</p>}
                        {exp.description && (
                            <ul className="mt-2 list-disc list-outside pl-5 text-slate-600 dark:text-slate-300 space-y-1">
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
                    <div key={edu.id} className="mt-3">
                        {edu.degree && <p className="font-bold">{edu.degree}</p>}
                        {(edu.school || edu.location) && <p className="opacity-90">{edu.school}{edu.school && edu.location && ', '}{edu.location}</p>}
                        {edu.graduationDate && <p className="opacity-80">{edu.graduationDate}</p>}
                    </div>
                ))}
            </Section>
        ) : null,
        skills: sectionVisibility.skills && skills.length > 0 ? (
            <Section key="skills" title={sectionTitles.skills}>
                <ul className="mt-3 space-y-2">
                    {skills.map(skill => skill.name && <li key={skill.id}>{skill.name}</li>)}
                </ul>
            </Section>
        ) : null,
        projects: sectionVisibility.projects && filteredProjects.length > 0 ? (
            <Section key="projects" title={sectionTitles.projects}>
                 {filteredProjects.map(proj => (
                    <div key={proj.id} className="mt-4">
                        {proj.name && <h4 className="font-bold">{proj.name}</h4>}
                        {proj.description && <p className="text-slate-600 dark:text-slate-400">{proj.description}</p>}
                        {proj.link && <a href={formatLink(proj.link)} target="_blank" rel="noopener noreferrer" style={{ color: accentColor }}>{proj.link}</a>}
                    </div>
                ))}
            </Section>
        ) : null,
        customSections: sectionVisibility.customSections && filteredCustomSections.length > 0 ? (
            filteredCustomSections.map(section => (
                <Section key={section.id} title={section.title}>
                    {section.content && <div className="mt-3" dangerouslySetInnerHTML={{ __html: section.content }} />}
                </Section>
            ))
        ) : null,
    };

    return (
        <div className="w-full min-h-full bg-white dark:bg-slate-800 flex text-slate-800 dark:text-slate-200" style={{ fontSize: `${fontSize}pt`, lineHeight }}>
            {/* Left Column */}
            <div className="w-1/3 p-6 text-white" style={{ backgroundColor: accentColor }}>
                {personalInfo.name && <h1 className="font-bold tracking-tight" style={{ fontSize: `${fontSize * 2.5}pt` }}>{personalInfo.name}</h1>}
                {personalInfo.title && <h2 className="font-medium opacity-90 mt-1" style={{ fontSize: `${fontSize * 1.5}pt` }}>{personalInfo.title}</h2>}
                
                {(personalInfo.email || personalInfo.phone || personalInfo.location || personalInfo.website) && (
                    <div style={sectionMargin}>
                        <h3 className="font-semibold uppercase tracking-wider border-b-2 border-white pb-1" style={{ fontSize: `${fontSize * 1.1}pt` }}>Contact</h3>
                        <ul className="mt-3 space-y-2">
                            {personalInfo.email && <li>{personalInfo.email}</li>}
                            {personalInfo.phone && <li>{personalInfo.phone}</li>}
                            {personalInfo.location && <li>{personalInfo.location}</li>}
                            {personalInfo.website && <li>{personalInfo.website}</li>}
                        </ul>
                    </div>
                )}
            </div>

            {/* Right Column */}
            <div className="w-2/3 p-8">
                {summary && (
                    <section className="avoid-break">
                        <h3 className="font-bold uppercase tracking-wider" style={{ color: accentColor, fontSize: `${fontSize * 1.5}pt` }}>{sectionTitles.summary}</h3>
                        <div className="w-1/4 h-0.5 mt-1" style={{ backgroundColor: accentColor }}></div>
                        <p className="mt-3">{summary}</p>
                    </section>
                )}

                {sectionOrder.map(key => sectionComponents[key])}

            </div>
        </div>
    );
};

export default ModernTemplate;