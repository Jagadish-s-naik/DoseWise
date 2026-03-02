import jsPDF from 'jspdf';
import type { Explanation } from './api';

export function generatePDF(
  imageDataUrl: string,
  explanations: Explanation[],
  originalImageSize: { width: number; height: number }
) {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Header
  pdf.setFontSize(24);
  pdf.setTextColor(30, 64, 175); // Primary blue
  pdf.text('DentalVision Analysis Report', margin, yPosition);
  yPosition += 10;

  // Date
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  pdf.text(`Generated: ${date}`, margin, yPosition);
  yPosition += 15;

  // Annotated X-ray Image
  pdf.setFontSize(14);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Annotated X-Ray', margin, yPosition);
  yPosition += 5;

  // Calculate image dimensions to fit page
  const maxImageWidth = pageWidth - 2 * margin;
  const maxImageHeight = 100; // Max height for image
  const imageAspect = originalImageSize.width / originalImageSize.height;
  let imageWidth = maxImageWidth;
  let imageHeight = imageWidth / imageAspect;

  if (imageHeight > maxImageHeight) {
    imageHeight = maxImageHeight;
    imageWidth = imageHeight * imageAspect;
  }

  pdf.addImage(imageDataUrl, 'PNG', margin, yPosition, imageWidth, imageHeight);
  yPosition += imageHeight + 15;

  // Findings Section
  pdf.setFontSize(14);
  pdf.text('Findings', margin, yPosition);
  yPosition += 10;

  pdf.setFontSize(10);

  explanations.forEach((exp) => {
    // Check if we need a new page
    if (yPosition > pageHeight - 40) {
      pdf.addPage();
      yPosition = margin;
    }

    // Tooth number and condition
    pdf.setTextColor(30, 64, 175);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Tooth #${exp.tooth_number}: ${exp.condition.replace(/_/g, ' ').toUpperCase()}`, margin, yPosition);
    yPosition += 5;

    // Urgency badge
    const urgencyColors = {
      urgent: [220, 38, 38],
      high: [220, 38, 38],
      soon: [245, 158, 11],
      medium: [245, 158, 11],
      routine: [16, 185, 129],
      none: [16, 185, 129],
    };
    const color = urgencyColors[exp.urgency as keyof typeof urgencyColors] || urgencyColors.routine;
    pdf.setFillColor(color[0], color[1], color[2]);
    pdf.roundedRect(margin, yPosition, 20, 5, 1, 1, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8);
    pdf.text(exp.urgency.toUpperCase(), margin + 1, yPosition + 3.5);
    yPosition += 8;

    // Explanation
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    const explanationLines = pdf.splitTextToSize(exp.explanation, pageWidth - 2 * margin);
    pdf.text(explanationLines, margin, yPosition);
    yPosition += explanationLines.length * 5 + 3;

    // Recommendation
    pdf.setFont('helvetica', 'italic');
    pdf.setTextColor(60, 60, 60);
    const recommendationLines = pdf.splitTextToSize(`→ ${exp.recommendation}`, pageWidth - 2 * margin);
    pdf.text(recommendationLines, margin, yPosition);
    yPosition += recommendationLines.length * 5 + 8;
  });

  // Disclaimer Footer (on last page)
  if (yPosition > pageHeight - 50) {
    pdf.addPage();
    yPosition = margin;
  }

  yPosition = pageHeight - 35;
  pdf.setFillColor(255, 243, 224);
  pdf.rect(margin, yPosition - 5, pageWidth - 2 * margin, 25, 'F');
  
  pdf.setFontSize(12);
  pdf.setTextColor(180, 83, 9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('⚠ IMPORTANT DISCLAIMER', margin + 5, yPosition);
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  yPosition += 5;
  const disclaimerText = "This is an educational tool only and NOT a substitute for professional dental diagnosis. The AI-generated analysis may not be 100% accurate. Always consult with a licensed dentist for proper diagnosis and treatment.";
  const disclaimerLines = pdf.splitTextToSize(disclaimerText, pageWidth - 2 * margin - 10);
  pdf.text(disclaimerLines, margin + 5, yPosition);

  // Footer
  yPosition = pageHeight - 10;
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  pdf.text('Powered by DentalVision AI | Your X-rays are processed securely and not stored', margin, yPosition);

  // Download PDF
  const filename = `dental-report-${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(filename);
}
