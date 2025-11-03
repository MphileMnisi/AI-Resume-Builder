export interface PersonalInfo {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    website: string;
}

export interface Experience {
    id: string;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
}

export interface Education {
    id: string;
    degree: string;
    school: string;
    location: string;
    graduationDate: string;
}

export interface Skill {
    id: string;
    name: string;
}

export interface Project {
    id: string;
    name: string;
    description: string;
    link: string;
}

export interface CustomSection {
    id: string;
    title: string;
    content: string;
}

export interface ResumeData {
    sectionTitles: {
        personalInfo: string;
        summary: string;
        experience: string;
        education: string;
        skills: string;
        projects: string;
        customSections: string;
    };
    personalInfo: PersonalInfo;
    summary: string;
    experience: Experience[];
    education: Education[];
    skills: Skill[];
    projects: Project[];
    customSections: CustomSection[];
}

export type TemplateKey = 'classic' | 'modern' | 'creative' | 'minimalist' | 'corporate' | 'ats';

export type ColorTheme = 'black' | 'gray' | 'blue' | 'navy' | 'pink' | 'purple';

export type FontKey = 'inter' | 'roboto' | 'lato' | 'merriweather' | 'montserrat' | 'arial' | 'georgia' | 'times-new-roman' | 'verdana' | 'calibri';

export type HeaderAlignment = 'left' | 'center' | 'right';

export type ReorderableSectionKey = 'experience' | 'education' | 'skills' | 'projects' | 'customSections';

export interface CustomizationOptions {
    template: TemplateKey;
    color: ColorTheme;
    font: FontKey;
    fontSize: number;
    lineHeight: number;
    sectionSpacing: number; // Represents units for spacing, e.g., 4 = 1rem
    headerAlignment: HeaderAlignment;
    sectionOrder: ReorderableSectionKey[];
    sectionVisibility: {
        skills: boolean;
        projects: boolean;
        customSections: boolean;
    };
}

export interface SmartSuggestions {
    suggestedSummary: string;
    suggestedExperienceBullets: string[];
}

export interface JobMatchReport {
    matchPercentage: number;
    missingKeywords: string[];
    atsSuggestions: string[];
    overallFeedback: string;
    smartSuggestions?: SmartSuggestions;
}

export interface ATSReport {
    atsScore: number;
    parsingIssues: string[];
    keywordSuggestions: string[];
    formattingSuggestions: string[];
    overallFeedback: string;
}

export interface TemplateProps {
    resumeData: ResumeData;
    customization: CustomizationOptions;
}
