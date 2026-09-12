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
    'welcome.institution': 'Run by SNS Medical College and Hospital',
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
    'book.prev_step': 'Back to Selection'
  },
  ta: {
    // Header & Navigation
    'nav.dashboard': 'முகப்புப்பக்கம் (டாஷ்போர்டு)',
    'nav.appointments': 'சந்திப்புகள்',
    'nav.patients': 'நோயாளிகள் விவரம்',
    'nav.doctors': 'மருத்துவர்கள்',
    'nav.analytics': 'பகுப்பாய்வு & அறிக்கைகள்',
    'nav.waitlist': 'காத்திருப்புப் பட்டியல்',
    'nav.notifications': 'அறிவிப்புகள்',
    'nav.availability': 'மருத்துவர் நேர அட்டவணை',
    'nav.my_appointments': 'எனது சந்திப்புகள்',
    'nav.book_appointment': 'சந்திப்பு பதிவு செய்ய',
    'nav.profile': 'எனது சுயவிவரம்',
    'nav.logout': 'வெளியேறு',

    // Branding & Welcome
    'welcome.title': 'CarePilot SNS-க்கு நல்வரவு',
    'welcome.institution': 'SNS மருத்துவக் கல்லூரி மற்றும் மருத்துவமனை',
    'welcome.portal': 'நோயாளி நல மையம்',
    'welcome.good_morning': 'காலை வணக்கம்',
    'welcome.hello': 'வணக்கம்',

    // Actions & Buttons
    'action.book': 'சந்திப்பு பதிவு செய்ய',
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
    'book.prev_step': 'முந்தைய நிலை'
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
