import { GoogleGenerativeAI } from "@google/generative-ai";

const CRIME_KEYWORDS = {
  upi_fraud: ["upi", "gpay", "phonepe", "paytm", "debited", "transaction", "otp"],
  phishing: ["phishing", "fake link", "fake website", "clicked a link"],
  sextortion: ["sextortion", "nude", "blackmail", "video call"],
  cyberbullying: ["bully", "harass", "threat", "abuse"],
  identity_theft: ["identity", "aadhaar", "pan card", "impersonat"],
  social_media_hack: ["hacked", "account taken", "instagram", "facebook", "whatsapp hacked"],
};

// Simple keyword-based fallback if the Gemini API is unavailable
const fallbackClassify = (description = "") => {
  const text = description.toLowerCase();
  for (const [type, keywords] of Object.entries(CRIME_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) {
      return { crimeType: type, confidence: 0.5, source: "fallback" };
    }
  }
  return { crimeType: "other", confidence: 0.3, source: "fallback" };
}

/**
 * Classifies a victim's incident description into a crime type
 * and suggests required evidence, using Gemini. Falls back to
 * keyword matching if the API key is missing or the call fails.
 */
const classifyCrime = async (description) => {
  if (!process.env.GEMINI_API_KEY) {
    return fallbackClassify(description);
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are a cybercrime triage assistant. Read the victim's description below and respond
ONLY with strict JSON (no markdown, no extra text) in this exact shape:
{
  "crimeType": "one of: upi_fraud, phishing, sextortion, cyberbullying, identity_theft, social_media_hack, other",
  "confidence": number between 0 and 1,
  "requiredEvidence": ["short evidence item", "short evidence item"]
}

Victim description: "${description}"
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      crimeType: parsed.crimeType || "other",
      confidence: parsed.confidence ?? 0.6,
      requiredEvidence: parsed.requiredEvidence || [],
      source: "gemini",
    };
  } catch (err) {
    console.error("Gemini classification failed, using fallback:", err.message);
    return fallbackClassify(description);
  }
}

export { classifyCrime, fallbackClassify };
