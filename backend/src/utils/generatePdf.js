import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generates a simple complaint PDF from a complaint document
 * and saves it under /uploads/pdfs. Returns the relative file path.
 */
const generateComplaintPdf = async (complaint, user) => {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595, 842]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = 800;

  const checkPage = (requiredSpace = 20) => {
    if (y - requiredSpace < 50) {
      page = pdfDoc.addPage([595, 842]);
      y = 800;
    }
  };

  const drawTextWrapped = (text, opts = {}) => {
    if (!text) return;
    const size = opts.size || 11;
    const textFont = opts.bold ? boldFont : font;
    const maxWidth = opts.maxWidth || 495;
    const words = String(text).split(' ');
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = textFont.widthOfTextAtSize(testLine, size);

      if (testWidth > maxWidth && currentLine !== '') {
        checkPage(size + 10);
        page.drawText(currentLine, { x: 50, y, size, font: textFont, color: rgb(0, 0, 0) });
        y -= size + 5;
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      checkPage(size + 10);
      page.drawText(currentLine, { x: 50, y, size, font: textFont, color: rgb(0, 0, 0) });
      y -= size + 10;
    }
  };

  const drawLine = (text, opts = {}) => {
    drawTextWrapped(text, opts);
  };

  drawLine("Cyber Crime Complaint", { size: 18, bold: true });
  y -= 10;
  drawLine(`Case Reference: ${complaint._id}`, { bold: true });
  y -= 10;
  drawLine(`Complainant: ${user.name}`, { bold: true });
  drawLine(`Email: ${user.email}`);
  drawLine(`Phone: ${user.phone || "N/A"}`);
  y -= 10;
  drawLine(`Crime Type: ${complaint.crimeType || "Not classified"}`, { bold: true });
  drawLine(`Date of Incident: ${complaint.incidentDetails?.dateOfIncident || "N/A"}`);
  drawLine(`Platform: ${complaint.incidentDetails?.platform || "N/A"}`);
  drawLine(`Amount Lost: ${complaint.incidentDetails?.amountLost ?? "N/A"}`);
  y -= 10;
  drawLine("Incident Description:", { bold: true });
  drawLine(complaint.incidentDetails?.description || "N/A");
  y -= 10;
  drawLine("Routed Authority:", { bold: true });
  drawLine(complaint.routedAuthority?.name || "Not yet routed");
  drawLine(complaint.routedAuthority?.portalUrl || "");
  
  if (complaint.evidenceIds && complaint.evidenceIds.length > 0) {
    y -= 10;
    drawLine("Evidence Attached:", { bold: true });
    complaint.evidenceIds.forEach((ev, i) => {
      drawLine(`${i + 1}. ${ev.fileName} (${ev.fileType})`);
    });
  }

  const pdfBytes = await pdfDoc.save();

  const dir = path.join(__dirname, "../../uploads/pdfs");
  fs.mkdirSync(dir, { recursive: true });
  const fileName = `complaint_${complaint._id}.pdf`;
  const filePath = path.join(dir, fileName);
  fs.writeFileSync(filePath, pdfBytes);

  return `/uploads/pdfs/${fileName}`;
}

export { generateComplaintPdf };
