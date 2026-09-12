import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ta';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header & Navigation
    'nav.dashboard': 'Dashboard',
    'nav.appointments': 'Appointments',
    'nav.patients': 'Patients',
    'nav.doctors': 'Doctors',
    'nav.analytics': 'Analytics & Reports',
    'nav.waitlist': 'Waitlist',
    'nav.notifications': 'Notifications',
    'nav.availability': 'Doctor Availability',
    'nav.my_appointments': 'My Appointments',
    'nav.book_appointment': 'Book Appointment',
    'nav.profile': 'My Profile',
    'nav.logout': 'Logout',

    // Branding & Welcome
    'welcome.title': 'Welcome to CarePilot SNS',
    'welcome.institution': 'SNS Medical College and Hospital',
    'welcome.portal': 'Patient Care Portal',
    'welcome.good_morning': 'Good morning',
    'welcome.hello': 'Hello',

    // Actions & Buttons
    'action.book': 'Book Appointment',
    'action.create_patient': 'Create Patient Account',
    'action.create_doctor': 'Create Doctor Profile',
    'action.save': 'Save',
    'action.cancel': 'Cancel',
    'action.confirm': 'Confirm',
    'action.search': 'Search',
    'action.filter': 'Filter',
    'action.skip': 'Skip',
    'action.replay': 'Replay Intro',

    // Statuses & Risk
    'status.attended': 'Attended',
    'status.not_attended': 'Not Attended (No-Show)',
    'status.confirmed': 'Confirmed',
    'status.completed': 'Completed',
    'status.cancelled': 'Cancelled',
    'status.active': 'Active',
    'status.inactive': 'Inactive',
    'risk.low': 'LOW RISK',
    'risk.medium': 'MEDIUM RISK',
    'risk.high': 'HIGH RISK',

    // Common Labels
    'label.doctor': 'Doctor',
    'label.patient': 'Patient',
    'label.email': 'Email',
    'label.phone': 'Phone Number',
    'label.department': 'Department',
    'label.specialization': 'Specialization',
    'label.experience': 'Experience',
    'label.date': 'Date',
    'label.time': 'Time Slot',
    'label.reason': 'Reason for Visit',

    // Book Appointment Keys
    'book.title': 'Book Consultation',
    'book.step1': '1. Select Doctor & Time',
    'book.step2': '2. Review Details',
    'book.step3': '3. Confirmation',
    'book.choose_doctor': '1. Choose Active Physician',
    'book.preferred_date': '2. Preferred Date',
    'book.visit_purpose': '3. Visit Purpose / Type',
    'book.select_slot': '4. Select 20-Minute Time Slot',
    'book.morning_session': 'Morning Session',
    'book.evening_session': 'Evening Session',
    'book.confirm_button': 'Confirm Booking',
    'book.next_step': 'Proceed to Review',
    'book.prev_step': 'Back to Selection',

    // Metric Cards & Dashboard Extra
    'metric.total_visits': 'Total Visits',
    'metric.attended': 'Attended',
    'metric.missed': 'Missed',
    'metric.waitlist': 'Waitlist',
    'dashboard.next_ticket': 'Your Next Confirmed Medical Ticket',
    'dashboard.no_upcoming': 'No Upcoming Consultations',
    'dashboard.no_upcoming_desc': 'You currently have no scheduled appointments. Select a physician from SNS Medical College and book your consultation slot.',
    'dashboard.available_doctors': 'Available Faculty Physicians',
    'dashboard.doctors_subtitle': 'SNS Medical College and Hospital Specialists',
    'dashboard.view_all_doctors': 'View All Doctors',
    'dashboard.book_slot': 'Book Slot',
    'dashboard.history_title': 'Appointment History & Schedule',
    'dashboard.reschedule': 'Reschedule Visit',
    'dashboard.cancel': 'Cancel Visit',
    'dashboard.patient_id': 'Patient ID',
    'dashboard.back_to_dashboard': 'Back to Dashboard',
    'dashboard.exp_years': 'Years Exp.',
    'dashboard.emergency_title': 'Urgent Care & Priority Consultation',
    'dashboard.emergency_desc': 'If regular slots are unavailable, request an urgent priority consultation with on-call faculty specialists.',
    'dashboard.emergency_button': 'Request Priority Slot',
    'emergency.modal_title': 'Urgent Priority Doctor Request',
    'emergency.select_doctor': 'Select Physician & View Details',
    'emergency.select_date': 'Select Preferred Date',
    'emergency.priority_label': 'Select Priority Level',
    'emergency.priority_emergency': 'Emergency (Immediate Care)',
    'emergency.priority_high': 'High Priority (Same Day)',
    'emergency.priority_standard': 'Standard Priority (24-48 Hours)',
    'emergency.reason_label': 'Reason for Priority Booking',
    'emergency.reason_placeholder': 'Type the reason for priority consultation (e.g. High fever, acute pain, urgent checkup)...',
    'emergency.admin_note': 'Admin Verification Process: Once submitted, hospital admin will verify doctor availability and confirm your priority slot based on selected urgency level. You will receive an instant confirmation notification.',
    'emergency.submit_button': 'Submit Request for Admin Verification',
    'emergency.success_title': 'Emergency Request Submitted to Admin!',
    'emergency.success_desc': 'Your emergency consultation request has been sent to the Admin. Once verified, you will receive a confirmation message.'
  },
  ta: {
    // Header & Navigation
    'nav.dashboard': 'முகப்பு (டாஷ்போர்டு)',
    'nav.appointments': 'சந்திப்புகள்',
    'nav.patients': 'நோயாளிகள் விவரம்',
    'nav.doctors': 'மருத்துவர்கள்',
    'nav.analytics': 'பகுப்பாய்வு & அறிக்கைகள்',
    'nav.waitlist': 'காத்திருப்புப் பட்டியல்',
    'nav.notifications': 'அறிவிப்புகள்',
    'nav.availability': 'மருத்துவர் நேர அட்டவணை',
    'nav.my_appointments': 'எனது சந்திப்புகள்',
    'nav.book_appointment': 'சந்திப்பு பதிவு',
    'nav.profile': 'எனது சுயவிவரம்',
    'nav.logout': 'வெளியேறு',

    // Branding & Welcome
    'welcome.title': 'CarePilot SNS-க்கு நல்வரவு',
    'welcome.institution': 'SNS மருத்துவக் கல்லூரி மற்றும் மருத்துவமனை',
    'welcome.portal': 'நோயாளி நல மையம்',
    'welcome.good_morning': 'காலை வணக்கம்',
    'welcome.hello': 'வணக்கம்',

    // Actions & Buttons
    'action.book': 'சந்திப்பு பதிவு செய்',
    'action.create_patient': 'புதிய நோயாளி கணக்கு',
    'action.create_doctor': 'புதிய மருத்துவர் கணக்கு',
    'action.save': 'சேமி',
    'action.cancel': 'ரத்து செய்',
    'action.confirm': 'உறுதி செய்',
    'action.search': 'தேடுக',
    'action.filter': 'வடிகட்டுக',
    'action.skip': 'தவிர்க்கவும்',
    'action.replay': 'மீண்டும் இயக்கு',

    // Statuses & Risk
    'status.attended': 'வருகை தந்தார்',
    'status.not_attended': 'வருகை தரவில்லை (No-Show)',
    'status.confirmed': 'உறுதி செய்யப்பட்டது',
    'status.completed': 'நிறைவடைந்தது',
    'status.cancelled': 'ரத்து செய்யப்பட்டது',
    'status.active': 'செயலில் உள்ளது',
    'status.inactive': 'செயலற்றது',
    'risk.low': 'குறைந்த அபாயம்',
    'risk.medium': 'மிதமான அபாயம்',
    'risk.high': 'அதிக அபாயம்',

    // Common Labels
    'label.doctor': 'மருத்துவர்',
    'label.patient': 'நோயாளி',
    'label.email': 'மின்னஞ்சல்',
    'label.phone': 'தொலைபேசி எண்',
    'label.department': 'துறை',
    'label.specialization': 'சிறப்புத் துறை',
    'label.experience': 'அனுபவம்',
    'label.date': 'தேதி',
    'label.time': 'நேரம்',
    'label.reason': 'சிகிச்சைக்கான காரணம்',

    // Book Appointment Keys
    'book.title': 'சந்திப்பு பதிவு செய்ய',
    'book.step1': '1. மருத்துவர் & நேரம்',
    'book.step2': '2. விவரங்களை சரிபார்க்க',
    'book.step3': '3. சந்திப்பு உறுதிப்பட்டது',
    'book.choose_doctor': '1. மருத்துவரைத் தேர்ந்தெடுக்கவும்',
    'book.preferred_date': '2. விரும்பிய தேதி',
    'book.visit_purpose': '3. சிகிச்சை வகை',
    'book.select_slot': '4. நேரத்தைத் தேர்ந்தெடுக்கவும் (20 நிமிடங்கள்)',
    'book.morning_session': 'காலை நேரம்',
    'book.evening_session': 'மாலை நேரம்',
    'book.confirm_button': 'சந்திப்பை உறுதி செய்',
    'book.next_step': 'அடுத்த நிலை (சரிபார்க்க)',
    'book.prev_step': 'முந்தைய நிலை',

    // Metric Cards & Dashboard Extra
    'metric.total_visits': 'மொத்த வருகைகள்',
    'metric.attended': 'வருகை புரிந்தவை',
    'metric.missed': 'தவறிய வருகைகள்',
    'metric.waitlist': 'காத்திருப்பு',
    'dashboard.next_ticket': 'உங்கள் அடுத்த உறுதிசெய்யப்பட்ட மருத்துவ சீட்டு',
    'dashboard.no_upcoming': 'வரவிருக்கும் சந்திப்புகள் எதுவும் இல்லை',
    'dashboard.no_upcoming_desc': 'தற்போது உங்களுக்கு எந்த சந்திப்பும் முன்பதிவு செய்யப்படவில்லை. SNS மருத்துவக் கல்லூரி மருத்துவரைத் தேர்ந்தெடுத்து முன்பதிவு செய்யவும்.',
    'dashboard.available_doctors': 'கிடைக்கும் சிறப்பு மருத்துவர்கள்',
    'dashboard.doctors_subtitle': 'SNS மருத்துவக் கல்லூரி மற்றும் மருத்துவமனை நிபுணர்கள்',
    'dashboard.view_all_doctors': 'அனைத்து மருத்துவர்களையும் காண்க',
    'dashboard.book_slot': 'முன்பதிவு செய்',
    'dashboard.history_title': 'சந்திப்பு வரலாறு & அட்டவணை',
    'dashboard.reschedule': 'தேதியை மாற்றுக',
    'dashboard.cancel': 'சந்திப்பை ரத்து செய்',
    'dashboard.patient_id': 'நோயாளி ஐடி',
    'dashboard.back_to_dashboard': 'முகப்பு பக்கத்திற்கு திரும்புக',
    'dashboard.exp_years': 'ஆண்டுகள் அனுபவம்',
    'dashboard.emergency_title': 'உடனடி பராமரிப்பு & முன்னுரிமை ஆலோசனை',
    'dashboard.emergency_desc': 'வழக்கமான நேரங்கள் கிடைக்கவில்லை என்றால், அவசர பராமரிப்பிற்கான சிறப்பு மருத்துவரை உடனடியாக கோரலாம்.',
    'dashboard.emergency_button': 'முன்னுரிமை இடத்தை கோருக ⚡',
    'emergency.modal_title': 'உடனடி முன்னுரிமை மருத்துவர் கோரிக்கை',
    'emergency.select_doctor': 'மருத்துவரைத் தேர்ந்தெடுத்து விவரங்களைக் காண்க',
    'emergency.select_date': 'விருப்பமான தேதியைத் தேர்ந்தெடுக்கவும்',
    'emergency.priority_label': 'முன்னுரிமை நிலையைத் தேர்ந்தெடுக்கவும்',
    'emergency.priority_emergency': 'அவசரம் (உடனடி பராமரிப்பு)',
    'emergency.priority_high': 'உயர் முன்னுரிமை (அதே நாள்)',
    'emergency.priority_standard': 'சாதாரண முன்னுரிமை (24-48 மணிநேரம்)',
    'emergency.reason_label': 'முன்னுரிமை பதிவிற்கான காரணம்',
    'emergency.reason_placeholder': 'முன்னுரிமை சிகிச்சைக்கான காரணத்தை தட்டச்சு செய்க (எ.கா. கடுமையான காய்ச்சல், அவசர பரிசோதனை)...',
    'emergency.admin_note': 'நிர்வாகி சரிபார்ப்பு செயல்முறை: சமர்ப்பித்தவுடன், மருத்துவமனை நிர்வாகி மருத்துவரின் இருப்பை சரிபார்த்து தேர்ந்தெடுக்கப்பட்ட அவசர நிலைக்கு ஏற்ப உங்கள் நேரத்தை உறுதி செய்வார். உங்களுக்கு உடனடி உறுதிப்படுத்தல் செய்தி அனுப்பப்படும்.',
    'emergency.submit_button': 'நிர்வாகி சரிபார்ப்பிற்கு சமர்ப்பிக்கவும் 🚀',
    'emergency.success_title': 'அவசர கோரிக்கை நிர்வாகிக்கு சமர்ப்பிக்கப்பட்டது!',
    'emergency.success_desc': 'உங்கள் அவசர சிகிச்சை கோரிக்கை நிர்வாகிக்கு அனுப்பப்பட்டுள்ளது. சரிபார்க்கப்பட்டதும், உறுதிப்படுத்தல் செய்தியைப் பெறுவீர்கள்.'
  }

};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('carepilot_lang') as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('carepilot_lang', lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
