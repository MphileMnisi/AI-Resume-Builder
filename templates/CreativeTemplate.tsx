import React from 'react';
import { TemplateProps } from '../types';

interface IconProps {
    path: string;
}

const Icon: React.FC<IconProps> = ({ path }) => (
    <svg className="w-4 h-4 mr-2 inline-block" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d={path} clipRule="evenodd"></path></svg>
);

const CreativeTemplate: React.FC<TemplateProps> = ({ resumeData, customization }) => {
    const { personalInfo, summary, experience, education, skills, projects, customSections, sectionTitles } = resumeData;
    const { color, fontSize, lineHeight, sectionSpacing, sectionVisibility, sectionOrder } = customization;

    const accentColor = {
        black: '#111827', gray: '#4b5563', blue: '#2563eb', navy: '#1e3a8a', pink: '#db2777', purple: '#7c3aed'
    }[color] || '#111827';

    const sectionMargin = { marginTop: `${sectionSpacing * 0.25}rem` };

    // Filtering out empty items
    const filteredExperience = experience.filter(exp => exp.title || exp.company || exp.description);
    const filteredEducation = education.filter(edu => edu.degree || edu.school);
    const filteredProjects = projects.filter(proj => proj.name || proj.description);
    const filteredCustomSections = customSections.filter(section => section.title || section.content);

    const Section: React.FC<{title: string; children: React.ReactNode}> = ({title, children}) => (
        <section style={sectionMargin} className="avoid-break">
            <h3 className="font-bold" style={{ color: accentColor, fontSize: `${fontSize * 1.5}pt` }}>{title}</h3>
            {children}
        </section>
    );

    const sectionComponents = {
        experience: filteredExperience.length > 0 ? (
            <Section key="experience" title={sectionTitles.experience}>
                 {filteredExperience.map(exp => (
                    <div key={exp.id} className="mt-3 relative pl-4">
                       <div className="absolute left-0 h-full w-0.5" style={{ backgroundColor: accentColor }}></div>
                       <div className="absolute left-[-4px] top-1 w-2.5 h-2.5 rounded-full bg-white dark:bg-slate-800 border-2" style={{ borderColor: accentColor }}></div>
                        {exp.title && <h4 className="font-bold" style={{ color: accentColor }}>{exp.title}</h4>}
                        {(exp.company || exp.startDate || exp.endDate) && (
                            <p className="font-medium">
                                {exp.company}
                                {exp.company && (exp.startDate || exp.endDate) && ' | '}
                                {exp.startDate}{exp.startDate && exp.endDate && ' - '}{exp.endDate}
                            </p>
                        )}
                        {exp.description && (
                            <ul className="mt-1 list-disc list-outside pl-5">
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
                        {edu.degree && <h4 className="font-bold" style={{ color: accentColor }}>{edu.degree}</h4>}
                        {(edu.school || edu.location || edu.graduationDate) && (
                             <p className="font-medium">
                                {edu.school}{edu.school && (edu.location || edu.graduationDate) && ', '}
                                {edu.location}{edu.location && edu.graduationDate && ' | '}
                                {edu.graduationDate}
                            </p>
                        )}
                    </div>
                ))}
            </Section>
        ) : null,
        skills: sectionVisibility.skills && skills.length > 0 ? (
            <Section key="skills" title={sectionTitles.skills}>
               <div className="flex flex-wrap gap-2 mt-2">
                   {skills.map(skill => skill.name && <span key={skill.id} className="text-white px-2 py-1 rounded" style={{backgroundColor: accentColor}}>{skill.name}</span>)}
               </div>
           </Section>
        ) : null,
        projects: sectionVisibility.projects && filteredProjects.length > 0 ? (
            <Section key="projects" title={sectionTitles.projects}>
                {filteredProjects.map(proj => (
                   <div key={proj.id} className="mt-3">
                       {proj.name && <h4 className="font-bold" style={{ color: accentColor }}>{proj.name}</h4>}
                       {proj.description && <p>{proj.description}</p>}
                   </div>
               ))}
           </Section>
        ) : null,
        customSections: sectionVisibility.customSections && filteredCustomSections.length > 0 ? (
            filteredCustomSections.map(section => (
                <Section key={section.id} title={section.title}>
                    {section.content && <div className="mt-2" dangerouslySetInnerHTML={{ __html: section.content }} />}
                </Section>
            ))
        ) : null,
    };

    return (
        <div className="w-full h-full bg-slate-50 dark:bg-slate-900 p-6 text-slate-800 dark:text-slate-200" style={{ fontSize: `${fontSize}pt`, lineHeight }}>
            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-4 flex flex-col items-center text-center p-4 rounded-lg" style={{ backgroundColor: accentColor, color: 'white' }}>
                    {personalInfo.name && (
                        <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mb-4">
                            <span className="font-bold" style={{ color: accentColor, fontSize: `${fontSize * 4}pt` }}>{personalInfo.name.charAt(0)}</span>
                        </div>
                    )}
                    {personalInfo.name && <h1 className="font-bold" style={{ fontSize: `${fontSize * 2}pt` }}>{personalInfo.name}</h1>}
                    {personalInfo.title && <p className="opacity-90">{personalInfo.title}</p>}
                    
                    {(personalInfo.email || personalInfo.phone || personalInfo.location || personalInfo.website) && (
                        <>
                            <div className="w-1/2 h-0.5 bg-white my-4 opacity-50"></div>
                            <ul className="text-left space-y-2">
                                {personalInfo.email && <li><Icon path="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884zM18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />{personalInfo.email}</li>}
                                {personalInfo.phone && <li><Icon path="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />{personalInfo.phone}</li>}
                                {personalInfo.location && <li><Icon path="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" />{personalInfo.location}</li>}
                                {personalInfo.website && <li><Icon path="M10 2a8 8 0 100 16 8 8 0 000 16zm0 14a6 6 0 110-12 6 6 0 010 12zM10 7a1 1 0 100 2 1 1 0 000-2z" />{personalInfo.website}</li>}
                            </ul>
                        </>
                    )}
                </div>
                <div className="col-span-8 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
                    {summary && (
                        <section className="avoid-break">
                            <h3 className="font-bold" style={{ color: accentColor, fontSize: `${fontSize * 1.5}pt` }}>{sectionTitles.summary}</h3>
                            <p className="mt-2">{summary}</p>
                        </section>
                    )}
                    
                    {sectionOrder.map(key => sectionComponents[key])}
                </div>
            </div>
        </div>
    );
};

export default CreativeTemplate;