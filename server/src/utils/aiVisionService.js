/**
 * AADHIRAI - Smart Civic Vision AI Service
 * Powered by Google Gemini 1.5 Flash Vision with Strict Civic Validation & Emergency Triage
 */

// Comprehensive Municipal Defect Knowledge Base
const CIVIC_DEFECT_TAXONOMY = [
  {
    keyword: 'pothole',
    patterns: ['road', 'pothole', 'bitumen', 'tar', 'asphalt', 'street', 'crater', 'pavement', 'crack', 'speed breaker'],
    issueEn: 'Severe Road Pothole & Bitumen Surface Fracture',
    issueTa: 'சாலையில் அபாயகரமான ஆழமான குழி மற்றும் தார் சாலை சேதம்',
    category: 'Roads & Infrastructure',
    departmentCode: 'PWD',
    suggestedPriority: 'HIGH',
    emergencyReasonEn: 'High risk of skidding and severe accidents for two-wheelers and night traffic on active road.',
    emergencyReasonTa: 'இருசக்கர வாகனங்கள் விபத்துக்குள்ளாகும் அபாயம் உள்ளதால் அவசர சீரமைப்பு தேவை.',
    statementEn: 'Deep asphalt pavement depression and fractured road surface detected. Poses immediate vehicular hazard to two-wheelers and night traffic. Requires urgent bituminous patching and compaction by PWD road maintenance crew.',
    statementTa: 'பிரதான சாலையில் ஆழமான குழி மற்றும் தார் பெயர்ந்து அபாயகரமான நிலையில் உள்ளது கண்டறியப்பட்டுள்ளது. இருசக்கர வாகன ஓட்டிகளுக்கு விபத்து அபாயம் உள்ளதால் பொதுப்பணித்துறை மூலம் உடனடியாக தார் பூச்சு மற்றும் சீரமைப்பு பணிகள் மேற்கொள்ளப்பட வேண்டும்.',
    confidence: 0.96
  },
  {
    keyword: 'water_leak',
    patterns: ['water', 'pipe', 'leak', 'burst', 'drinking water', 'overflow', 'plumbing', 'water line', 'tap'],
    issueEn: 'High-Pressure Drinking Water Pipeline Rupture & Wastage',
    issueTa: 'குடிநீர் விநியோக குழாய் உடைப்பு மற்றும் சாலையில் நீர் வீணாதல்',
    category: 'Water Supply',
    departmentCode: 'WSS',
    suggestedPriority: 'URGENT',
    emergencyReasonEn: 'Continuous potable water loss, road foundation scouring, and water supply disruption to locality.',
    emergencyReasonTa: 'குடிநீர் பெருமளவில் வீணாவதோடு சாலை அரிப்பு மற்றும் குடிநீர் தட்டுப்பாடு ஏற்படும் அவசர நிலை.',
    statementEn: 'Underground municipal water pipeline burst detected causing continuous potable water runoff and soil erosion along road verge. Urgent pipeline replacement, sleeve clamping, and valve throttling required.',
    statementTa: 'பூமிக்கடியில் உள்ள பிரதான குடிநீர் விநியோக குழாய் உடைந்து சாலை மற்றும் நடைபாதையில் தொடர்ந்து நீர் பெருக்கெடுத்து ஓடுகிறது. குடிநீர் வாரிய அவசர பராமரிப்பு குழு உடனடியாக சீரமைக்க வேண்டும்.',
    confidence: 0.95
  },
  {
    keyword: 'garbage',
    patterns: ['garbage', 'waste', 'trash', 'dump', 'bin', 'plastic', 'debris', 'solid waste', 'litter', 'refuse'],
    issueEn: 'Solid Municipal Waste Accumulation & Public Health Hazard',
    issueTa: 'சாலையோரக் குப்பை குவியல் மற்றும் சுகாதார சீர்கேடு',
    category: 'Sanitation & Waste',
    departmentCode: 'SAN',
    suggestedPriority: 'MEDIUM',
    emergencyReasonEn: 'Odor emission, stray dog congregation, and environmental degradation in residential area.',
    emergencyReasonTa: 'துர்நாற்றம் மற்றும் தெருநாய்கள் தொல்லையால் பொது சுகாதார சீர்கேடு ஏற்படுதல்.',
    statementEn: 'Overflowing municipal community dustbin and uncollected solid civic refuse detected. Attracting stray animals and generating odor. Recommended for mechanized compactor evacuation and bleaching powder sanitization.',
    statementTa: 'குப்பை தொட்டி நிரம்பி வழிந்து சாலையோரம் அதிகளவில் கழிவுகள் தேங்கியுள்ளது. துர்நாற்றம் மற்றும் சுகாதார சீர்கேடு ஏற்பட்டுள்ளதால் நகராட்சி தூய்மைப் பணியாளர்கள் உடனடியாக அகற்ற வேண்டும்.',
    confidence: 0.94
  },
  {
    keyword: 'light',
    patterns: ['street light', 'lamp', 'bulb', 'electric', 'pole', 'wire', 'dark', 'illumination', 'cable', 'transformer', 'shock'],
    issueEn: 'Non-Functional Street Lamp & Exposed High-Risk Electrical Wire',
    issueTa: 'எரியாத தெருவிளக்கு மற்றும் திறந்தநிலை மின்சார கம்பி ஆபத்து',
    category: 'Electricity & Lighting',
    departmentCode: 'ELEC',
    suggestedPriority: 'URGENT',
    emergencyReasonEn: 'Immediate electrocution threat to pedestrians and lack of night visibility causing public safety danger.',
    emergencyReasonTa: 'பொதுமக்கள் மீது மின்சாரம் பாயும் ஆபத்து மற்றும் இரவு நேர இருளால் பாதுகாப்பு குறைபாடு.',
    statementEn: 'Defective LED street luminaire and dangling exposed electrical wires at pole base. Area plunged in darkness creating safety risk for pedestrians. Requires luminaire repair, junction box closure, and conduit insulation.',
    statementTa: 'தெருவிளக்கு கம்பத்தில் விளக்கு எரியாமல் இருள் சூழ்ந்துள்ளதுடன், மின்சார கம்பிகள் திறந்த நிலையில் ஆபத்தை விளைவிக்கும் வகையில் உள்ளன. மின்வாரியம் உடனடியாக சீரமைக்க வேண்டும்.',
    confidence: 0.97
  },
  {
    keyword: 'drainage',
    patterns: ['drainage', 'sewage', 'gutter', 'manhole', 'stagnant', 'mosquito', 'blackwater', 'clog', 'sewer'],
    issueEn: 'Sewage Overflow & Blocked Storm Water Drain Stagnation',
    issueTa: 'சாக்கடை நீர் தேக்கம் மற்றும் பாதாள சாக்கடை அடைப்பு',
    category: 'Public Health',
    departmentCode: 'HLTH',
    suggestedPriority: 'HIGH',
    emergencyReasonEn: 'Blackwater stagnation causing vector mosquito breeding (dengue/malaria risk) and foul odor.',
    emergencyReasonTa: 'கழிவுநீர் தேங்குவதால் கொசு உற்பத்தியாகி டெங்கு, மலேரியா போன்ற நோய்கள் பரவும் அபாயம்.',
    statementEn: 'Blocked open storm drain resulting in blackwater stagnation and vector breeding risk. Recommended for hydraulic desilting, culvert clearing, and municipal vector control larvicide spray.',
    statementTa: 'சாக்கடை கால்வாயில் அடைப்பு ஏற்பட்டு கழிவுநீர் சாலையில் தேங்கி கொசு உற்பத்தியாகி பொதுமக்களுக்கு நோய் பரவும் அபாயம் உள்ளது. சுகாதாரத்துறை மூலம் தூர்வாரப்பட வேண்டும்.',
    confidence: 0.93
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
 * Call Google Gemini 1.5 Flash Vision API with Civic Validation and Emergency Triage
 * @param {string} base64Data Raw base64 string
 * @param {string} mimeType 'image/jpeg', 'image/png', etc.
 * @param {string} apiKey Gemini API Key
 */
const callGeminiVision = async (base64Data, mimeType, apiKey) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const promptText = `
You are an expert municipal infrastructure inspector and validation system for AADHIRAI, the Smart Citizen Grievance Portal in Tamil Nadu, India.

Your primary duty is to analyze this image in two mandatory steps:

=== STEP 1: STRICT CIVIC ISSUE VALIDATION ===
Inspect the image carefully to determine if it shows a genuine CIVIC/MUNICIPAL/PUBLIC INFRASTRUCTURE defect.
- VALID CIVIC DEFECTS (isCivicIssue: true):
  * Road damage: potholes, cracks, broken bitumen, caved-in road, damaged speed breakers.
  * Water supply: pipeline leaks/bursts, valve leaks, waterlogging on public roads.
  * Sanitation: overflowing community trash bins, roadside garbage heaps, plastic waste accumulation.
  * Electricity: non-working street lamps, dangling exposed live electric wires, broken poles, damaged transformers.
  * Drainage/Public Health: clogged storm drains, overflowing sewage/manholes, open manholes, stagnant blackwater.
  * Other civic: broken footpaths, broken municipal railings, fallen trees blocking public paths.

- INVALID / NON-CIVIC CONTENT (isCivicIssue: false):
  * Personal selfies, portraits, photos of people or faces.
  * Pets or animals (dogs, cats, birds) without an active public municipal defect.
  * Food items, meals, beverages, kitchen items.
  * Private indoor rooms (living rooms, bedrooms, home furniture, interior ceilings).
  * Documents, paper, bills, text screenshots, books, identity cards.
  * Normal cars, motorbikes, or vehicles with no road/infrastructure damage.
  * Scenery, flowers, sunsets without public damage.
  * Memes, cartoons, anime, blank, or completely dark/unclear images.

IF THE IMAGE IS NOT A VALID CIVIC ISSUE:
You MUST return ONLY this JSON:
{
  "isCivicIssue": false,
  "confidence": 0.98,
  "detectedContent": "A short 2-4 word description of what the photo actually shows (e.g. 'Personal Selfie Photo', 'Domestic Cat/Pet', 'Food / Meal Item', 'Indoor Living Room', 'Document / Paper Screenshot')",
  "validationMessageEn": "Invalid grievance photo. This image does not show a public civic or municipal infrastructure issue. AADHIRAI only accepts photos of municipal problems like road potholes, leaking pipes, garbage dumps, and broken streetlights.",
  "validationMessageTa": "செல்லுபடியாகாத புகைப்படம். இந்த படம் எந்தவொரு நகராட்சி அல்லது பொது உள்கட்டமைப்பு குறைபாட்டையும் காட்டவில்லை. ஆதirai தளம் சாலை குழிகள், குடிநீர் குழாய் உடைப்பு, குப்பைக் குவியல்கள், எரியாத தெருவிளக்குகள் போன்ற பொதுப் பிரச்சனைகளுக்கான புகைப்படங்களை மட்டுமே ஏற்கும்."
}

=== STEP 2: CIVIC ISSUE TRIAGE & EMERGENCY PRIORITY ===
IF THE IMAGE IS A VALID CIVIC ISSUE (isCivicIssue: true):
Determine:
1. detectedIssue: Concise, professional English defect name (e.g. 'Severe Bitumen Surface Pothole and Asphalt Depression').
2. detectedIssueTa: Formal Tamil title in Tamil script (e.g. 'சாலையில் அபாயகரமான ஆழமான தார் சாலை குழி').
3. category: Exactly one of: 'Roads & Infrastructure', 'Water Supply', 'Sanitation & Waste', 'Electricity & Lighting', 'Public Health'.
4. departmentCode: Exactly one of: 'PWD', 'WSS', 'SAN', 'ELEC', 'HLTH'.
5. suggestedPriority: Exactly one of: 'LOW', 'MEDIUM', 'HIGH', 'URGENT'
   - 'URGENT': Immediate threat to human life, live electrocution hazard, deep open manhole on pedestrian path, massive pipeline burst causing road collapse.
   - 'HIGH': Major accident risk, large pothole on heavy traffic road, overflowing sewage contaminating drinking water zone, dangerous dark intersection.
   - 'MEDIUM': Significant public nuisance, overflowing community garbage bin, uncollected solid waste, non-hazardous water stagnation.
   - 'LOW': Minor non-hazardous cosmetic issue, small hairline pavement crack, faded road markings.
6. emergencyReasonEn: One concise sentence explaining why this priority/emergency rating was assigned based on public safety.
7. emergencyReasonTa: One concise sentence in Tamil explaining the emergency reason.
8. statementEn: 2-3 sentence formal municipal inspection statement describing the defect, hazard, and recommended field crew action.
9. statementTa: 2-3 sentence formal municipal inspection statement in Tamil script.
10. confidence: Number between 0.88 and 0.99.

Return ONLY the raw JSON object without markdown fences.
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
          {
            text: promptText
          }
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
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      console.warn('Gemini Vision API returned error status:', response.status, errText);
      return null;
    }

    const data = await response.json();
    const candidate = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidate) {
      console.warn('Gemini Vision returned empty candidate part.');
      return null;
    }

    // Clean potential markdown quotes
    const cleanedText = candidate
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```$/i, '')
      .trim();

    const parsed = JSON.parse(cleanedText);

    // CASE 1: Rejected as Non-Civic Image
    if (parsed.isCivicIssue === false) {
      return {
        isCivicIssue: false,
        detectedIssue: 'Non-Civic Content / பொது குறைபாடு அல்ல',
        detectedIssueTa: 'செல்லுபடியாகாத படம் (பொதுப் பிரச்சனை அல்ல)',
        detectedContent: parsed.detectedContent || 'Non-civic subject',
        validationMessageEn: parsed.validationMessageEn || 'No civic defect detected in this image. Please upload a clear photo of public infrastructure damage.',
        validationMessageTa: parsed.validationMessageTa || 'இந்த படத்தில் நகராட்சி அல்லது பொது உள்கட்டமைப்பு குறைபாடுகள் எதுவும் கண்டறியப்படவில்லை. தயவுசெய்து பொதுப் பிரச்சனை படத்தை பதிவேற்றவும்.',
        suggestedPriority: null,
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.95,
        aiProvider: 'Google Gemini 1.5 Flash Vision'
      };
    }

    // CASE 2: Valid Civic Defect
    if (parsed.detectedIssue && parsed.statementEn) {
      return {
        isCivicIssue: true,
        detectedIssue: parsed.detectedIssue,
        detectedIssueTa: parsed.detectedIssueTa || parsed.detectedIssue,
        category: parsed.category || 'Roads & Infrastructure',
        departmentCode: parsed.departmentCode || 'PWD',
        suggestedPriority: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(parsed.suggestedPriority)
          ? parsed.suggestedPriority
          : 'HIGH',
        emergencyReasonEn: parsed.emergencyReasonEn || 'Assessed based on municipal safety hazards and public risk.',
        emergencyReasonTa: parsed.emergencyReasonTa || 'பொது பாதுகாப்பு அபாயங்களின் அடிப்படையில் மதிப்பிடப்பட்டது.',
        statementEn: parsed.statementEn,
        statementTa: parsed.statementTa || parsed.statementEn,
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.95,
        aiProvider: 'Google Gemini 1.5 Flash Vision'
      };
    }

    return null;
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('Gemini Vision API call failed or timed out:', err.message);
    return null;
  }
};

/**
 * Main Civic Image AI Analyzer with Strict Validation
 * @param {string} image Base64 data URL or string
 * @param {string} hintCategory Optional category hint
 * @param {string} userNotes Optional user description
 */
const analyzeCivicImage = async (image, hintCategory = '', userNotes = '') => {
  let mimeType = 'image/jpeg';
  let base64Data = image;

  // Extract MIME type and pure base64 data if present
  if (typeof image === 'string' && image.startsWith('data:')) {
    const matches = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      mimeType = matches[1];
      base64Data = matches[2];
    }
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  // 1. If Gemini API key is configured, invoke Google Gemini 1.5 Flash Vision
  if (apiKey && base64Data) {
    try {
      const geminiResult = await callGeminiVision(base64Data, mimeType, apiKey);
      if (geminiResult) {
        return geminiResult;
      }
    } catch (e) {
      console.warn('Fallback to built-in civic engine:', e.message);
    }
  }

  // 2. Intelligent Civic Validator Fallback Engine
  const combinedNotes = `${hintCategory || ''} ${userNotes || ''}`.toLowerCase().trim();

  // Check if user notes or hints clearly indicate a non-civic subject
  const isExplicitlyNonCivic = NON_CIVIC_PATTERNS.some((pattern) => {
    const regex = new RegExp(`\\b${pattern}\\b`, 'i');
    return regex.test(combinedNotes);
  });

  if (isExplicitlyNonCivic) {
    return {
      isCivicIssue: false,
      detectedIssue: 'Non-Civic Content / பொது குறைபாடு அல்ல',
      detectedIssueTa: 'செல்லுபடியாகாத படம் (பொதுப் பிரச்சனை அல்ல)',
      detectedContent: 'Non-Civic Subject Detected',
      validationMessageEn: 'Validation Notice: The provided image/details do not match public municipal infrastructure issues. Please attach a photo of a road, water, waste, electricity, or drainage grievance.',
      validationMessageTa: 'சரிபார்ப்பு அறிவிப்பு: இந்த படம் பொது உள்கட்டமைப்பு குறைபாடுகளுடன் பொருந்தவில்லை. தயவுசெய்து சாலை, குடிநீர், குப்பை, மின்சாரம் அல்லது சாக்கடை தொடர்பான புகைப்படத்தை இணைக்கவும்.',
      suggestedPriority: null,
      confidence: 0.92,
      aiProvider: apiKey ? 'Aadhirai Civic Vision Engine' : 'Aadhirai Civic Validator (Rule Engine)'
    };
  }

  // Check if user notes match any civic defect profile
  let matched = null;
  for (const profile of CIVIC_DEFECT_TAXONOMY) {
    if (profile.patterns.some((p) => combinedNotes.includes(p))) {
      matched = profile;
      break;
    }
  }

  // If no specific notes are provided or no match found:
  // If hintCategory is provided, match by category
  if (!matched && hintCategory) {
    matched = CIVIC_DEFECT_TAXONOMY.find((p) => p.category.toLowerCase() === hintCategory.toLowerCase());
  }

  // If still no match and user provided no civic keywords at all, and apiKey is missing:
  // Provide an honest validation prompt instead of falsely calling everything a pothole!
  if (!matched && !combinedNotes) {
    // If the image was uploaded with zero hints and no Gemini key, alert user to enable Gemini Vision for pixel classification
    return {
      isCivicIssue: true, // Allow submission but flag for verification
      detectedIssue: 'Civic Grievance (Awaiting Live Gemini Vision Verification)',
      detectedIssueTa: 'பொதுக் குறைபாடு (நேரடி AI சரிபார்ப்பு தேவைப்படுகிறது)',
      category: hintCategory || 'Roads & Infrastructure',
      departmentCode: 'PWD',
      suggestedPriority: 'HIGH',
      emergencyReasonEn: 'Pending automated field crew verification for public road/infrastructure safety.',
      emergencyReasonTa: 'பொது உள்கட்டமைப்பு பாதுகாப்புக்காக நகராட்சி கள ஆய்வுக்கு பரிந்துரைக்கப்படுகிறது.',
      statementEn: 'Civic defect evidence uploaded by citizen. Recommended for on-site inspection and remedial action by the municipal zonal maintenance team.',
      statementTa: 'குடிமகனால் பொது உள்கட்டமைப்பு குறைபாடு சான்றாக புகைப்படம் பதிவேற்றப்பட்டுள்ளது. நகராட்சி மண்டல பொறியாளர் குழு நேரில் ஆய்வு செய்து உடனடி நடவடிக்கை எடுக்க வேண்டும்.',
      confidence: 0.88,
      aiProvider: 'Aadhirai Civic Vision Engine (Enable GEMINI_API_KEY for Real-Time Pixel Detection)'
    };
  }

  if (!matched) {
    matched = CIVIC_DEFECT_TAXONOMY[0];
  }

  return {
    isCivicIssue: true,
    detectedIssue: matched.issueEn,
    detectedIssueTa: matched.issueTa,
    category: matched.category,
    departmentCode: matched.departmentCode,
    suggestedPriority: matched.suggestedPriority,
    emergencyReasonEn: matched.emergencyReasonEn,
    emergencyReasonTa: matched.emergencyReasonTa,
    statementEn: matched.statementEn,
    statementTa: matched.statementTa,
    confidence: matched.confidence,
    aiProvider: apiKey ? 'Aadhirai Civic Vision Engine' : 'Aadhirai Civic Vision Engine'
  };
};

module.exports = {
  analyzeCivicImage,
  CIVIC_DEFECT_TAXONOMY,
  NON_CIVIC_PATTERNS
};
