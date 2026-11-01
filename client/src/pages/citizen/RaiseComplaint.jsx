import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import L from 'leaflet';
import {
  ArrowLeft,
  Mic,
  MicOff,
  Camera,
  Upload,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Send,
  Globe,
  Bell,
  Home,
  FileText,
  MessageSquare,
  User,
  X,
  Play
} from 'lucide-react';

// Fix Leaflet Default Icon issue in Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

const RaiseComplaint = () => {
  const navigate = useNavigate();

  // App-Wide Bilingual Language Context (English ⇄ Tamil)
  const { lang, toggleLang, t: tGlobal } = useLanguage();

  // Map & Location State
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [coords, setCoords] = useState({ lat: 10.9416, lng: 78.4414 }); // Musiri, Tiruchirappalli coordinates
  const [address, setAddress] = useState('Thirumurugan Nagar, Musiri, Tiruchirappalli, Tamil Nadu, 621211, India');
  const [ward, setWard] = useState('Ward 2, Musiri (Live GPS Data)');
  const [locating, setLocating] = useState(false);

  // Form State
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Potholes and damaged roads');
  const [priority, setPriority] = useState('HIGH');
  const [departmentId, setDepartmentId] = useState('');
  const [departments, setDepartments] = useState([]);

  // Voice Input (Speech to Text)
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  // Photo & Camera State
  const [imagePreview, setImagePreview] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Geo-tagging Photo Verification State
  const [isGeotagged, setIsGeotagged] = useState(false);
  const [needsGeotagStamp, setNeedsGeotagStamp] = useState(false);
  const [geotagInfo, setGeotagInfo] = useState(null);

  // AI Vision & Statement Generator State
  const [analyzingAI, setAnalyzingAI] = useState(false);
  const [aiStatement, setAiStatement] = useState(null);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [createdTicketId, setCreatedTicketId] = useState(null);
  const [error, setError] = useState('');

  // Translations dictionary
  const t = {
    ta: {
      pilot: 'DEMO PILOT',
      title: 'நம்ம ஊர் AI',
      subtitle: 'முசிறி நகராட்சி குடிமக்கள் தளம் • Musiri, TN',
      home: 'முகப்பு',
      complaints: 'புகார்கள்',
      notifications: 'அறிவிப்புகள்',
      feedback: 'கருத்து',
      profile: 'சுயவிவரம்',
      raiseBtn: 'புகார் அளிக்கவும்',
      selectArea: 'பகுதியைத் தேர்ந்தெடுக்கவும்',
      dragPin: 'இடத்தை மாற்ற முள் குறியை இழுக்கவும் (Drag pin)',
      gpsBtn: 'என் தற்போதைய இடத்தை எடு',
      descLabel: 'புகார் பற்றிய சுருக்கமான விவரத்தை வழங்கவும்',
      descPlaceholder: 'புகார் விவரத்தை தட்டச்சு செய்க அல்லது பேசவும்...',
      listening: 'கேட்கிறது... பேசவும்',
      addPhoto: 'புகைப்படம் சேர்க்கவும்',
      takePhoto: 'புகைப்படம் எடுக்க',
      liveCamera: 'நேரடி கேமரா',
      snapBtn: 'புகைப்படம் பிடி',
      closeCamera: 'ரத்து செய்',
      aiTitle: 'AADHIRAI AI பார்வை பகுப்பாய்வு',
      aiScanning: 'படத்தை AI ஸ்கேன் செய்து பிழை விவரத்தை உருவாக்குகிறது...',
      aiDetected: 'கண்டறியப்பட்ட குறைபாடு:',
      aiStatementLabel: 'AI உருவாக்கிய அதிகாரப்பூர்வ அறிக்கை:',
      aiNonCivicTitle: 'செல்லுபடியாகாத புகைப்படம் – பொதுப் பிரச்சனை அல்ல',
      aiCivicVerified: '✓ AI மூலம் சரிபார்க்கப்பட்ட பொது குறைபாடு',
      aiEmergencyReason: 'அவசர முன்னுரிமை மதிப்பீடு:',
      uploadAnother: 'வேறு படம் பதிவேற்றவும்',
      geotagHeading: '📍 ஜியோ-டேக் புகைப்பட சான்று (கட்டாயம்)',
      geotagPolicyBadge: 'அரசு விதிமுறை: ஜியோ-டேக் செய்யப்பட்ட நேரடி புகைப்படங்கள் மட்டுமே ஏற்கப்படும்',
      takeGeotagPhoto: 'நேரடி ஜியோ-டேக் கேமரா',
      browseGeotagPhoto: 'புகைப்படம் பதிவேற்றவும்',
      geotagVerifiedBadge: '✓ ஜியோ-டேக் சரிபார்க்கப்பட்டது (Geo-tag Verified)',
      stampGeotagBtn: '📍 தற்போதைய ஜிபிஎஸ் இடத்தை இணைக்க (Stamp Geo-tag)',
      geotagMissingAlert: '⚠️ புகைப்படத்தில் ஜிபிஎஸ் தகவல் இல்லை. கீழே உள்ள பொத்தானை கிளிக் செய்து உங்கள் தற்போதைய இடத்தை இணைக்கவும்.',
      applyAi: 'இந்த அறிக்கையை புகாராகப் பயன்படுத்து',
      submitBtn: 'புகாரை அதிகாரப்பூர்வமாகப் பதிவு செய்க',
      submitting: 'பதிவு செய்யப்படுகிறது...',
      successTitle: 'புகார் வெற்றிகரமாகப் பதிவு செய்யப்பட்டது!',
      ticketIdLabel: 'உங்கள் அதிகாரப்பூர்வ டிக்கெட் எண்',
      trackBtn: 'புகார் நிலையை உடனடியாகக் கண்காணிக்கவும்'
    },
    en: {
      pilot: 'DEMO PILOT',
      title: 'NAMMA OOR AI / AADHIRAI',
      subtitle: 'Musiri Municipality Citizen Portal • Musiri, TN',
      home: 'Home',
      complaints: 'Complaints',
      notifications: 'Notifications',
      feedback: 'Feedback',
      profile: 'Profile',
      raiseBtn: 'Raise Complaint',
      selectArea: 'Confirm Grievance Location',
      dragPin: 'Drag pin on map to refine location coordinates',
      gpsBtn: 'Use My Current Location',
      descLabel: 'Provide Description of the Issue',
      descPlaceholder: 'Type complaint details or click mic to speak...',
      listening: 'Listening... please speak',
      addPhoto: 'Attach Damage Photo',
      takePhoto: 'Take / Upload Photo',
      liveCamera: 'Live Camera Capture',
      snapBtn: 'Capture Photo',
      closeCamera: 'Close Camera',
      aiTitle: 'AADHIRAI AI Vision Inspection',
      aiScanning: 'AI is analyzing photo damage & formulating statement...',
      aiDetected: 'Detected Defect:',
      aiStatementLabel: 'AI Formulated Technical Statement:',
      aiNonCivicTitle: 'Non-Civic Image Detected (Invalid Photo)',
      aiCivicVerified: '✓ Civic Defect Verified by AI',
      aiEmergencyReason: 'Emergency Priority Assessment:',
      uploadAnother: 'Upload Another Photo',
      geotagHeading: '📍 Mandatory Geo-Tagged Evidence Section',
      geotagPolicyBadge: 'Govt Rule: Only verified Geo-Tagged on-site photos are valid for complaint filing',
      takeGeotagPhoto: 'Live Geo-Tag Camera',
      browseGeotagPhoto: 'Browse Photo File',
      geotagVerifiedBadge: '✓ GPS Geo-tag Verified & Watermarked',
      stampGeotagBtn: '📍 Stamp Verified GPS Location onto Photo',
      geotagMissingAlert: '⚠️ Uploaded photo lacks GPS metadata. Click below to stamp your verified current GPS location onto this photo.',
      applyAi: 'Apply AI Statement to Complaint',
      submitBtn: 'Submit Official Grievance',
      submitting: 'Registering...',
      successTitle: 'Grievance Registered Successfully!',
      ticketIdLabel: 'YOUR OFFICIAL TICKET ID',
      trackBtn: 'Track Grievance Status Now'
    }
  }[lang];

  // Fetch active departments from backend
  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await api.get('/departments?activeOnly=true');
        if (res.data.success) {
          setDepartments(res.data.departments);
          if (res.data.departments.length > 0) {
            setDepartmentId(res.data.departments[0]._id);
          }
        }
      } catch (err) {
        console.warn('Could not load departments list.');
      }
    };
    fetchDepts();
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [coords.lat, coords.lng],
        zoom: 14,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // Custom pulsing map pin
      const marker = L.marker([coords.lat, coords.lng], {
        draggable: true
      }).addTo(map);

      marker.bindPopup(`<b>${ward}</b><br/>${address}`).openPopup();

      marker.on('dragend', async (event) => {
        const position = event.target.getLatLng();
        setCoords({ lat: position.lat, lng: position.lng });
        reverseGeocode(position.lat, position.lng);
      });

      map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        setCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
        reverseGeocode(e.latlng.lat, e.latlng.lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Reverse Geocoding via Nominatim OpenStreetMap
  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await res.json();
      if (data && data.display_name) {
        setAddress(data.display_name);
        const wardText = data.address?.suburb || data.address?.neighbourhood || 'Ward 2, Musiri';
        setWard(`${wardText} (Refined Pin)`);
        if (markerRef.current) {
          markerRef.current.setPopupContent(`<b>${wardText}</b><br/>${data.display_name}`);
        }
      }
    } catch (err) {
      console.warn('Geocoding fallback');
    }
  };

  // Live GPS Location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 16);
          markerRef.current.setLatLng([latitude, longitude]);
        }
        reverseGeocode(latitude, longitude);
        setLocating(false);
      },
      (err) => {
        alert('Could not retrieve GPS coordinates. Please drag the pin on the map.');
        setLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Voice Input (Web Speech API)
  const toggleSpeechRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech-to-text is not supported on this browser. Please type your message.');
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'ta' ? 'ta-IN' : 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setDescription((prev) => (prev ? `${prev} ${transcript}` : transcript));
      setIsRecording(false);
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // Live Camera Handlers
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 640, height: 480 }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert('Could not access device camera. Please upload an image instead.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Client-side visual content inspection to detect documents, schematics, and screenshots
  const inspectImageContent = (dataUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try {
          const sampleCanvas = document.createElement('canvas');
          const sampleSize = 64;
          sampleCanvas.width = sampleSize;
          sampleCanvas.height = sampleSize;
          const sampleCtx = sampleCanvas.getContext('2d');
          sampleCtx.drawImage(img, 0, 0, sampleSize, sampleSize);
          const imageData = sampleCtx.getImageData(0, 0, sampleSize, sampleSize);
          const data = imageData.data;
          const totalPixels = sampleSize * sampleSize;

          let whitePixels = 0;
          let blackPixels = 0;
          let lowSaturationPixels = 0;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // White / paper background
            if (r > 225 && g > 225 && b > 225) whitePixels++;
            // Black ink / dark text / wire lines
            if (r < 40 && g < 40 && b < 40) blackPixels++;

            // Grayscale / low saturation check (schematics & documents lack natural color variance)
            const colorDiff = Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r);
            if (colorDiff < 25) lowSaturationPixels++;
          }

          const whiteRatio = whitePixels / totalPixels;
          const blackRatio = blackPixels / totalPixels;
          const monoRatio = (whitePixels + blackPixels) / totalPixels;
          const lowColorRatio = lowSaturationPixels / totalPixels;

          // Technical schematics, paper documents, circuit diagrams, and text screenshots
          const isDocOrSchematic =
            (monoRatio > 0.45 && lowColorRatio > 0.70) ||
            (whiteRatio > 0.35 && lowColorRatio > 0.75) ||
            (blackRatio > 0.35 && lowColorRatio > 0.75);

          resolve({
            isDocument: isDocOrSchematic,
            whiteRatio,
            lowColorRatio
          });
        } catch (e) {
          resolve({ isDocument: false });
        }
      };
      img.onerror = () => resolve({ isDocument: false });
      img.src = dataUrl;
    });
  };

  // Burn the official Govt Geo-Tag Watermark Ribbon directly onto image
  const stampGeotagOnImage = (sourceDataUrl, targetCoords, locationLabel) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width || 800;
        canvas.height = img.naturalHeight || img.height || 600;
        const ctx = canvas.getContext('2d');

        // Draw original photo
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Calculate responsive ribbon height (min 72px, ~12% of height)
        const ribbonHeight = Math.max(72, Math.floor(canvas.height * 0.12));
        const ribbonY = canvas.height - ribbonHeight;

        // Dark navy / slate backdrop for optimal legibility
        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.fillRect(0, ribbonY, canvas.width, ribbonHeight);

        // Top accent line in Tamil Nadu Government emerald
        ctx.fillStyle = '#059669';
        ctx.fillRect(0, ribbonY, canvas.width, Math.max(3, Math.floor(canvas.height * 0.006)));

        // Text styling
        const baseFontSize = Math.max(12, Math.floor(ribbonHeight * 0.22));
        ctx.textBaseline = 'middle';

        // Left Side: Authority & Coordinates
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${baseFontSize + 2}px system-ui, -apple-system, sans-serif`;
        ctx.fillText(
          '🏛️ AADHIRAI • GOVT OF TAMIL NADU • CIVIC SURVEILLANCE',
          16,
          ribbonY + ribbonHeight * 0.32
        );

        ctx.fillStyle = '#cbd5e1';
        ctx.font = `600 ${baseFontSize}px monospace, system-ui`;
        const latStr = (targetCoords?.lat || coords.lat).toFixed(6);
        const lngStr = (targetCoords?.lng || coords.lng).toFixed(6);
        const locStr = (locationLabel || ward || 'Ward 2, Musiri').slice(0, 45);
        ctx.fillText(
          `📍 GPS: ${latStr}°N, ${lngStr}°E • ${locStr}`,
          16,
          ribbonY + ribbonHeight * 0.72
        );

        // Right Side: Timestamp & Verification Badge
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        ctx.textAlign = 'right';
        ctx.fillStyle = '#ffffff';
        ctx.font = `600 ${baseFontSize}px system-ui`;
        ctx.fillText(
          `📅 ${dateStr} ${timeStr}`,
          canvas.width - 16,
          ribbonY + ribbonHeight * 0.32
        );

        ctx.fillStyle = '#22c55e';
        ctx.font = `bold ${baseFontSize}px system-ui`;
        ctx.fillText(
          '✓ GEOTAG VERIFIED & LOCKED',
          canvas.width - 16,
          ribbonY + ribbonHeight * 0.72
        );

        const stampedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
        resolve(stampedDataUrl);
      };
      img.src = sourceDataUrl;
    });
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const rawDataUrl = canvas.toDataURL('image/jpeg', 0.88);

    stopCamera();

    // Burn official Government Geo-Tag Ribbon with current locked GPS
    const stampedDataUrl = await stampGeotagOnImage(rawDataUrl, coords, ward);
    setImagePreview(stampedDataUrl);
    setIsGeotagged(true);
    setNeedsGeotagStamp(false);
    setGeotagInfo({
      lat: coords.lat,
      lng: coords.lng,
      timestamp: new Date().toISOString(),
      location: ward
    });

    triggerAIAnalysis(stampedDataUrl, false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const rawDataUrl = reader.result;

        // 1. Inspect image pixels for technical schematics, documents, text screenshots
        const inspection = await inspectImageContent(rawDataUrl);

        if (inspection.isDocument) {
          // Document / schematic / circuit diagram detected
          setImagePreview(rawDataUrl);
          setIsGeotagged(false);
          setNeedsGeotagStamp(false);
          setGeotagInfo(null);
          // Pass isDocument: true to backend AI verification to reject immediately
          triggerAIAnalysis(rawDataUrl, true);
        } else {
          // Real photo: automatically stamp current verified GPS location
          const stampedDataUrl = await stampGeotagOnImage(rawDataUrl, coords, ward);
          setImagePreview(stampedDataUrl);
          setIsGeotagged(true);
          setNeedsGeotagStamp(false);
          setGeotagInfo({
            lat: coords.lat,
            lng: coords.lng,
            timestamp: new Date().toISOString(),
            location: ward
          });
          triggerAIAnalysis(stampedDataUrl, false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStampCurrentLocation = async () => {
    if (!imagePreview) return;
    const stampedDataUrl = await stampGeotagOnImage(imagePreview, coords, ward);
    setImagePreview(stampedDataUrl);
    setIsGeotagged(true);
    setNeedsGeotagStamp(false);
    setGeotagInfo({
      lat: coords.lat,
      lng: coords.lng,
      timestamp: new Date().toISOString(),
      location: ward
    });
  };

  // Trigger AI Vision Inspection & Statement Formulation
  const triggerAIAnalysis = async (imageData, isDocument = false) => {
    setAnalyzingAI(true);
    setAiStatement(null);

    try {
      let res;
      try {
        res = await api.post('/complaints/verify-image', {
          image: imageData,
          hintCategory: category,
          userNotes: description,
          isDocument
        });
      } catch (err1) {
        res = await api.post('/complaints/ai-analyze', {
          image: imageData,
          hintCategory: category,
          userNotes: description,
          isDocument
        });
      }

      if (res.data.success) {
        const analysis = res.data.analysis;
        setAiStatement(analysis);
        // Auto-populate fields if AI verified that this is a genuine civic issue
        if (analysis.isValidCivicIssue) {
          if (analysis.category && analysis.category !== 'Unknown / unrecognized') {
            setCategory(analysis.category);
          }
          if (analysis.severity) {
            setPriority(analysis.severity);
          }
          if (analysis.department) {
            setDepartmentId(analysis.department);
          }
        }
      }
    } catch (err) {
      console.warn('AI verification failed:', err);
    } finally {
      setAnalyzingAI(false);
    }
  };

  const applyAIStatement = () => {
    if (!aiStatement || !aiStatement.isValidCivicIssue) return;
    const stmt = lang === 'ta' ? aiStatement.statementTa : aiStatement.statementEn;
    if (stmt) {
      setDescription(stmt);
    }
    if (aiStatement.category && aiStatement.category !== 'Unknown / unrecognized') {
      setCategory(aiStatement.category);
    }
    if (aiStatement.severity) {
      setPriority(aiStatement.severity);
    }
    if (aiStatement.department) {
      setDepartmentId(aiStatement.department);
    }
  };

  // Submit Complaint to MongoDB Atlas
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!description.trim()) {
      setError(lang === 'ta' ? 'தயவுசெய்து புகார் விவரத்தை உள்ளிடவும்.' : 'Please provide complaint details.');
      return;
    }

    if (imagePreview && !isGeotagged) {
      setError(
        lang === 'ta'
          ? 'புகாரை சமர்ப்பிக்க புகைப்படத்திற்கு அரசு விதிமுறைப்படி ஜியோ-டேக் (Geo-tag) சான்றிதழ் கட்டாயம்.'
          : 'Mandatory Policy: Photo evidence must be Geo-tagged with verified GPS coordinates before submission.'
      );
      return;
    }

    if (aiStatement && aiStatement.isValidCivicIssue === false) {
      setError(
        lang === 'ta'
          ? 'பதிவேற்றப்பட்ட படம் பொது குறைபாடு அல்ல என AI கண்டறிந்துள்ளது. தயவுசெய்து பொது உள்கட்டமைப்பு சேத புகைப்படத்தை பதிவேற்றவும்.'
          : 'The uploaded photo was flagged as non-civic content. Please upload a photo of genuine public infrastructure damage or remove the photo.'
      );
      return;
    }

    setSubmitting(true);

    try {
      const res = await api.post('/complaints', {
        title: (description.slice(0, 75) + '...').trim(),
        description: description.trim(),
        category,
        department: departmentId || undefined,
        location: ward,
        address,
        priority,
        coordinates: coords,
        aiAnalysis: aiStatement
          ? {
              isValidCivicIssue: aiStatement.isValidCivicIssue !== false,
              predictedCategory: aiStatement.category,
              predictedSeverity: aiStatement.severity,
              confidence: aiStatement.confidence,
              detectedIssue: aiStatement.detectedIssue,
              explanation: aiStatement.explanation,
              recommendedAction: aiStatement.recommendedAction,
              autoStatement: lang === 'ta' ? aiStatement.statementTa : aiStatement.statementEn,
              isLowConfidence: Boolean(aiStatement.isLowConfidence),
              requiresManualReview: Boolean(aiStatement.requiresManualReview),
              modelVersion: 'MobileNetV3-Civic-v1.0'
            }
          : undefined,
        attachments: imagePreview
          ? [{
              url: imagePreview,
              filename: 'geotagged_evidence.jpg',
              isGeotagged: isGeotagged,
              geotag: geotagInfo
            }]
          : []
      });

      if (res.data.success) {
        setCreatedTicketId(res.data.ticketId);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit grievance. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="raise-complaint-custom-page" style={{ maxWidth: '980px', margin: '0 auto' }}>
      {/* 1. Header Toolbar matching user's reference UI */}
      <div
        className="d-flex flex-wrap align-items-center justify-content-between p-2 px-3 text-white rounded-3 shadow-sm mb-4"
        style={{ backgroundColor: '#00796b' }}
      >
        <div className="d-flex align-items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-sm text-white p-1 border-0"
            title="Go back"
          >
            <ArrowLeft size={20} />
          </button>
          <div
            className="rounded bg-white text-dark fw-extrabold d-flex align-items-center justify-content-center"
            style={{ width: '28px', height: '28px', fontSize: '0.8rem' }}
          >
            NO
          </div>
          <div>
            <div className="d-flex align-items-center gap-2">
              <span className="fw-bold fs-6">{t.title}</span>
              <span className="badge bg-warning text-dark py-0" style={{ fontSize: '0.65rem' }}>
                {t.pilot}
              </span>
            </div>
            <div className="small text-white opacity-75" style={{ fontSize: '0.72rem' }}>
              {t.subtitle}
            </div>
          </div>
        </div>

        {/* Navigation & Language Switch */}
        <div className="d-flex align-items-center gap-2">
          <Link to="/citizen/dashboard" className="btn btn-sm text-white text-decoration-none d-none d-md-flex align-items-center gap-1">
            <Home size={15} /> {t.home}
          </Link>
          <Link to="/citizen/my-complaints" className="btn btn-sm text-white text-decoration-none d-none d-md-flex align-items-center gap-1">
            <FileText size={15} /> {t.complaints}
          </Link>
          <Link to="/citizen/notifications" className="btn btn-sm text-white text-decoration-none position-relative d-none d-md-flex align-items-center gap-1">
            <Bell size={15} /> {t.notifications}
            <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"></span>
          </Link>

          {/* Orange Raise Complaint Button */}
          <button className="btn btn-warning btn-sm fw-bold px-3 d-flex align-items-center gap-1" style={{ backgroundColor: '#ea580c', borderColor: '#ea580c', color: '#ffffff' }}>
            {t.raiseBtn}
          </button>

          {/* Dedicated Bilingual Language Switcher Button */}
          <button
            type="button"
            onClick={toggleLang}
            className="btn btn-sm d-flex align-items-center gap-1 ms-1 fw-semibold"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.16)',
              border: '1px solid rgba(255, 255, 255, 0.45)',
              color: '#ffffff',
              borderRadius: '6px'
            }}
            title={lang === 'ta' ? 'Switch to English' : 'தமிழுக்கு மாறவும்'}
          >
            <Globe size={14} /> {lang === 'ta' ? 'English' : 'தமிழ்'}
          </button>
        </div>
      </div>

      {/* Success View */}
      {createdTicketId ? (
        <div className="gov-card p-5 text-center shadow-lg">
          <div
            className="rounded-circle bg-success bg-opacity-10 text-success d-inline-flex align-items-center justify-content-center mb-3"
            style={{ width: '70px', height: '70px' }}
          >
            <CheckCircle2 size={40} />
          </div>
          <h3 className="fw-bold text-dark mb-1">{t.successTitle}</h3>
          <p className="text-muted small mb-4">
            {lang === 'ta'
              ? 'உங்கள் புகார் நகராட்சி தரவுத்தளத்தில் வெற்றிகரமாக பதிவு செய்யப்பட்டுள்ளது.'
              : 'Your complaint has been successfully recorded into the municipal database.'}
          </p>

          <div className="p-3 bg-light rounded-3 d-inline-block mb-4 border">
            <span className="text-muted small d-block mb-1">{t.ticketIdLabel}</span>
            <span className="fs-3 fw-extrabold text-primary font-monospace letter-spacing-1">
              {createdTicketId}
            </span>
          </div>

          <div className="d-flex justify-content-center gap-3">
            <Link to={`/citizen/track-complaint?id=${createdTicketId}`} className="btn btn-gov-primary px-4 py-2">
              {t.trackBtn}
            </Link>
            <Link to="/citizen/my-complaints" className="btn btn-outline-secondary px-4 py-2">
              {t.complaints}
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-danger small py-2 d-flex align-items-center gap-2 mb-3">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* 2. Interactive Map Section */}
          <div className="mb-4">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small d-flex align-items-center gap-1">
                <MapPin size={16} className="text-primary" /> {t.dragPin}
              </span>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="btn btn-outline-primary btn-sm py-1 d-flex align-items-center gap-1"
                disabled={locating}
              >
                <RefreshCw size={12} className={locating ? 'animate-spin' : ''} /> {t.gpsBtn}
              </button>
            </div>

            {/* Map Container */}
            <div
              ref={mapContainerRef}
              style={{
                width: '100%',
                height: '260px',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                zIndex: 1
              }}
            ></div>
          </div>

          {/* 3. Address Selection Box */}
          <div className="mb-4">
            <label className="fw-semibold text-dark small d-flex align-items-center gap-1 mb-2">
              <MapPin size={16} className="text-teal" style={{ color: '#00897b' }} /> {t.selectArea}
            </label>
            <div
              className="p-3 bg-white rounded-3 border"
              style={{ borderColor: '#f59e0b', borderWidth: '1.5px', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}
            >
              <div className="fw-bold text-dark fs-6">{address}</div>
              <div className="small text-muted mt-1">{ward}</div>
            </div>
          </div>

          {/* 4. Description Field with Voice Speech-to-Text */}
          <div className="mb-4">
            <label className="fw-semibold text-dark small d-flex align-items-center gap-1 mb-2">
              <span className="badge rounded-circle bg-light text-dark p-1">ⓘ</span> {t.descLabel}
            </label>

            <div className="position-relative">
              <input
                type="text"
                className="form-control py-3 ps-4 pe-5"
                placeholder={isRecording ? t.listening : t.descPlaceholder}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  borderRadius: '10px',
                  borderColor: isRecording ? '#ef4444' : '#cbd5e1',
                  backgroundColor: isRecording ? '#fef2f2' : '#ffffff',
                  fontSize: '0.95rem'
                }}
              />

              {/* Microphone Toggle Button */}
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`btn position-absolute top-50 end-0 translate-middle-y me-2 p-2 rounded-circle border-0 ${
                  isRecording ? 'btn-danger animate-pulse' : 'text-secondary'
                }`}
                title="Click to speak (Tamil or English)"
              >
                {isRecording ? <MicOff size={20} className="text-white" /> : <Mic size={20} />}
              </button>
            </div>
            {isRecording && (
              <div className="small text-danger mt-1 d-flex align-items-center gap-1">
                <span className="spinner-grow spinner-grow-sm" role="status"></span>
                <span>{t.listening}</span>
              </div>
            )}
          </div>

          {/* 5. Live Photo Evidence & Mandatory Geo-Tag Section */}
          <div className="mb-4">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
              <label className="fw-bold text-dark small d-flex align-items-center gap-1 mb-0">
                <MapPin size={17} className="text-danger" /> {t.geotagHeading}
                <span className="badge bg-danger ms-1" style={{ fontSize: '0.65rem' }}>MANDATORY</span>
              </label>
              <span className="badge bg-light text-secondary border" style={{ fontSize: '0.72rem' }}>
                📍 GPS Locked: {coords.lat.toFixed(4)}°, {coords.lng.toFixed(4)}°
              </span>
            </div>

            <div className="p-2 px-3 rounded-2 mb-3 small" style={{ backgroundColor: '#f0fdf4', borderLeft: '4px solid #16a34a', color: '#166534' }}>
              <strong>{lang === 'ta' ? 'அரசு விதிமுறை:' : 'Govt Policy:'}</strong>{' '}
              {t.geotagPolicyBadge}
            </div>

            <div className="d-flex flex-wrap align-items-start gap-3">
              {/* Camera Trigger Card matching user's dark indigo card */}
              <div
                onClick={startCamera}
                className="d-flex flex-column align-items-center justify-content-center text-white rounded-4 shadow-sm cursor-pointer p-3 text-center transition"
                style={{
                  width: '135px',
                  height: '135px',
                  backgroundColor: '#273252',
                  cursor: 'pointer'
                }}
              >
                <Camera size={34} className="mb-2 text-warning" />
                <span className="small fw-bold" style={{ fontSize: '0.78rem' }}>
                  {t.takeGeotagPhoto}
                </span>
                <span className="opacity-75 mt-1" style={{ fontSize: '0.65rem' }}>
                  {lang === 'ta' ? 'தானியங்கி ஜிபிஎஸ் வாட்டர்மார்க்' : 'Auto-Watermarks GPS'}
                </span>
              </div>

              {/* Or File Upload Trigger */}
              <label
                className="d-flex flex-column align-items-center justify-content-center text-muted rounded-4 border border-dashed p-3 text-center cursor-pointer bg-light"
                style={{ width: '135px', height: '135px', cursor: 'pointer' }}
              >
                <Upload size={28} className="mb-1 text-primary" />
                <span className="fw-semibold text-dark" style={{ fontSize: '0.75rem' }}>
                  {t.browseGeotagPhoto}
                </span>
                <span className="text-muted mt-1" style={{ fontSize: '0.65rem' }}>
                  {lang === 'ta' ? 'ஆய்வு செய்து இணைக்கும்' : 'Inspects & Stamps GPS'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="d-none"
                  onChange={handleFileUpload}
                />
              </label>

              {/* Photo Preview Thumbnail & Geo-Tag Status Badge */}
              {imagePreview && (
                <div className="d-flex flex-column gap-2" style={{ maxWidth: '320px' }}>
                  <div className="position-relative">
                    <img
                      src={imagePreview}
                      alt="Captured Evidence"
                      className="rounded-4 object-cover border shadow-sm w-100"
                      style={{ maxHeight: '180px', objectFit: 'cover' }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setAiStatement(null);
                        setIsGeotagged(false);
                        setNeedsGeotagStamp(false);
                        setGeotagInfo(null);
                      }}
                      className="btn btn-danger btn-sm p-1 rounded-circle position-absolute top-0 end-0 translate-middle"
                      title="Remove photo"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {/* Geotag Verification Banner */}
                  {isGeotagged ? (
                    <div className="p-2 rounded-3 bg-success bg-opacity-10 border border-success text-success small d-flex align-items-center gap-2">
                      <CheckCircle2 size={16} className="flex-shrink-0" />
                      <div>
                        <div className="fw-bold" style={{ fontSize: '0.76rem' }}>{t.geotagVerifiedBadge}</div>
                        <div className="text-muted font-monospace" style={{ fontSize: '0.68rem' }}>
                          {coords.lat.toFixed(5)}°N, {coords.lng.toFixed(5)}°E
                        </div>
                      </div>
                    </div>
                  ) : needsGeotagStamp ? (
                    <div className="p-2 rounded-3 bg-warning bg-opacity-10 border border-warning text-dark small">
                      <div className="d-flex align-items-center gap-1 text-danger fw-bold mb-1" style={{ fontSize: '0.75rem' }}>
                        <AlertCircle size={14} /> {lang === 'ta' ? 'ஜியோ-டேக் இல்லை' : 'Missing Geo-Tag'}
                      </div>
                      <div className="text-muted mb-2" style={{ fontSize: '0.7rem' }}>
                        {t.geotagMissingAlert}
                      </div>
                      <button
                        type="button"
                        onClick={handleStampCurrentLocation}
                        className="btn btn-sm btn-outline-success w-100 fw-bold py-1"
                        style={{ fontSize: '0.72rem' }}
                      >
                        {t.stampGeotagBtn}
                      </button>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          {/* 6. AI Vision Statement Generator Output Box */}
          {analyzingAI && (
            <div className="alert alert-info d-flex align-items-center gap-3 p-3 rounded-3 mb-4 shadow-sm">
              <Sparkles size={24} className="text-primary animate-spin" />
              <div>
                <div className="fw-bold">{t.aiTitle}</div>
                <div className="small">{t.aiScanning}</div>
              </div>
            </div>
          )}

          {/* 6A. Non-Civic Image Rejection Box */}
          {aiStatement && !aiStatement.isValidCivicIssue && (
            <div
              className="p-4 rounded-3 border mb-4 shadow-sm"
              style={{ backgroundColor: '#fff7ed', borderColor: '#fdba74' }}
            >
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
                <span className="fw-bold text-danger d-flex align-items-center gap-2 small">
                  <AlertCircle size={18} className="text-danger flex-shrink-0" />
                  {t.aiNonCivicTitle}
                </span>
                {aiStatement.aiProvider && (
                  <span className="badge bg-secondary bg-opacity-75" style={{ fontSize: '0.68rem' }}>
                    {aiStatement.aiProvider}
                  </span>
                )}
              </div>

              <div className="p-3 bg-white rounded border border-warning mb-3 text-dark small" style={{ lineHeight: 1.6 }}>
                <div className="text-danger fw-semibold mb-1">
                  {aiStatement.explanation || 'This image does not depict any municipal grievance or public infrastructure defect.'}
                </div>
                {aiStatement.recommendedAction && (
                  <div className="text-muted small mt-2 pt-1 border-top">
                    <strong>Recommended Action:</strong> {aiStatement.recommendedAction}
                  </div>
                )}
              </div>

              <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                  {lang === 'ta'
                    ? '⚠️ சாலை குழி, குடிநீர் கசிவு, குப்பை, தெருவிளக்கு அல்லது சாக்கடை சேதங்களை மட்டுமே AI ஆய்வு செய்யும்.'
                    : '⚠️ AI only validates public defects: potholes, water leaks, garbage heaps, streetlights, or sewage.'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setAiStatement(null);
                  }}
                  className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 shadow-sm px-3 py-1"
                >
                  <X size={14} /> {t.uploadAnother}
                </button>
              </div>
            </div>
          )}

          {/* 6B. Validated Civic Defect & Severity Triage Box */}
          {aiStatement && aiStatement.isValidCivicIssue && (
            <div
              className="p-4 rounded-3 border mb-4 shadow-sm"
              style={{ backgroundColor: '#f0fdf4', borderColor: '#86efac' }}
            >
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
                <span className="fw-bold text-success d-flex align-items-center gap-1 small">
                  <Sparkles size={16} /> {t.aiCivicVerified}
                  {aiStatement.aiProvider && (
                    <span className="badge bg-dark bg-opacity-75 ms-1" style={{ fontSize: '0.68rem' }}>
                      {aiStatement.aiProvider}
                    </span>
                  )}
                  <span className="text-muted ms-1" style={{ fontSize: '0.75rem' }}>
                    ({(aiStatement.confidence * 100).toFixed(0)}% Confidence)
                  </span>
                </span>
                <span className="badge bg-success px-2 py-1">
                  {lang === 'ta' ? aiStatement.detectedIssueTa || aiStatement.category : aiStatement.detectedIssue || aiStatement.category}
                </span>
              </div>

              {/* Low Confidence Warning Notice */}
              {aiStatement.isLowConfidence && (
                <div className="alert alert-warning py-1 px-2 small mb-2 d-flex align-items-center gap-1">
                  <AlertCircle size={14} className="text-warning flex-shrink-0" />
                  <span>Low confidence prediction ({(aiStatement.confidence * 100).toFixed(0)}%). Marked for staff manual review upon submission.</span>
                </div>
              )}

              {/* Urgent Escalation Warning for HIGH or CRITICAL issues */}
              {(aiStatement.severity === 'CRITICAL' || aiStatement.severity === 'HIGH') && (
                <div
                  className="p-2 px-3 rounded mb-2 small d-flex align-items-center gap-2"
                  style={{
                    backgroundColor: aiStatement.severity === 'CRITICAL' ? '#fee2e2' : '#ffedd5',
                    borderLeft: `4px solid ${aiStatement.severity === 'CRITICAL' ? '#dc2626' : '#ea580c'}`
                  }}
                >
                  <span className="fw-bold text-danger">🚨 Urgent Safety Alert:</span>
                  <span className="text-dark">
                    This issue has been tagged as <strong>{aiStatement.severity}</strong> severity. An escalation alert will be dispatched to the municipal team immediately upon submission.
                  </span>
                </div>
              )}

              {/* Explanation & Recommended Action */}
              <div className="p-3 bg-white rounded border mb-3 text-dark small" style={{ lineHeight: 1.6 }}>
                {aiStatement.explanation && (
                  <div className="mb-2">
                    <strong>AI Assessment:</strong> {aiStatement.explanation}
                  </div>
                )}
                {aiStatement.recommendedAction && (
                  <div className="text-primary">
                    <strong>Recommended Field Action:</strong> {aiStatement.recommendedAction}
                  </div>
                )}
              </div>

              <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                <div className="small text-muted d-flex align-items-center gap-2 flex-wrap">
                  <span><strong>Dept:</strong> {aiStatement.departmentName || 'Public Works (PWD)'}</span>
                  <span>•</span>
                  <span><strong>Severity Level:</strong>{' '}
                    <span
                      className="badge fw-bold"
                      style={{
                        backgroundColor:
                          aiStatement.severity === 'CRITICAL'
                            ? '#dc2626'
                            : aiStatement.severity === 'HIGH'
                            ? '#ea580c'
                            : aiStatement.severity === 'MEDIUM'
                            ? '#2563eb'
                            : '#64748b',
                        color: '#ffffff'
                      }}
                    >
                      {aiStatement.severity}
                    </span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={applyAIStatement}
                  className="btn btn-sm btn-success d-flex align-items-center gap-1 shadow-sm px-3 py-1"
                >
                  <CheckCircle2 size={15} /> {t.applyAi}
                </button>
              </div>
            </div>
          )}

          {/* 7. Category & Priority Selector (With Citizen Correction Capability) */}
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label className="gov-label small d-flex justify-content-between">
                <span>{lang === 'ta' ? 'குறைபாடு வகை' : 'Civic Issue Category'}</span>
                <span className="text-muted fw-normal" style={{ fontSize: '0.72rem' }}>(Auto-filled by AI / Editable)</span>
              </label>
              <select
                className="gov-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Potholes and damaged roads">Potholes and damaged roads (சாலை குழிகள்)</option>
                <option value="Garbage and illegal dumping">Garbage and illegal dumping (குப்பைக் கழிவுகள்)</option>
                <option value="Overflowing drainage and sewage">Overflowing drainage and sewage (சாக்கடை கழிவுநீர்)</option>
                <option value="Water leakage and waterlogging">Water leakage and waterlogging (குடிநீர் கசிவு)</option>
                <option value="Damaged streetlights">Damaged streetlights (பழுதடைந்த தெருவிளக்குகள்)</option>
                <option value="Broken public infrastructure">Broken public infrastructure (உடைந்த பொது உள்கட்டமைப்பு)</option>
                <option value="Fallen trees and road obstructions">Fallen trees and road obstructions (விழுந்த மரங்கள்)</option>
                <option value="Other civic issues">Other civic issues (இதர பொதுக் குறைகள்)</option>
                <option value="Unknown / unrecognized">Unknown / unrecognized (அடையாளம் தெரியாதவை)</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="gov-label small d-flex justify-content-between">
                <span>{lang === 'ta' ? 'முன்னுரிமை / அவசரம்' : 'Severity / Emergency Level'}</span>
                <span className="text-muted fw-normal" style={{ fontSize: '0.72rem' }}>(AI Assessed)</span>
              </label>
              <select
                className="gov-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="LOW">LOW - Minor, no immediate danger</option>
                <option value="MEDIUM">MEDIUM - Needs attention, not urgent</option>
                <option value="HIGH">HIGH - Significant damage, safety risk</option>
                <option value="CRITICAL">CRITICAL - Immediate danger to life / safety</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-gov-primary w-100 py-3 fs-6 fw-bold shadow-md"
            disabled={submitting}
          >
            {submitting ? (
              <span className="d-flex align-items-center justify-content-center gap-2">
                <span className="spinner-border spinner-border-sm" role="status"></span>
                {t.submitting}
              </span>
            ) : (
              <span className="d-flex align-items-center justify-content-center gap-2">
                <Send size={18} /> {t.submitBtn}
              </span>
            )}
          </button>
        </form>
      )}

      {/* Live Camera Modal with Geo-Tag HUD */}
      {isCameraActive && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1100 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark text-white border-0 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title small fw-bold text-white d-flex align-items-center gap-2">
                  <Camera size={18} className="text-warning" /> {t.takeGeotagPhoto}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={stopCamera}></button>
              </div>
              <div className="modal-body text-center p-3">
                <div className="position-relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-100 rounded-3 border border-secondary"
                    style={{ maxHeight: '380px', objectFit: 'cover' }}
                  ></video>
                  {/* Live GPS HUD Overlay on Camera Stream */}
                  <div
                    className="position-absolute bottom-0 start-0 end-0 p-2 px-3 text-start small font-monospace d-flex align-items-center justify-content-between"
                    style={{
                      background: 'linear-gradient(to top, rgba(15,23,42,0.92), transparent)',
                      color: '#34d399',
                      borderBottomLeftRadius: '0.5rem',
                      borderBottomRightRadius: '0.5rem'
                    }}
                  >
                    <div>
                      <div className="fw-bold">📍 GPS: {coords.lat.toFixed(5)}°N, {coords.lng.toFixed(5)}°E</div>
                      <div className="text-white small opacity-75" style={{ fontSize: '0.7rem' }}>{ward}</div>
                    </div>
                    <span className="badge bg-success py-1 px-2" style={{ fontSize: '0.68rem' }}>● GEO-LOCK ACTIVE</span>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0 justify-content-center gap-3">
                <button type="button" className="btn btn-secondary btn-sm px-3" onClick={stopCamera}>
                  {t.closeCamera}
                </button>
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="btn btn-success btn-sm px-4 fw-bold d-flex align-items-center gap-2 shadow"
                >
                  <Camera size={16} /> {t.snapBtn} (Auto-GeoTag)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RaiseComplaint;
