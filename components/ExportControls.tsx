import React from 'react';
import { ResumeData, CustomizationOptions } from '../types';
import { Packer, Document, Paragraph, HeadingLevel } from 'docx';
import { FONTS } from '../constants';

// Simple saveAs implementation if file-saver is not available globally
const saveBlob = (blob: Blob, filename: string) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
};


interface ExportControlsProps {
    resumeData: ResumeData;
    customization: CustomizationOptions;
}

const ExportControls: React.FC<ExportControlsProps> = ({ resumeData, customization }) => {
    const exportToPDF = () => {
        const resumeContentElement = document.getElementById('resume-content');
        
        if (!resumeContentElement) {
            console.error("Resume content element not found for PDF export.");
            alert("An error occurred while exporting to PDF.");
            return;
        }

        // Temporarily switch to light mode for consistent, professional output
        const root = document.documentElement;
        const isDarkMode = root.classList.contains('dark');
        if (isDarkMode) {
            root.classList.remove('dark');
        }

        const resumePreviewElement = document.getElementById('resume-preview');
        const aspectWrapper = resumeContentElement.parentElement;

        if (!resumePreviewElement || !aspectWrapper) {
             if (isDarkMode) root.classList.add('dark');
             return;
        }
        
        // Save original styles to restore after export
        const originalPreviewStyle = resumePreviewElement.style.cssText;
        const originalWrapperStyle = aspectWrapper.style.cssText;
        const originalContentStyle = resumeContentElement.style.cssText;

        // Apply temporary styles to let the content expand to its full height
        resumePreviewElement.style.overflow = 'visible';
        resumePreviewElement.style.height = 'auto';
        aspectWrapper.style.height = 'auto';
        aspectWrapper.style.paddingTop = '0';
        aspectWrapper.style.aspectRatio = 'auto';
        resumeContentElement.style.position = 'static';
        resumeContentElement.style.height = 'auto';

        // Use a timeout to allow the browser to re-render before capturing
        setTimeout(() => {
            // @ts-ignore
            const { jsPDF } = window.jspdf;
            // @ts-ignore
            html2canvas(resumeContentElement, { 
                scale: 1.5, // Use a higher scale for better quality
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff', // Explicitly set a white background
                windowWidth: resumeContentElement.scrollWidth,
                windowHeight: resumeContentElement.scrollHeight,
            })
            .then(canvas => {
                const pdf = new jsPDF({
                    orientation: 'p',
                    unit: 'pt',
                    format: 'a4'
                });

                const MARGIN = 30;
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                
                const contentWidth = pdfWidth - MARGIN * 2;
                const pageContentHeight = pdfHeight - MARGIN * 2;

                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;
                
                // Calculate the height of one page's content in terms of the original canvas's pixels.
                const pageContentHeightInCanvasPixels = (pageContentHeight * canvasWidth) / contentWidth;

                // How many pages will we need?
                const numPages = Math.ceil(canvasHeight / pageContentHeightInCanvasPixels);

                // Create a temporary canvas to hold each page's slice
                const pageCanvas = document.createElement('canvas');
                const pageCtx = pageCanvas.getContext('2d');
                 if (!pageCtx) {
                    console.error("Could not get 2d context from canvas");
                    return;
                }
                pageCanvas.width = canvasWidth;

                for (let i = 0; i < numPages; i++) {
                    if (i > 0) {
                        pdf.addPage();
                    }
                    
                    const sourceY = i * pageContentHeightInCanvasPixels;
                    // The height of the slice to draw. For the last page, it might be shorter.
                    const sourceHeight = Math.min(pageContentHeightInCanvasPixels, canvasHeight - sourceY);

                    if (sourceHeight <= 0) continue;
                    
                    // Adjust the temp canvas height for the current slice
                    pageCanvas.height = sourceHeight;
                    
                    // Draw the slice from the master canvas to the page canvas
                    pageCtx.drawImage(
                        canvas,
                        0, sourceY,
                        canvasWidth, sourceHeight,
                        0, 0,
                        canvasWidth, sourceHeight
                    );

                    // Calculate the height of this specific image slice when rendered in the PDF
                    const slicePdfHeight = (sourceHeight * contentWidth) / canvasWidth;
                    
                    const pageImgData = pageCanvas.toDataURL('image/png', 1.0);
                    pdf.addImage(pageImgData, 'PNG', MARGIN, MARGIN, contentWidth, slicePdfHeight);
                }
                
                pdf.save(`${resumeData.personalInfo.name}_Resume.pdf`);
            })
            .catch(err => {
                console.error("Failed to export to PDF:", err);
                alert("An error occurred while exporting to PDF. Please try again.");
            })
            .finally(() => {
                // Restore everything to its original state
                resumePreviewElement.style.cssText = originalPreviewStyle;
                aspectWrapper.style.cssText = originalWrapperStyle;
                resumeContentElement.style.cssText = originalContentStyle;

                if (isDarkMode) {
                    root.classList.add('dark');
                }
            });
        }, 150);
    };
    
    const exportToDOCX = () => {
      const { personalInfo, summary, experience, education, skills, projects, customSections } = resumeData;
      
      const doc = new Document({
        sections: [{
          children: [
            // Personal Info
            new Paragraph({ text: personalInfo.name, heading: HeadingLevel.TITLE }),
            new Paragraph({ text: personalInfo.title, heading: HeadingLevel.HEADING_2 }),
            new Paragraph({ text: `Email: ${personalInfo.email} | Phone: ${personalInfo.phone} | Website: ${personalInfo.website}` }),
            new Paragraph({ text: "" }), // Spacer

            // Summary
            new Paragraph({ text: "Summary", heading: HeadingLevel.HEADING_1 }),
            new Paragraph(summary),
            new Paragraph({ text: "" }), // Spacer

            // Experience
            new Paragraph({ text: "Experience", heading: HeadingLevel.HEADING_1 }),
            ...experience.flatMap(exp => [
                new Paragraph({ text: `${exp.title} - ${exp.company}`, style: "strong" }),
                new Paragraph({ text: `${exp.startDate} - ${exp.endDate}` }),
                ...exp.description.split('\n').filter(l => l.trim() !== '').map(d => new Paragraph({ text: d.replace(/^- /, ''), bullet: { level: 0 }})),
                new Paragraph({ text: "" }), // Spacer
            ]),

            // Education
            new Paragraph({ text: "Education", heading: HeadingLevel.HEADING_1 }),
            ...education.flatMap(edu => [
                new Paragraph({ text: `${edu.degree}, ${edu.school}`, style: "strong" }),
                new Paragraph({ text: `${edu.location} | ${edu.graduationDate}` }),
                new Paragraph({ text: "" }), // Spacer
            ]),

            // Skills
            new Paragraph({ text: "Skills", heading: HeadingLevel.HEADING_1 }),
            new Paragraph(skills.map(skill => skill.name).join(', ')),
            new Paragraph({ text: "" }), // Spacer

            // Projects
            new Paragraph({ text: "Projects", heading: HeadingLevel.HEADING_1 }),
            ...projects.flatMap(proj => [
                new Paragraph({ text: proj.name, style: "strong" }),
                new Paragraph(proj.description),
                new Paragraph(proj.link),
                new Paragraph({ text: "" }), // Spacer
            ]),
            
            // Custom Sections
            ...customSections.flatMap(section => [
                new Paragraph({ text: section.title, heading: HeadingLevel.HEADING_1 }),
                new Paragraph(section.content),
                new Paragraph({ text: "" }), // Spacer
            ]),
          ],
        }],
      });

      Packer.toBlob(doc).then(blob => {
        saveBlob(blob, `${resumeData.personalInfo.name}_Resume.docx`);
      });
    };

    const exportToHTML = () => {
        const resumeContentElement = document.getElementById('resume-content');
        if (!resumeContentElement) {
            console.error("Resume content element not found for HTML export.");
            alert("Could not find resume content to export.");
            return;
        }

        const headContent = document.head.innerHTML;
        const resumeHTML = resumeContentElement.innerHTML;
        const fontClass = FONTS.find(f => f.key === customization.font)?.className || 'font-inter';

        const fullHTML = `
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${resumeData.personalInfo.name} Resume</title>
        ${headContent}
        <style>
            body {
                background-color: #f1f5f9; /* slate-100 */
                padding: 1rem;
                display: flex;
                justify-content: center;
                align-items: flex-start;
                min-height: 100vh;
            }
            .dark body {
                background-color: #020617; /* slate-950 */
            }
            #resume-wrapper {
                max-width: 8.5in;
                width: 100%;
                box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
            }
        </style>
    </head>
    <body class="${fontClass}">
        <div id="resume-wrapper">
            ${resumeHTML}
        </div>
    </body>
</html>
        `;

        const blob = new Blob([fullHTML.trim()], { type: 'text/html' });
        saveBlob(blob, `${resumeData.personalInfo.name}_Resume.html`);
    };

    return (
        <div className="flex items-center space-x-2">
            <button onClick={exportToPDF} className="bg-red-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-600">PDF</button>
            <button onClick={exportToDOCX} className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-600">DOCX</button>
            <button onClick={exportToHTML} className="bg-green-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-600">HTML</button>
        </div>
    );
};

export default ExportControls;