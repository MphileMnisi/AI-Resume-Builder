// Fix: Import React to use the React.FC type.
import React from 'react';
import { ResumeData, TemplateKey, ColorTheme, FontKey, TemplateProps } from './types';
import ClassicTemplate from './templates/ClassicTemplate';
import ModernTemplate from './templates/ModernTemplate';
import CreativeTemplate from './templates/CreativeTemplate';
import MinimalistTemplate from './templates/MinimalistTemplate';
import CorporateTemplate from './templates/CorporateTemplate';
import ATSTemplate from './templates/ATSTemplate';

export const DEFAULT_RESUME_DATA: ResumeData = {
    sectionTitles: {
        personalInfo: 'Personal Information',
        summary: 'Professional Summary',
        experience: 'Experience',
        education: 'Education',
        skills: 'Skills',
        projects: 'Projects',
        customSections: 'Custom Sections',
    },
    personalInfo: {
        name: 'Jane Doe',
        title: 'Senior Software Engineer',
        email: 'jane.doe@example.com',
        phone: '123-456-7890',
        location: 'San Francisco, CA',
        website: 'janedoe.dev',
    },
    summary: 'Experienced Senior Software Engineer with a decade of expertise in building scalable web applications and leading high-performing teams. Proficient in full-stack development with a passion for clean code and user-centric design.',
    experience: [
        {
            id: 'exp1',
            title: 'Senior Software Engineer',
            company: 'Tech Solutions Inc.',
            location: 'San Francisco, CA',
            startDate: 'Jan 2018',
            endDate: 'Present',
            description: '- Led the development of a new microservices architecture, improving system scalability by 40%.\n- Mentored junior engineers, fostering a culture of collaboration and knowledge sharing.\n- Optimized application performance, reducing page load times by 25%.',
        },
        {
            id: 'exp2',
            title: 'Software Engineer',
            company: 'Innovate Co.',
            location: 'Palo Alto, CA',
            startDate: 'Jun 2014',
            endDate: 'Dec 2017',
            description: '- Developed and maintained key features for a SaaS platform used by over 100,000 users.\n- Collaborated with product managers and designers to translate requirements into technical solutions.\n- Wrote comprehensive unit and integration tests, increasing code coverage to 90%.',
        },
    ],
    education: [
        {
            id: 'edu1',
            degree: 'M.S. in Computer Science',
            school: 'Stanford University',
            location: 'Stanford, CA',
            graduationDate: 'May 2014',
        },
        {
            id: 'edu2',
            degree: 'B.S. in Computer Science',
            school: 'University of California, Berkeley',
            location: 'Berkeley, CA',
            graduationDate: 'May 2012',
        },
    ],
    skills: [
        { id: 'skill1', name: 'JavaScript / TypeScript' },
        { id: 'skill2', name: 'React & Node.js' },
        { id: 'skill3', name: 'Python' },
        { id: 'skill4', name: 'SQL & NoSQL Databases' },
        { id: 'skill5', name: 'AWS & Docker' },
        { id: 'skill6', name: 'Agile Methodologies' },
    ],
    projects: [
        {
            id: 'proj1',
            name: 'Open Source Contributor',
            description: 'Contributed to a popular open-source library, focusing on performance improvements and bug fixes.',
            link: 'github.com/example/project'
        }
    ],
    customSections: [],
};

export const TEMPLATES: { key: TemplateKey; name: string; component: React.FC<TemplateProps> }[] = [
    { key: 'modern', name: 'Modern', component: ModernTemplate },
    { key: 'classic', name: 'Classic', component: ClassicTemplate },
    { key: 'corporate', name: 'Corporate', component: CorporateTemplate },
    { key: 'creative', name: 'Creative', component: CreativeTemplate },
    { key: 'minimalist', name: 'Minimalist', component: MinimalistTemplate },
    { key: 'ats', name: 'ATS-Friendly', component: ATSTemplate },
];

export const COLORS: { key: ColorTheme; name: string; hex: string }[] = [
    { key: 'black', name: 'Black', hex: '#111827' },
    { key: 'gray', name: 'Gray', hex: '#4b5563' },
    { key: 'blue', name: 'Blue', hex: '#2563eb' },
    { key: 'navy', name: 'Navy', hex: '#1e3a8a' },
    { key: 'pink', name: 'Pink', hex: '#db2777' },
    { key: 'purple', name: 'Purple', hex: '#7c3aed' },
];

export const FONTS: { key: FontKey; name: string; className: string }[] = [
    { key: 'arial', name: 'Arial', className: 'font-arial' },
    { key: 'calibri', name: 'Calibri', className: 'font-calibri' },
    { key: 'georgia', name: 'Georgia', className: 'font-georgia' },
    { key: 'inter', name: 'Inter', className: 'font-inter' },
    { key: 'lato', name: 'Lato', className: 'font-lato' },
    { key: 'merriweather', name: 'Merriweather', className: 'font-merriweather' },
    { key: 'montserrat', name: 'Montserrat', className: 'font-montserrat' },
    { key: 'roboto', name: 'Roboto', className: 'font-roboto' },
    { key: 'times-new-roman', name: 'Times New Roman', className: 'font-times-new-roman' },
    { key: 'verdana', name: 'Verdana', className: 'font-verdana' },
];
