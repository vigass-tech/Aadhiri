import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext(null);

export const translations = {
  en: {
    // Brand & Header
    brandName: 'AADHIRAI',
    tagline: 'Your Voice. Our Responsibility.',
    portalTitle: 'Smart Citizen Complaint Management System',
    statePortal: 'Official State Citizen Grievance Portal',
    nammaOorTitle: 'NAMMA OOR AI / AADHIRAI',
    demoPilot: 'DEMO PILOT',
    musiriSubtitle: 'Musiri Municipality Citizen Portal • Musiri, TN',
    officialPortal: 'Official State Citizen Grievance Portal',

    // Navigation
    home: 'Home',
    about: 'About',
    services: 'Services',
    howItWorks: 'How It Works',
    trackComplaint: 'Track Complaint',
    contact: 'Contact',
    login: 'Login',
    register: 'Register',
    dashboard: 'Dashboard',
    signOut: 'Sign Out',
    myComplaints: 'My Complaints',
    raiseComplaint: 'Raise Complaint',
    notifications: 'Notifications',
    support: 'Support & Grievances',
    feedback: 'Feedback',
    profile: 'Profile',
    departments: 'Departments',
    admins: 'Admin Management',
    reviewers: 'Reviewer Management',
    citizens: 'Citizen Management',
    allComplaints: 'All Complaints',
    budgets: 'Budget Management',
    reports: 'Reports & Analytics',
    assignedComplaints: 'Assigned Complaints',
    reviewHistory: 'Review History',
    portalMenu: 'Menu',

    // Common Buttons & Actions
    submit: 'Submit',
    save: 'Save Changes',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    viewDetails: 'View Details',
    search: 'Search...',
    filter: 'Filter',
    refresh: 'Refresh',
    trackNow: 'Track Now',
    printReport: 'Print / Export PDF',
    applyAi: 'Apply AI Statement',
    takePhoto: 'Take Photo',
    liveGps: 'Use My Current Location',
    markAllRead: 'Mark all read',
    viewAllNotifications: 'View All Notifications',
    back: 'Back',

    // Statuses
    SUBMITTED: 'Submitted',
    UNDER_REVIEW: 'Under Review',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    ASSIGNED: 'Assigned',
    IN_PROGRESS: 'In Progress',
    RESOLVED: 'Resolved',
    CLOSED: 'Closed',

    // Priorities
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
    URGENT: 'Urgent',

    // Roles
    SUPER_ADMIN: 'Super Administrator',
    ADMIN: 'Zonal Administrator',
    REVIEWER: 'Field Reviewer',
    CITIZEN: 'Citizen User',

    // Categories
    catRoads: 'Roads & Infrastructure',
    catWater: 'Water Supply & Sewage',
    catElec: 'Electricity & Street Lighting',
    catSan: 'Sanitation & Solid Waste',
    catHealth: 'Public Health & Welfare',
    catTax: 'Revenue & Property Tax',

    // Landing Page
    heroTitle: 'Your Voice.',
    heroSubtitleHighlight: 'Our Responsibility.',
    heroSubtitle: 'AADHIRAI bridges citizens and municipal administration. Report civic issues, track live investigation timelines, and ensure transparent, department-driven resolutions in real time.',
    totalComplaints: 'Total Complaints',
    resolvedComplaints: 'Resolved Grievances',
    pendingComplaints: 'Under Active Review',
    registeredCitizens: 'Registered Citizens',
    activeDepartments: 'Active Departments',
    resolutionRate: 'Resolution Rate',
    enterTicketPrompt: 'Enter Ticket ID (e.g. ADH-2026-101001)',
    trackComplaintBtn: 'Track Complaint',
    raiseComplaintBtn: 'Raise a Complaint',
    quickTrackTitle: 'Quick Public Complaint Tracking',
    quickTrackSubtitle: 'No login required. Track your municipal ticket status in real time.',
    howItWorksTitle: 'Transparent Complaint Lifecycle',
    step1Title: 'Submit Grievance',
    step1Desc: 'Citizen reports civic issue with GPS geocoding and live camera damage photos.',
    step2Title: 'Field Inspection',
    step2Desc: 'Assigned reviewer inspects location, validates defect, and uploads verification.',
    step3Title: 'Zonal Department',
    step3Desc: 'Admin assigns budget, work order, and contractor to execute ground repair.',
    step4Title: 'Resolved & Verified',
    step4Desc: 'Issue marked resolved with before/after photos and citizen SMS update.',
    categoriesTitle: 'Service Categories Handled',
    categoriesSubtitle: 'Direct routing to specialized municipal engineering departments.',

    // Raise Complaint (Citizen)
    selectArea: 'Confirm Grievance Location',
    dragPin: 'Drag pin on map to refine location coordinates',
    wardDemo: 'Ward 2, Musiri (Demo Data)',
    descLabel: 'Provide Description of the Issue',
    descPlaceholder: 'Type complaint details or click mic to speak...',
    listening: 'Listening... please speak',
    addPhoto: 'Add photo',
    takePhotoBtn: 'Take photo',
    liveCamera: 'Live Camera Capture',
    snapBtn: 'Capture Photo',
    closeCamera: 'Close Camera',
    aiVisionTitle: 'AADHIRAI AI Vision Inspection',
    aiScanning: 'AI is analyzing photo damage & formulating statement...',
    aiDetected: 'Detected Defect:',
    aiStatementLabel: 'AI Formulated Technical Statement:',
    applyAiBtn: 'Apply AI Statement to Complaint',
    submitGrievanceBtn: 'Submit Official Grievance',
    submitting: 'Registering grievance...',
    successTitle: 'Grievance Registered Successfully!',
    ticketIdLabel: 'YOUR OFFICIAL TICKET ID',
    trackBtn: 'Track Grievance Status Now',
    categoryLabel: 'Issue Category',
    priorityLabel: 'Priority Level',
    deptLabel: 'Target Department',

    // Track Complaint Page
    trackHeaderTitle: 'Public Complaint Status Tracker',
    trackHeaderSubtitle: 'Enter your official ticket reference number to verify inspection progress and department assignment.',
    enterTicketPlaceholder: 'ADH-2026-XXXXXX',
    timelineTitle: 'Grievance Progress Timeline',
    complaintDetailsTitle: 'Official Grievance Record',
    statusLabel: 'Current Status',
    filedOn: 'Filed Date',
    assignedDept: 'Assigned Department',
    locationAddress: 'Location Address',
    aiDefectSummary: 'AI Defect Analysis',
    officialReviewNotes: 'Reviewer Inspection Notes',

    // Auth Pages (Unified Login)
    loginHeading: 'Unified Portal Access',
    loginSubtitle: 'Official single-window sign-in for Citizens, Field Reviewers, Admins, and Super Admins.',
    emailAddress: 'Email Address',
    emailPlaceholder: 'name@example.com',
    password: 'Password',
    passwordPlaceholder: 'Enter your password',
    rememberMe: 'Remember this device',
    forgotPassword: 'Forgot Password?',
    signingIn: 'Authenticating...',
    loginBtn: 'Sign In to Portal',
    noAccountPrompt: "Don't have a citizen account?",
    registerNow: 'Register as a Citizen',
    returnHome: 'Return to Public Homepage',
    demoCredentialsTitle: 'College Demo Credentials (Instant Fill)',

    // Citizen Register Page
    registerHeading: 'Citizen Grievance Registration',
    registerSubtitle: 'Create your official citizen account to report civic issues and track resolutions.',
    fullName: 'Full Name',
    phoneNumber: 'Phone Number',
    confirmPassword: 'Confirm Password',
    residentialAddress: 'Residential Address (Optional)',
    acceptTerms: 'I confirm that provided information is accurate and agree to Aadhirai terms.',
    creatingAccount: 'Creating Account...',
    registerSubmitBtn: 'Register Official Citizen Account',
    haveAccountPrompt: 'Already have an account?',
    signInInstead: 'Sign in instead',

    // Dashboards
    welcomeBack: 'Welcome back',
    systemOverview: 'Municipal System Overview',
    overviewSubtitle: 'Real-time performance monitoring across all civic sectors.',
    recentComplaints: 'Recent Grievances',
    noComplaintsFound: 'No complaints found.',
    viewAll: 'View All',

    // Language Toggle
    switchLangTooltip: 'தமிழுக்கு மாறவும் (Switch to Tamil)',
    currentLangDisplay: 'English'
  },
  ta: {
    // Brand & Header
    brandName: 'ஆதிரை (AADHIRAI)',
    tagline: 'உங்கள் குரல். எங்கள் பொறுப்பு.',
    portalTitle: 'ஸ்மார்ட் குடிமக்கள் குறைதீர்ப்பு மேலாண்மை தளம்',
    statePortal: 'மாநில அரசின் அதிகாரப்பூர்வ குடிமக்கள் குறைதீர்ப்பு இணையதளம்',
    nammaOorTitle: 'நம்ம ஊர் AI / ஆதிரை',
    demoPilot: 'DEMO PILOT',
    musiriSubtitle: 'முசிரி நகராட்சி குடிமக்கள் தளம் • Musiri, TN',
    officialPortal: 'மாநில அரசின் அதிகாரப்பூர்வ குடிமக்கள் குறைதீர்ப்பு இணையதளம்',

    // Navigation
    home: 'முகப்பு',
    about: 'அறிமுகம்',
    services: 'சேவைகள்',
    howItWorks: 'செயல்முறை',
    trackComplaint: 'புகார் நிலைக் கண்காணிப்பு',
    contact: 'தொடர்புக்கு',
    login: 'உள்நுழைக',
    register: 'பதிவு செய்க',
    dashboard: 'கட்டுப்பாட்டு அறை',
    signOut: 'வெளியேறு',
    myComplaints: 'என் புகார்கள்',
    raiseComplaint: 'புகார் அளிக்க',
    notifications: 'அறிவிப்புகள்',
    support: 'உதவி மையம் & கருத்து',
    feedback: 'கருத்து',
    profile: 'சுயவிவரம்',
    departments: 'துறைகள்',
    admins: 'நிர்வாக அதிகாரிகள்',
    reviewers: 'கள ஆய்வாளர்கள்',
    citizens: 'குடிமக்கள் பட்டியல்',
    allComplaints: 'அனைத்துப் புகார்கள்',
    budgets: 'துறை வாரிய நிதி',
    reports: 'புள்ளிவிவர அறிக்கைகள்',
    assignedComplaints: 'ஒதுக்கப்பட்ட புகார்கள்',
    reviewHistory: 'ஆய்வு வரலாறு',
    portalMenu: 'பட்டி',

    // Common Buttons & Actions
    submit: 'சமர்ப்பிக்க',
    save: 'மாற்றங்களைச் சேமிக்க',
    cancel: 'ரத்து செய்',
    edit: 'திருத்து',
    delete: 'நீக்கு',
    viewDetails: 'விவரங்களைப் பார்க்க',
    search: 'தேடுக...',
    filter: 'வடிகட்டுக',
    refresh: 'புதுப்பி',
    trackNow: 'நிலையைக் காண்க',
    printReport: 'அச்சு / PDF பதிவிறக்கு',
    applyAi: 'AI அறிக்கையைப் பயன்படுத்து',
    takePhoto: 'புகைப்படம் எடுக்க',
    liveGps: 'என் தற்போதைய இடத்தை எடு',
    markAllRead: 'அனைத்தையும் படித்ததாகக் குறி',
    viewAllNotifications: 'அனைத்து அறிவிப்புகளையும் காண்க',
    back: 'பின்செல்க',

    // Statuses
    SUBMITTED: 'சமர்ப்பிக்கப்பட்டது',
    UNDER_REVIEW: 'ஆய்வில் உள்ளது',
    APPROVED: 'அங்கீகரிக்கப்பட்டது',
    REJECTED: 'நிராகரிக்கப்பட்டது',
    ASSIGNED: 'ஒதுக்கீடு செய்யப்பட்டது',
    IN_PROGRESS: 'செயல்பாட்டில் உள்ளது',
    RESOLVED: 'தீர்க்கப்பட்டது',
    CLOSED: 'முடிக்கப்பட்டது',

    // Priorities
    LOW: 'குறைவு (Low)',
    MEDIUM: 'நடுத்தரம் (Medium)',
    HIGH: 'அதிகம் (High)',
    URGENT: 'அவசரம் (Urgent)',

    // Roles
    SUPER_ADMIN: 'தலைமை நிர்வாகி (Super Admin)',
    ADMIN: 'மண்டல நிர்வாகி (Zonal Admin)',
    REVIEWER: 'கள ஆய்வாளர் (Field Reviewer)',
    CITIZEN: 'குடிமக்கள் (Citizen)',

    // Categories
    catRoads: 'சாலைகள் & உள்கட்டமைப்பு',
    catWater: 'குடிநீர் & கழிவுநீர் வடிகால்',
    catElec: 'மின்சாரம் & தெருவிளக்குகள்',
    catSan: 'தூய்மைப் பணி & திடக்கழிவு',
    catHealth: 'பொது சுகாதாரம் & நலன்',
    catTax: 'வருவாய் & சொத்து வரி',

    // Landing Page
    heroTitle: 'உங்கள் குரல்.',
    heroSubtitleHighlight: 'எங்கள் பொறுப்பு.',
    heroSubtitle: 'ஆதிரை (AADHIRAI) தளம் குடிமக்களையும் நகராட்சி நிர்வாகத்தையும் நேரடியாக இணைக்கிறது. குறைகளைப் பதிவு செய்து, கள ஆய்வுகளைக் கண்காணித்து, வெளிப்படையான தீர்வுகளைப் பெறுங்கள்.',
    totalComplaints: 'மொத்தப் புகார்கள்',
    resolvedComplaints: 'தீர்க்கப்பட்ட புகார்கள்',
    pendingComplaints: 'ஆய்வில் உள்ளவை',
    registeredCitizens: 'பதிவுசெய்த குடிமக்கள்',
    activeDepartments: 'செயலில் உள்ள துறைகள்',
    resolutionRate: 'தீர்வு விகிதம்',
    enterTicketPrompt: 'டிக்கெட் எண் உள்ளிடவும் (எ.கா. ADH-2026-101001)',
    trackComplaintBtn: 'புகாரைக் கண்காணிக்க',
    raiseComplaintBtn: 'புதிய புகார் அளிக்க',
    quickTrackTitle: 'பொது மக்கள் உடனடி புகார் கண்காணிப்பு',
    quickTrackSubtitle: 'உள்நுழையத் தேவையில்லை. உங்கள் டிக்கெட் நிலையை உடனடியாக அறியலாம்.',
    howItWorksTitle: 'வெளிப்படையான குறைதீர்ப்பு செயல்முறை',
    step1Title: 'குறை பதிவு செய்தல்',
    step1Desc: 'குடிமக்கள் புகைப்படங்கள் மற்றும் நேரடி ஜி.பி.எஸ் இடத்துடன் புகாரைப் பதிவு செய்கிறார்கள்.',
    step2Title: 'கள ஆய்வு',
    step2Desc: 'ஆய்வாளர் இடத்திற்குச் சென்று குறைபாட்டை ஆய்வு செய்து புகைப்படத்துடன் அறிக்கை அனுப்புகிறார்.',
    step3Title: 'துறை ஒதுக்கீடு & நிதி',
    step3Desc: 'நிர்வாகி துறைக்கு நிதி ஒதுக்கி ஒப்பந்ததாரர் மூலம் சீரமைப்புப் பணியைத் தொடங்குகிறார்.',
    step4Title: 'தீர்வு & குடிமக்கள் அறிவிப்பு',
    step4Desc: 'பணி முடிக்கப்பட்டு புகைப்படத்துடன் தீர்வு உறுதி செய்யப்பட்டு குடிமக்களுக்கு அறிவிக்கப்படுகிறது.',
    categoriesTitle: 'கையாளப்படும் சேவைகள்',
    categoriesSubtitle: 'துறைசார் பொறியியல் பிரிவுகளுக்கு நேரடியாக அனுப்பப்படும் சேவைகள்.',

    // Raise Complaint (Citizen)
    selectArea: 'பகுதியைத் தேர்ந்தெடுக்கவும்',
    dragPin: 'இடத்தை மாற்ற வரைபடத்தில் முள் குறியை இழுக்கவும் (Drag pin)',
    wardDemo: 'Ward 2, Musiri (Demo Data)',
    descLabel: 'புகார் பற்றிய சுருக்கமான விவரத்தை வழங்கவும்',
    descPlaceholder: 'புகார் விவரத்தை தட்டச்சு செய்க அல்லது பேசவும்...',
    listening: 'கேட்கிறது... பேசவும்',
    addPhoto: 'புகைப்படம் சேர்க்கவும்',
    takePhotoBtn: 'புகைப்படம் எடுக்க',
    liveCamera: 'நேரடி கேமரா',
    snapBtn: 'புகைப்படம் பிடி',
    closeCamera: 'ரத்து செய்',
    aiVisionTitle: 'ஆதிரை AI பார்வை ஆய்வு (Vision AI)',
    aiScanning: 'படத்தை AI ஸ்கேன் செய்து பிழை விவரத்தை உருவாக்குகிறது...',
    aiDetected: 'கண்டறியப்பட்ட குறைபாடு:',
    aiStatementLabel: 'AI உருவாக்கிய அதிகாரப்பூர்வ அறிக்கை:',
    applyAiBtn: 'இந்த அறிக்கையை புகாராகப் பயன்படுத்து',
    submitGrievanceBtn: 'புகாரை அதிகாரப்பூர்வமாகப் பதிவு செய்க',
    submitting: 'பதிவு செய்யப்படுகிறது...',
    successTitle: 'புகார் வெற்றிகரமாகப் பதிவு செய்யப்பட்டது!',
    ticketIdLabel: 'உங்கள் அதிகாரப்பூர்வ டிக்கெட் எண்',
    trackBtn: 'புகார் நிலையை உடனடியாகக் கண்காணிக்கவும்',
    categoryLabel: 'புகார் வகை',
    priorityLabel: 'முன்னுரிமை நிலை',
    deptLabel: 'ஒதுக்கப்பட வேண்டிய துறை',

    // Track Complaint Page
    trackHeaderTitle: 'குடிமக்கள் குறைதீர்ப்பு நிலை கண்காணிப்பு',
    trackHeaderSubtitle: 'உங்கள் அதிகாரப்பூர்வ டிக்கெட் எண்ணை உள்ளிட்டு ஆய்வு விவரங்களையும் தீர்வு நிலையையும் அறியவும்.',
    enterTicketPlaceholder: 'ADH-2026-XXXXXX',
    timelineTitle: 'குறைதீர்ப்பு முன்னேற்றப் படிகள்',
    complaintDetailsTitle: 'அதிகாரப்பூர்வ புகார் ஆவணம்',
    statusLabel: 'தற்போதைய நிலை',
    filedOn: 'பதிவு செய்யப்பட்ட நாள்',
    assignedDept: 'ஒதுக்கப்பட்ட துறை',
    locationAddress: 'இடத்தின் முகவரி',
    aiDefectSummary: 'AI குறைபாடு பகுப்பாய்வு',
    officialReviewNotes: 'கள ஆய்வாளரின் குறிப்புகள்',

    // Auth Pages (Unified Login)
    loginHeading: 'ஒருங்கிணைந்த உள்நுழைவு தளம்',
    loginSubtitle: 'குடிமக்கள், கள ஆய்வாளர்கள், மற்றும் அனைத்து நிலை நிர்வாகிகளுக்கான ஒரே உள்நுழைவு பக்கம்.',
    emailAddress: 'மின்னஞ்சல் முகவரி',
    emailPlaceholder: 'பெயர்@example.com',
    password: 'கடவுச்சொல்',
    passwordPlaceholder: 'உங்கள் கடவுச்சொல்லை உள்ளிடவும்',
    rememberMe: 'இந்தக் கணினியில் என்னை நினைவில் கொள்க',
    forgotPassword: 'கடவுச்சொல் மறந்துவிட்டதா?',
    signingIn: 'சரிபார்க்கப்படுகிறது...',
    loginBtn: 'தளத்தில் உள்நுழைக',
    noAccountPrompt: 'குடிமக்கள் கணக்கு இல்லையா?',
    registerNow: 'இப்போதே பதிவு செய்க',
    returnHome: 'முகப்பு பக்கத்திற்குத் திரும்பு',
    demoCredentialsTitle: 'கல்லூரி மாதிரி கணக்குகள் (நேரடி தேர்வு)',

    // Citizen Register Page
    registerHeading: 'குடிமக்கள் புதிய கணக்குப் பதிவு',
    registerSubtitle: 'குறைகளைப் பதிவு செய்யவும் நகராட்சி நடவடிக்கைகளைக் கண்காணிக்கவும் கணக்கு தொடங்கவும்.',
    fullName: 'முழுப் பெயர்',
    phoneNumber: 'கைபேசி எண்',
    confirmPassword: 'கடவுச்சொல்லை மீண்டும் உள்ளிடவும்',
    residentialAddress: 'முகவரி (விருப்பத்தேர்வு)',
    acceptTerms: 'வழங்கப்பட்ட விவரங்கள் அனைத்தும் உண்மையானவை என உறுதியளிக்கிறேன்.',
    creatingAccount: 'கணக்கு உருவாக்கப்படுகிறது...',
    registerSubmitBtn: 'புதிய குடிமக்கள் கணக்கை உருவாக்குக',
    haveAccountPrompt: 'ஏற்கனவே கணக்கு உள்ளதா?',
    signInInstead: 'உள்நுழைய இங்கே கிளிக் செய்க',

    // Dashboards
    welcomeBack: 'நல்வரவு',
    systemOverview: 'நகராட்சி நிர்வாகத்தின் கண்ணோட்டம்',
    overviewSubtitle: 'அனைத்து நகர்ப்புற துறைகளின் நேரடி செயல்பாட்டுக் கண்காணிப்பு.',
    recentComplaints: 'சமீபத்திய புகார்கள்',
    noComplaintsFound: 'புகார்கள் ஏதுமில்லை.',
    viewAll: 'அனைத்தையும் காண்க',

    // Language Toggle
    switchLangTooltip: 'Switch to English (ஆங்கிலத்திற்கு மாறவும்)',
    currentLangDisplay: 'தமிழ்'
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('aadhirai_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('aadhirai_lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLang = () => {
    setLang((prev) => (prev === 'en' ? 'ta' : 'en'));
  };

  const t = (key) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
