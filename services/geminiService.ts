import { GoogleGenAI, Type } from "@google/genai";
import { ResumeData, JobMatchReport, ATSReport } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const model = 'gemini-2.5-flash';

export const generateResumeContent = async (section: keyof ResumeData, resumeData: ResumeData): Promise<string> => {
    let prompt = '';
    const { personalInfo, summary, experience } = resumeData;
    const coreInfo = `
        Job Title: ${personalInfo.title}
        Current Summary: ${summary}
        Most Recent Role: ${experience[0]?.title} at ${experience[0]?.company}
    `;

    if (section === 'summary') {
        prompt = `Based on the following career information, generate a professional, concise, and impactful resume summary (3-4 sentences). 
        ${coreInfo}`;
    } else if (section === 'experience') {
        prompt = `Based on the following career information, generate 3-4 impactful, action-oriented bullet points for the most recent job role. Use strong action verbs and quantify achievements where possible.
        ${coreInfo}
        
        Job Description Draft: ${experience[0].description}

        Return only the bullet points, each starting with a hyphen.`;
    } else {
        return '';
    }

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Gemini API call failed:", error);
        throw new Error("Failed to generate content from AI.");
    }
};

export const analyzeJobMatch = async (resumeData: ResumeData, jobDescription: string): Promise<JobMatchReport> => {
    const resumeText = `
        Summary: ${resumeData.summary}
        Experience: ${resumeData.experience.map(exp => `${exp.title} - ${exp.description}`).join('\n')}
        Skills: ${resumeData.skills.map(skill => skill.name).join(', ')}
    `;

    const prompt = `
        Analyze the provided resume against the job description. Your goal is to act as an expert career coach.
        Return a JSON object with the following structure:
        {
          "matchPercentage": <number between 0 and 100, assessing keyword and skill alignment>,
          "missingKeywords": ["keyword1", "keyword2", ...],
          "atsSuggestions": ["suggestion1 to improve ATS compatibility based on job description", "suggestion2", ...],
          "overallFeedback": "<string of overall feedback on how well the resume matches the job>",
          "smartSuggestions": {
            "suggestedSummary": "<Rewrite the resume summary (2-3 sentences) to be more impactful and tailored to this specific job description. Incorporate key skills and requirements mentioned in the job description.>",
            "suggestedExperienceBullets": [
              "<Rewrite one bullet point from the most recent job experience to be more action-oriented and include metrics. Align it with the job description.>",
              "<Rewrite another bullet point from the most recent job experience to highlight a different key achievement relevant to the job description.>",
              "<Create a new suggested bullet point that highlights a skill from the resume that is highly relevant to the job description, framed as an accomplishment.>"
            ]
          }
        }

        Resume:
        ---
        ${resumeText}
        ---

        Job Description:
        ---
        ${jobDescription}
        ---
    `;
    
    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });
        
        let jsonStr = response.text.trim();
        // Clean the response in case it's wrapped in markdown backticks
        jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/```$/, '');
        
        const report = JSON.parse(jsonStr);
        return report;
    } catch (error) {
        console.error("Gemini API call for job match failed:", error);
        throw new Error("Failed to analyze job match with AI.");
    }
};

export const suggestImprovements = async (text: string, context: string): Promise<string[]> => {
    const prompt = `You are an expert resume editor. Your task is to rephrase the given 'Original Text' to make it more impactful and professional, while preserving its core meaning.
Provide 3-4 alternative phrasings based on the existing text. Do not introduce new facts or achievements. The suggestions should be direct rewrites of the original.

Context: "${context}"
Original Text: "${text}"

Return a JSON array of strings, where each string is a rephrased version of the original text. For example: ["rephrased version 1", "rephrased version 2", "rephrased version 3"]`;
    
    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });
        let jsonStr = response.text.trim();
        jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/```$/, '');
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Gemini API call for suggestions failed:", error);
        throw new Error("Failed to get suggestions from AI.");
    }
};

export const suggestSkills = async (resumeData: ResumeData, jobDescription: string): Promise<string[]> => {
    const existingSkills = resumeData.skills.map(s => s.name).join(', ');
    const resumeContext = `
      Title: ${resumeData.personalInfo.title}
      Summary: ${resumeData.summary}
      Experience: ${resumeData.experience.map(e => `${e.title}: ${e.description}`).join('\n')}
    `;

    const prompt = `
    Based on the following resume context and job description, suggest 5-7 relevant skills that are NOT already listed in the "Existing Skills".
    
    Existing Skills:
    ---
    ${existingSkills}
    ---

    Resume Context:
    ---
    ${resumeContext}
    ---

    Job Description:
    ---
    ${jobDescription || 'No job description provided. Suggest general skills based on the resume context.'}
    ---

    Return a JSON array of strings, where each string is a suggested skill. For example: ["Skill A", "Skill B", "Skill C"]
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });
        let jsonStr = response.text.trim();
        jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/```$/, '');
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Gemini API call for skill suggestions failed:", error);
        throw new Error("Failed to get skill suggestions from AI.");
    }
};

export const analyzeATS = async (resumeData: ResumeData): Promise<ATSReport> => {
    const resumeText = `
        Name: ${resumeData.personalInfo.name}
        Title: ${resumeData.personalInfo.title}
        Contact: ${resumeData.personalInfo.email}, ${resumeData.personalInfo.phone}
        Summary: ${resumeData.summary}
        Experience: ${resumeData.experience.map(exp => `${exp.title} at ${exp.company} (${exp.startDate}-${exp.endDate}): ${exp.description}`).join('\n\n')}
        Education: ${resumeData.education.map(edu => `${edu.degree} from ${edu.school} (${edu.graduationDate})`).join('\n')}
        Skills: ${resumeData.skills.map(skill => skill.name).join(', ')}
    `;

    const prompt = `
        As an expert ATS (Applicant Tracking System) and professional resume screener, analyze the provided resume text for ATS compatibility. Evaluate it based on parsing, keyword relevance, and standard formatting. Return a JSON object with the following structure:
        {
          "atsScore": <number, 0-100, representing overall ATS-friendliness>,
          "parsingIssues": [<string, list of potential issues for a machine parser, e.g., "Complex formatting", "Uncommon section headers">],
          "keywordSuggestions": [<string, list of suggested keywords to add based on the job title: '${resumeData.personalInfo.title}'>],
          "formattingSuggestions": [<string, list of suggestions for improving formatting for ATS, e.g., "Use standard font", "Ensure dates are in a consistent MM/YYYY format">],
          "overallFeedback": "<string, a brief summary of the resume's ATS compatibility>"
        }

        Resume Text:
        ---
        ${resumeText}
        ---
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        let jsonStr = response.text.trim();
        jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/```$/, '');
        
        const report = JSON.parse(jsonStr);
        return report;
    } catch (error) {
        console.error("Gemini API call for ATS analysis failed:", error);
        throw new Error("Failed to analyze resume with AI.");
    }
};