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
  const [category, setCategory] = useState('Roads & Infrastructure');
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

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    setImagePreview(dataUrl);
    stopCamera();
    triggerAIAnalysis(dataUrl);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        triggerAIAnalysis(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger AI Vision Inspection & Statement Formulation
  const triggerAIAnalysis = async (imageData) => {
    setAnalyzingAI(true);
    setAiStatement(null);

    try {
      const res = await api.post('/complaints/ai-analyze', {
        image: imageData,
        hintCategory: category,
        userNotes: description
      });

      if (res.data.success) {
        setAiStatement(res.data.analysis);
        if (res.data.analysis.category) {
          setCategory(res.data.analysis.category);
        }
        if (res.data.analysis.suggestedPriority) {
          setPriority(res.data.analysis.suggestedPriority);
        }
        if (res.data.analysis.department) {
          setDepartmentId(res.data.analysis.department);
        }
      }
    } catch (err) {
      console.warn('AI analysis failed:', err);
    } finally {
      setAnalyzingAI(false);
    }
  };

  const applyAIStatement = () => {
    if (!aiStatement) return;
    const stmt = lang === 'ta' ? aiStatement.statementTa : aiStatement.statementEn;
    setDescription(stmt);
    if (aiStatement.category) {
      setCategory(aiStatement.category);
    }
    if (aiStatement.suggestedPriority) {
      setPriority(aiStatement.suggestedPriority);
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
              detectedIssue: aiStatement.detectedIssue,
              confidence: aiStatement.confidence,
              autoStatement: lang === 'ta' ? aiStatement.statementTa : aiStatement.statementEn
            }
          : undefined,
        attachments: imagePreview
          ? [{ url: imagePreview, filename: 'live_evidence_capture.jpg' }]
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

          {/* 5. Live Photo Evidence & AI Analyzer */}
          <div className="mb-4">
            <label className="fw-semibold text-dark small d-flex align-items-center gap-1 mb-2">
              <Camera size={16} /> {t.addPhoto}
            </label>

            <div className="d-flex flex-wrap align-items-start gap-3">
              {/* Camera Trigger Card matching user's dark indigo card */}
              <div
                onClick={startCamera}
                className="d-flex flex-column align-items-center justify-content-center text-white rounded-4 shadow-sm cursor-pointer p-4 text-center transition"
                style={{
                  width: '130px',
                  height: '130px',
                  backgroundColor: '#273252',
                  cursor: 'pointer'
                }}
              >
                <Camera size={34} className="mb-2" />
                <span className="small fw-semibold" style={{ fontSize: '0.78rem' }}>
                  {t.takePhoto}
                </span>
              </div>

              {/* Or File Upload Trigger */}
              <label
                className="d-flex flex-column align-items-center justify-content-center text-muted rounded-4 border border-dashed p-4 text-center cursor-pointer bg-light"
                style={{ width: '130px', height: '130px', cursor: 'pointer' }}
              >
                <Upload size={28} className="mb-1 text-primary" />
                <span style={{ fontSize: '0.72rem' }}>
                  {lang === 'ta' ? 'கோப்பு பதிவேற்று' : 'Browse File'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="d-none"
                  onChange={handleFileUpload}
                />
              </label>

              {/* Photo Preview Thumbnail */}
              {imagePreview && (
                <div className="position-relative">
                  <img
                    src={imagePreview}
                    alt="Captured Evidence"
                    className="rounded-4 object-cover border shadow-sm"
                    style={{ width: '130px', height: '130px', objectFit: 'cover' }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setAiStatement(null);
                    }}
                    className="btn btn-danger btn-sm p-1 rounded-circle position-absolute top-0 end-0 translate-middle"
                    title="Remove photo"
                  >
                    <X size={14} />
                  </button>
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

          {aiStatement && (
            <div
              className="p-4 rounded-3 border mb-4 shadow-sm"
              style={{ backgroundColor: '#f0fdf4', borderColor: '#86efac' }}
            >
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
                <span className="fw-bold text-success d-flex align-items-center gap-1 small">
                  <Sparkles size={16} /> {t.aiTitle}
                  {aiStatement.aiProvider && (
                    <span className="badge bg-dark bg-opacity-75 ms-1" style={{ fontSize: '0.68rem' }}>
                      {aiStatement.aiProvider}
                    </span>
                  )}
                  <span className="text-muted ms-1" style={{ fontSize: '0.75rem' }}>
                    ({(aiStatement.confidence * 100).toFixed(0)}% Match)
                  </span>
                </span>
                <span className="badge bg-success px-2 py-1">
                  {lang === 'ta' ? aiStatement.detectedIssueTa : aiStatement.detectedIssue}
                </span>
              </div>

              <div className="small text-muted mb-2">
                <strong>{t.aiStatementLabel}</strong>
              </div>
              <div className="p-3 bg-white rounded border mb-3 text-dark small" style={{ lineHeight: 1.6 }}>
                {lang === 'ta' ? aiStatement.statementTa : aiStatement.statementEn}
              </div>

              <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                <div className="small text-muted d-flex align-items-center gap-2 flex-wrap">
                  <span><strong>Dept:</strong> {aiStatement.departmentName}</span>
                  <span>•</span>
                  <span><strong>Priority:</strong>{' '}
                    <span
                      className="badge fw-bold"
                      style={{
                        backgroundColor:
                          aiStatement.suggestedPriority === 'URGENT'
                            ? '#dc2626'
                            : aiStatement.suggestedPriority === 'HIGH'
                            ? '#ea580c'
                            : aiStatement.suggestedPriority === 'MEDIUM'
                            ? '#2563eb'
                            : '#64748b',
                        color: '#ffffff'
                      }}
                    >
                      {aiStatement.suggestedPriority}
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

          {/* 7. Category & Priority Selector (Foldable details) */}
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label className="gov-label small">
                {lang === 'ta' ? 'துறை வகை' : 'Issue Category'}
              </label>
              <select
                className="gov-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Roads & Infrastructure">Roads & Infrastructure (சாலைகள்)</option>
                <option value="Water Supply">Water Supply (குடிநீர்)</option>
                <option value="Electricity & Lighting">Electricity & Lighting (மின்சாரம் / தெருவிளக்கு)</option>
                <option value="Sanitation & Waste">Sanitation & Waste (தூய்மைப் பணி / குப்பை)</option>
                <option value="Public Health">Public Health (பொது சுகாதாரம்)</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="gov-label small">
                {lang === 'ta' ? 'முன்னுரிமை' : 'Priority'}
              </label>
              <select
                className="gov-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
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

      {/* Live Camera Modal */}
      {isCameraActive && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1100 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark text-white border-0">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title small fw-bold text-white d-flex align-items-center gap-2">
                  <Camera size={18} /> {t.liveCamera}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={stopCamera}></button>
              </div>
              <div className="modal-body text-center p-3">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-100 rounded-3 border border-secondary"
                  style={{ maxHeight: '380px', objectFit: 'cover' }}
                ></video>
              </div>
              <div className="modal-footer border-0 pt-0 justify-content-center gap-3">
                <button type="button" className="btn btn-secondary btn-sm px-3" onClick={stopCamera}>
                  {t.closeCamera}
                </button>
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="btn btn-danger btn-sm px-4 fw-bold d-flex align-items-center gap-2"
                >
                  <Camera size={16} /> {t.snapBtn}
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
