import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function sanitizeForPdf(text) {
  if (text === null || text === undefined) return "N/A";
  return String(text)
    .replace(/₹/g, "Rs.")
    .replace(/[\u2018\u2019]/g, "'")   // smart single quotes -> straight quote
    .replace(/[\u201C\u201D]/g, '"')   // smart double quotes -> straight quote
    .replace(/\u2013|\u2014/g, "-")    // en/em dash -> hyphen
    .replace(/[^\x00-\x7F]/g, "");     // strip any remaining non-ASCII/WinAnsi-unsafe chars
}

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
  drawLine(`Case Reference: ${sanitizeForPdf(complaint._id)}`, { bold: true });
  y -= 10;
  drawLine(`Complainant: ${sanitizeForPdf(user.name)}`, { bold: true });
  drawLine(`Email: ${sanitizeForPdf(user.email)}`);
  drawLine(`Phone: ${sanitizeForPdf(user.phone)}`);
  y -= 10;
  drawLine(`Crime Type: ${sanitizeForPdf(complaint.crimeType || "Not classified")}`, { bold: true });
  drawLine(`Date of Incident: ${sanitizeForPdf(complaint.incidentDetails?.dateOfIncident)}`);
  drawLine(`Platform: ${sanitizeForPdf(complaint.incidentDetails?.platform)}`);
  drawLine(`Amount Lost: ${sanitizeForPdf(complaint.incidentDetails?.amountLost)}`);
  y -= 10;
  drawLine("Incident Description:", { bold: true });
  drawLine(sanitizeForPdf(complaint.incidentDetails?.description));
  y -= 10;
  drawLine("Routed Authority:", { bold: true });
  drawLine(sanitizeForPdf(complaint.routedAuthority?.name || "Not yet routed"));
  drawLine(sanitizeForPdf(complaint.routedAuthority?.portalUrl || ""));
  
  if (complaint.evidenceIds && complaint.evidenceIds.length > 0) {
    y -= 10;
    drawLine("Evidence Attached:", { bold: true });
    complaint.evidenceIds.forEach((ev, i) => {
      drawLine(`${i + 1}. ${sanitizeForPdf(ev.fileName)} (${sanitizeForPdf(ev.fileType)})`);
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

if (process.env.NODE_ENV === "test") {
  (async () => {
    try {
      const mockComplaint = {
        _id: "test-id-123",
        crimeType: "Financial Fraud",
        incidentDetails: {
          dateOfIncident: "2026-07-08",
          platform: "WhatsApp",
          amountLost: "₹5000",
          description: "Got scammed “big time” — lost money \uD83D\uDE22",
        },
        routedAuthority: {
          name: "Cyber Cell",
          portalUrl: "https://cybercrime.gov.in"
        }
      };
      const mockUser = {
        name: "John Doe",
        email: "john@example.com",
        phone: "+91 9999999999"
      };
      const result = await generateComplaintPdf(mockComplaint, mockUser);
      console.log("Regression test passed. PDF generated at:", result);
    } catch (err) {
      console.error("Regression test failed:", err);
    }
  })();
}

export { generateComplaintPdf };
