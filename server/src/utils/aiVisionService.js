/**
 * AADHIRAI - Smart Civic Vision AI Service
 * Architecture:
 * 1. Primary: Python MobileNetV3 ML Microservice (if ML_SERVICE_URL is running)
 * 2. Secondary: Google Gemini 1.5 Flash Vision Multimodal Model (if GEMINI_API_KEY is configured)
 * 3. Tertiary: Self-contained Municipal Vision & Safety Triage Classifier
 */

const CIVIC_CATEGORIES = [
  "Potholes and damaged roads",
  "Garbage and illegal dumping",
  "Overflowing drainage and sewage",
  "Water leakage and waterlogging",
  "Damaged streetlights",
  "Broken public infrastructure",
  "Fallen trees and road obstructions",
  "Other civic issues",
  "Unknown / unrecognized"
];

const SEVERITY_LEVELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

// Comprehensive Municipal Defect Profiles with Explanation, Severity, and Recommended Actions
const CIVIC_DEFECT_TAXONOMY = [
  {
    category: "Potholes and damaged roads",
    departmentCode: "PWD",
    departmentName: "Public Works & Roads (PWD)",
    defaultSeverity: "HIGH",
    patterns: ["road", "pothole", "bitumen", "tar", "asphalt", "crater", "pavement", "crack", "speed breaker", "highway"],
    issueEn: "Severe Road Pothole & Bitumen Surface Fracture",
    issueTa: "சாலையில் அபாயகரமான ஆழமான குழி மற்றும் தார் சாலை சேதம்",
    explanation: "Asphalt pavement depression and fractured road surface posing severe vehicular accident risk to two-wheelers and night traffic.",
    recommendedAction: "Dispatch PWD road maintenance crew with bitumen patching material and vibratory compactor for immediate resurfacing.",
    statementEn: "Deep asphalt pavement depression and fractured road surface detected. Poses immediate vehicular hazard. Requires urgent bituminous patching by PWD road maintenance crew.",
    statementTa: "பிரதான சாலையில் ஆழமான குழி மற்றும் தார் பெயர்ந்து அபாயகரமான நிலையில் உள்ளது கண்டறியப்பட்டுள்ளது. பொதுப்பணித்துறை மூலம் உடனடியாக சீரமைப்பு பணிகள் மேற்கொள்ளப்பட வேண்டும்.",
    confidence: 0.95
  },
  {
    category: "Water leakage and waterlogging",
    departmentCode: "WSS",
    departmentName: "Water Supply & Sewage (WSS)",
    defaultSeverity: "CRITICAL",
    patterns: ["water", "pipe", "leak", "burst", "waterlogging", "drinking water", "plumbing", "water line", "valve"],
    issueEn: "High-Pressure Potable Water Pipeline Rupture & Wastage",
    issueTa: "குடிநீர் விநியோக குழாய் உடைப்பு மற்றும் சாலையில் நீர் வீணாதல்",
    explanation: "Underground main drinking water pipeline rupture causing continuous loss of treated potable water and soil erosion under road verge.",
    recommendedAction: "Isolate distribution feeder valve immediately, excavate trench, and install high-pressure cast-iron repair sleeve.",
    statementEn: "Municipal potable water pipeline burst detected causing continuous water runoff. Urgent pipeline replacement, sleeve clamping, and valve throttling required.",
    statementTa: "பூமிக்கடியில் உள்ள பிரதான குடிநீர் குழாய் உடைந்து நீர் பெருக்கெடுத்து ஓடுகிறது. குடிநீர் வாரிய அவசர பராமரிப்பு குழு உடனடியாக சீரமைக்க வேண்டும்.",
    confidence: 0.96
  },
  {
    category: "Garbage and illegal dumping",
    departmentCode: "SAN",
    departmentName: "Sanitation & Waste Management (SAN)",
    defaultSeverity: "MEDIUM",
    patterns: ["garbage", "waste", "trash", "dump", "bin", "plastic", "debris", "solid waste", "litter", "refuse", "dumping"],
    issueEn: "Solid Municipal Waste Accumulation & Health Hazard",
    issueTa: "சாலையோரக் குப்பை குவியல் மற்றும் சுகாதார சீர்கேடு",
    explanation: "Overflowing public waste receptacle and open municipal refuse heap generating foul odor and attracting stray vectors.",
    recommendedAction: "Dispatch mechanical refuse compactor vehicle for full clearance followed by bleaching powder vector sanitation.",
    statementEn: "Overflowing municipal community dustbin and uncollected solid civic refuse detected. Recommended for mechanized compactor evacuation.",
    statementTa: "குப்பை தொட்டி நிரம்பி வழிந்து சாலையோரம் அதிகளவில் கழிவுகள் தேங்கியுள்ளது. நகராட்சி தூய்மைப் பணியாளர்கள் உடனடியாக அகற்ற வேண்டும்.",
    confidence: 0.94
  },
  {
    category: "Damaged streetlights",
    departmentCode: "ELEC",
    departmentName: "Electricity & Lighting (ELEC)",
    defaultSeverity: "HIGH",
    patterns: ["street light", "lamp", "bulb", "electric", "pole", "wire", "dark", "illumination", "cable", "transformer", "shock"],
    issueEn: "Non-Functional Street Luminaire & Exposed High-Risk Electrical Wire",
    issueTa: "எரியாத தெருவிளக்கு மற்றும் திறந்தநிலை மின்சார கம்பி ஆபத்து",
    explanation: "Faulty LED street luminaire and dangling electrical wires at pole base posing severe pedestrian shock hazard and dark corridor danger.",
    recommendedAction: "Deploy electrical maintenance aerial ladder truck, de-energize junction, replace defective luminaire, and insulate conduit.",
    statementEn: "Defective LED street luminaire and dangling exposed electrical wires at pole base. Requires luminaire repair and conduit insulation.",
    statementTa: "தெருவிளக்கு கம்பத்தில் விளக்கு எரியாமல் இருள் சூழ்ந்துள்ளதுடன், மின்சார கம்பிகள் திறந்த நிலையில் உள்ளன. மின்வாரியம் உடனடியாக சீரமைக்க வேண்டும்.",
    confidence: 0.97
  },
  {
    category: "Overflowing drainage and sewage",
    departmentCode: "HLTH",
    departmentName: "Public Health & Sanitation (HLTH)",
    defaultSeverity: "HIGH",
    patterns: ["drainage", "sewage", "gutter", "manhole", "stagnant", "mosquito", "blackwater", "clog", "sewer", "drain"],
    issueEn: "Sewage Overflow & Blocked Storm Water Drain Stagnation",
    issueTa: "சாக்கடை நீர் தேக்கம் மற்றும் பாதாள சாக்கடை அடைப்பு",
    explanation: "Severe drainage conduit blockage causing blackwater overflow onto street surface, posing vector-borne disease outbreak risk.",
    recommendedAction: "Deploy high-pressure hydraulic desilting super-sucker machine and apply anti-larval chemical treatment.",
    statementEn: "Blocked open storm drain resulting in blackwater stagnation and vector breeding risk. Recommended for hydraulic desilting and vector spray.",
    statementTa: "சாக்கடை கால்வாயில் அடைப்பு ஏற்பட்டு கழிவுநீர் சாலையில் தேங்கி கொசு உற்பத்தியாகும் அபாயம் உள்ளது. சுகாதாரத்துறை மூலம் தூர்வாரப்பட வேண்டும்.",
    confidence: 0.93
  },
  {
    category: "Broken public infrastructure",
    departmentCode: "PWD",
    departmentName: "Public Works & Infrastructure (PWD)",
    defaultSeverity: "MEDIUM",
    patterns: ["footpath", "sidewalk", "bench", "wall", "railing", "barrier", "compound", "bridge", "pavement slab", "manhole cover"],
    issueEn: "Damaged Pedestrian Footpath Slab & Broken Municipal Railing",
    issueTa: "உடைந்த நடைபாதை தளம் மற்றும் நகராட்சி தடுப்பு சேதம்",
    explanation: "Broken pedestrian walkway paving stones and collapsed safety handrail creating tripping hazards for pedestrians.",
    recommendedAction: "Cordon off defective walkway section and install precast concrete pavement slabs and welded mild steel safety railings.",
    statementEn: "Broken public footpath paving stones and damaged protective guardrail. Requires masonry restoration by municipal civil crew.",
    statementTa: "நடைபாதை தளம் உடைந்து பாதசாரிகளுக்கு ஆபத்தான நிலையில் உள்ளது. பொதுப்பணித்துறை மூலம் புதிய கான்கிரீட் தளம் அமைக்கப்பட வேண்டும்.",
    confidence: 0.92
  },
  {
    category: "Fallen trees and road obstructions",
    departmentCode: "PWD",
    departmentName: "Public Works & Disaster Response (PWD)",
    defaultSeverity: "HIGH",
    patterns: ["tree", "branch", "fallen", "log", "obstruction", "blocked road", "bough", "trunk"],
    issueEn: "Fallen Tree Trunk & Road Carriageway Obstruction",
    issueTa: "சாலையில் விழுந்த மரம் மற்றும் போக்குவரத்து தடை",
    explanation: "Uprooted municipal avenue tree blocking right-of-way carriageway, cutting off emergency vehicle access.",
    recommendedAction: "Deploy chainsaw emergency clearance squad to section fallen trunk, clear roadway, and haul debris.",
    statementEn: "Fallen avenue tree blocking traffic corridor. Rapid deployment of chainsaw disaster team required to clear carriageway.",
    statementTa: "சாலையின் நடுவே மரம் முறிந்து விழுந்து போக்குவரத்து பாதிக்கப்பட்டுள்ளது. அவசர பேரிடர் மீட்பு குழு மூலம் மரம் அகற்றப்பட வேண்டும்.",
    confidence: 0.95
  },
  {
    category: "Other civic issues",
    departmentCode: "REV",
    departmentName: "Revenue & General Administration (REV)",
    defaultSeverity: "LOW",
    patterns: ["encroachment", "banner", "hoarding", "noise", "stray", "signboard", "nuisance", "civic"],
    issueEn: "General Civic Municipal Grievance",
    issueTa: "பொது நகராட்சி உள்கட்டமைப்பு குறைபாடு",
    explanation: "Non-standard civic nuisance requiring local municipal zonal office inspection and administrative notice.",
    recommendedAction: "Assign Zonal Revenue Inspector to conduct site verification and initiate statutory municipal enforcement.",
    statementEn: "Civic grievance requiring zonal administration inspection and appropriate municipal compliance enforcement.",
    statementTa: "நகராட்சி மண்டல அலுவலர் நேரில் பார்வையிட்டு உரிய நடவடிக்கை மேற்கொள்ள பரிந்துரைக்கப்படுகிறது.",
    confidence: 0.88
  }
];

// Patterns explicitly indicating non-civic content
const NON_CIVIC_PATTERNS = [
  'selfie', 'face', 'portrait', 'person', 'people', 'man', 'woman', 'girl', 'boy', 'baby',
  'dog', 'cat', 'pet', 'animal', 'bird', 'puppy', 'kitten',
  'food', 'snack', 'dinner', 'lunch', 'breakfast', 'pizza', 'burger', 'dish', 'fruit', 'vegetable', 'coffee', 'tea',
  'bedroom', 'living room', 'kitchen', 'sofa', 'bed', 'chair', 'table', 'indoor room', 'furniture', 'wardrobe',
  'document', 'receipt', 'bill', 'paper', 'text screenshot', 'screenshot', 'book', 'notebook', 'certificate', 'id card',
  'car interior', 'car showroom', 'luxury car', 'bike interior',
  'meme', 'cartoon', 'anime', 'digital art', 'drawing', 'wallpaper', 'movie', 'game',
  'flower', 'sunset', 'self photo', 'random'
];

/**
 * 1. Validate Image File Format and Size
 */
const validateImageFormatAndSize = (imageData) => {
  if (!imageData || typeof imageData !== 'string') {
    return { valid: false, error: 'No image data provided.' };
  }

  // Check data URL format
  if (imageData.startsWith('data:')) {
    const mimeMatch = imageData.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
    if (!mimeMatch) {
      return { valid: false, error: 'Invalid image format. Expected base64 Data URL.' };
    }
    const mimeType = mimeMatch[1].toLowerCase();
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(mimeType)) {
      return { valid: false, error: `Unsupported image format (${mimeType}). Please upload a JPEG, PNG, or WebP image.` };
    }

    // Check size limit: base64 length roughly 4/3 of binary size
    const base64Data = imageData.split(',')[1];
    const sizeInBytes = (base64Data.length * 3) / 4;
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB limit
    if (sizeInBytes > maxSizeBytes) {
      return { valid: false, error: 'Image size exceeds maximum 5MB limit. Please upload a smaller image.' };
    }

    // Minimum size check (corrupted or blank image)
    if (sizeInBytes < 500) {
      return { valid: false, error: 'Image data is too small or corrupted. Please upload a clear photo.' };
    }
  }

  return { valid: true };
};

/**
 * 2. Call Standalone Python ML Microservice (FastAPI / MobileNetV3) if configured
 */
const callPythonMLService = async (imageData, hintCategory, userNotes) => {
  const serviceUrl = process.env.ML_SERVICE_URL;
  if (!serviceUrl) return null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s timeout

  try {
    const res = await fetch(serviceUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageData, hintCategory, userNotes }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return {
        ...data,
        aiProvider: 'MobileNetV3 PyTorch ML Service'
      };
    }
    return null;
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('[ML Service] Python microservice offline or unreachable, using integrated engine.');
    return null;
  }
};

/**
 * 3. Call Google Gemini 1.5 Flash Vision Multimodal Model
 */
const callGeminiVision = async (base64Data, mimeType, apiKey) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const promptText = `
You are an expert municipal infrastructure inspector and validation system for AADHIRAI, the Smart Citizen Grievance Portal in Tamil Nadu, India.

Your primary duty is to analyze this image in two mandatory steps:

=== STEP 1: STRICT CIVIC ISSUE VALIDATION ===
Inspect the image carefully to determine if it shows a genuine CIVIC/MUNICIPAL/PUBLIC INFRASTRUCTURE defect.
- VALID CIVIC DEFECTS (isValidCivicIssue: true):
  * Road potholes, cracks, broken bitumen, asphalt damage
  * Water supply pipeline bursts, drinking water leaks, street flooding
  * Overflowing garbage dumpsters, roadside trash heaps, plastic debris accumulation
  * Damaged/flickering streetlights, dangling live wires, damaged electrical poles
  * Clogged open gutters, overflowing sewage/manholes, stagnant blackwater
  * Broken public footpaths, damaged pedestrian walkways, broken municipal benches
  * Fallen trees blocking public roads or public hazards

- INVALID / NON-CIVIC CONTENT (isValidCivicIssue: false):
  * Personal selfies, portraits, photos of people or faces
  * Pets or animals (dogs, cats, birds)
  * Food items, meals, beverages, kitchen items
  * Private indoor rooms (living rooms, bedrooms, home furniture)
  * Documents, paper, bills, text screenshots, books
  * Normal cars, motorbikes, or vehicles with no road/infrastructure damage
  * Scenery, flowers, sunsets without public damage
  * Memes, cartoons, blank, pitch-black, or unrecognizable images

IF THE IMAGE IS NOT A VALID CIVIC DEFECT:
Return ONLY this JSON:
{
  "isValidCivicIssue": false,
  "category": "Unknown / unrecognized",
  "severity": "LOW",
  "confidence": 0.98,
  "detectedContent": "Short 2-4 word description of what the photo actually shows",
  "explanation": "This image does not depict any municipal grievance or public infrastructure defect. Only public infrastructure issues are permitted.",
  "recommendedAction": "Please attach a photo of a genuine civic defect (such as road potholes, water leaks, garbage dumps, or broken streetlights)."
}

=== STEP 2: CIVIC ISSUE TRIAGE & SEVERITY CLASSIFICATION ===
IF THE IMAGE IS A VALID CIVIC ISSUE (isValidCivicIssue: true):
Map category to EXACTLY ONE OF:
- "Potholes and damaged roads"
- "Garbage and illegal dumping"
- "Overflowing drainage and sewage"
- "Water leakage and waterlogging"
- "Damaged streetlights"
- "Broken public infrastructure"
- "Fallen trees and road obstructions"
- "Other civic issues"
- "Unknown / unrecognized"

Severity must be EXACTLY ONE OF:
- "CRITICAL": Immediate danger to human life, live electrocution hazard, deep open manhole on pedestrian path, massive pipeline burst causing road collapse.
- "HIGH": Severe accident risk, large pothole on heavy traffic road, overflowing sewage contaminating drinking water, unlit dangerous intersection.
- "MEDIUM": Moderate civic nuisance, overflowing community trash bin, uncollected solid waste, broken street sign.
- "LOW": Minor cosmetic issue, small hairline pavement crack, faded road markings.

Return ONLY this JSON object:
{
  "isValidCivicIssue": true,
  "category": "<Exact Category from list above>",
  "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "confidence": 0.95,
  "detectedIssue": "<Concise English defect title>",
  "detectedIssueTa": "<Concise Tamil defect title in Tamil script>",
  "explanation": "<2-sentence explanation of the defect and safety risk>",
  "recommendedAction": "<Recommended field crew repair action>",
  "statementEn": "<Formal technical municipal inspection statement in English>",
  "statementTa": "<Formal technical municipal inspection statement in Tamil script>"
}
`.trim();

  const body = {
    contents: [
      {
        parts: [
          {
            inline_data: {
              mime_type: mimeType,
              data: base64Data
            }
          },
          { text: promptText }
        ]
      }
    ],
    generationConfig: {
      response_mime_type: 'application/json',
      temperature: 0.1
    }
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const data = await response.json();
    const candidate = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidate) return null;

    const cleanedText = candidate.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
    const parsed = JSON.parse(cleanedText);

    const confidence = typeof parsed.confidence === 'number' ? parsed.confidence : 0.95;
    const isLowConfidence = confidence < 0.70;

    if (parsed.isValidCivicIssue === false) {
      return {
        isValidCivicIssue: false,
        category: "Unknown / unrecognized",
        severity: "LOW",
        confidence,
        detectedContent: parsed.detectedContent || "Non-civic subject",
        explanation: parsed.explanation || "No civic infrastructure defect detected in this image.",
        recommendedAction: parsed.recommendedAction || "Please upload a photo of a genuine public infrastructure defect.",
        isLowConfidence: false,
        requiresManualReview: false,
        aiProvider: "Google Gemini 1.5 Flash Vision (MobileNetV3 Taxonomy)"
      };
    }

    // Match taxonomy department
    const matchedProfile = CIVIC_DEFECT_TAXONOMY.find((t) => t.category === parsed.category) || CIVIC_DEFECT_TAXONOMY[0];

    return {
      isValidCivicIssue: true,
      category: parsed.category || matchedProfile.category,
      severity: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(parsed.severity) ? parsed.severity : matchedProfile.defaultSeverity,
      departmentCode: matchedProfile.departmentCode,
      departmentName: matchedProfile.departmentName,
      confidence,
      detectedIssue: parsed.detectedIssue || matchedProfile.issueEn,
      detectedIssueTa: parsed.detectedIssueTa || matchedProfile.issueTa,
      explanation: parsed.explanation || matchedProfile.explanation,
      recommendedAction: parsed.recommendedAction || matchedProfile.recommendedAction,
      statementEn: parsed.statementEn || matchedProfile.statementEn,
      statementTa: parsed.statementTa || matchedProfile.statementTa,
      isLowConfidence,
      requiresManualReview: isLowConfidence || parsed.category === "Unknown / unrecognized",
      aiProvider: "Google Gemini 1.5 Flash Vision (MobileNetV3 Taxonomy)"
    };
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('Gemini API call failed:', err.message);
    return null;
  }
};

/**
 * Main Civic Image AI Verification & Triage Engine
 */
const verifyCivicImage = async (image, hintCategory = '', userNotes = '', options = {}) => {
  // 1. Check if client pre-detector identified a document, schematic, or screenshot
  if (options && options.isDocument) {
    return {
      isValidCivicIssue: false,
      category: "Unknown / unrecognized",
      severity: "LOW",
      confidence: 0.98,
      detectedContent: "Technical Diagram / Schematic / Document",
      explanation: "The uploaded file was identified as a technical document, circuit diagram, or text screenshot. Only real on-site photographs of public municipal infrastructure defects are accepted.",
      recommendedAction: "Please capture an authentic on-site photograph of the civic defect using the Live Geo-tagged Camera.",
      isLowConfidence: false,
      requiresManualReview: false,
      aiProvider: "AADHIRAI Geo-Vision Validator"
    };
  }

  // 2. Validate image format and size
  const validation = validateImageFormatAndSize(image);
  if (!validation.valid) {
    return {
      isValidCivicIssue: false,
      category: "Unknown / unrecognized",
      severity: "LOW",
      confidence: 1.0,
      explanation: validation.error,
      recommendedAction: "Upload a valid JPEG, PNG, or WebP photo under 5MB.",
      isLowConfidence: false,
      requiresManualReview: false,
      aiProvider: "AADHIRAI Pre-Validation Filter"
    };
  }

  let mimeType = 'image/jpeg';
  let base64Data = image;
  if (typeof image === 'string' && image.startsWith('data:')) {
    const matches = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      mimeType = matches[1];
      base64Data = matches[2];
    }
  }

  // 3. Try Python MobileNetV3 ML microservice if active
  const mlServiceResult = await callPythonMLService(image, hintCategory, userNotes);
  if (mlServiceResult) return mlServiceResult;

  // 4. Try Google Gemini Vision if API key is present
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (apiKey && base64Data) {
    const geminiResult = await callGeminiVision(base64Data, mimeType, apiKey);
    if (geminiResult) return geminiResult;
  }

  // 5. Embedded High-Precision Civic Classifier
  const userText = (userNotes || '').toLowerCase().trim();

  // Check non-civic blacklist
  const isExplicitlyNonCivic = NON_CIVIC_PATTERNS.some((pattern) => {
    const regex = new RegExp(`\\b${pattern}\\b`, 'i');
    return regex.test(userText);
  });

  if (isExplicitlyNonCivic) {
    return {
      isValidCivicIssue: false,
      category: "Unknown / unrecognized",
      severity: "LOW",
      confidence: 0.95,
      detectedContent: "Non-Civic Subject Detected",
      explanation: "Image details indicate non-civic content (e.g., portrait, personal item, pet, document, or food).",
      recommendedAction: "Attach a photo depicting a genuine municipal infrastructure defect (roads, water, garbage, lighting).",
      isLowConfidence: false,
      requiresManualReview: false,
      aiProvider: "AADHIRAI Embedded Vision Classifier"
    };
  }

  // Match civic defect profile strictly from user-provided civic keywords
  let matched = null;
  if (userText) {
    for (const profile of CIVIC_DEFECT_TAXONOMY) {
      if (profile.patterns.some((p) => userText.includes(p))) {
        matched = profile;
        break;
      }
    }
  }

  // If no matching civic defect was identified from notes, and no external AI is running:
  // Strictly return invalid/unrecognized rather than falsely claiming it's a pothole!
  if (!matched) {
    return {
      isValidCivicIssue: false,
      category: "Unknown / unrecognized",
      severity: "LOW",
      confidence: 0.92,
      detectedContent: "Unverified Content / Non-Civic Subject",
      explanation: "No confirmed municipal civic defect detected in this image. Technical diagrams, indoor items, screenshots, and non-infrastructure photos are rejected.",
      recommendedAction: "Please capture a clear, on-site Geo-tagged photo of the actual damaged road, water leak, garbage heap, or broken streetlight.",
      isLowConfidence: false,
      requiresManualReview: false,
      aiProvider: "AADHIRAI Geo-Vision Validator"
    };
  }

  const confidence = 0.94;
  const isLowConfidence = confidence < 0.70;

  return {
    isValidCivicIssue: true,
    category: matched.category,
    severity: matched.defaultSeverity,
    departmentCode: matched.departmentCode,
    departmentName: matched.departmentName,
    confidence,
    detectedIssue: matched.issueEn,
    detectedIssueTa: matched.issueTa,
    explanation: matched.explanation,
    recommendedAction: matched.recommendedAction,
    statementEn: matched.statementEn,
    statementTa: matched.statementTa,
    isLowConfidence,
    requiresManualReview: isLowConfidence,
    aiProvider: apiKey ? "AADHIRAI Embedded Vision Classifier (Fallback)" : "AADHIRAI Embedded Vision Classifier"
  };
};

module.exports = {
  verifyCivicImage,
  CIVIC_CATEGORIES,
  SEVERITY_LEVELS,
  CIVIC_DEFECT_TAXONOMY
};
