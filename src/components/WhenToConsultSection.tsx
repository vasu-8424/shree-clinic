import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  ExternalLink, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Languages, 
  X, 
  Volume2, 
  MessageSquare, 
  Activity, 
  PhoneCall, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export type LanguageCode = 'en' | 'te' | 'hi';

interface LanguageContent {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  tagline: string;
  heading: string;
  subheading: string;
  pdfTitle: string;
  pdfFilename: string;
  pdfDownloadText: string;
  pdfViewText: string;
  pdfSize: string;
  emergencyTitle: string;
  emergencyText: string;
  bookButtonText: string;
  disciplines: {
    id: 'audiology' | 'speech';
    title: string;
    subtitle: string;
    icon: 'audiology' | 'speech';
    accentColor: string;
    badgeBg: string;
    badgeText: string;
    symptoms: string[];
    recommendedAction: string;
  }[];
}

const CONSULT_DATA: Record<LanguageCode, LanguageContent> = {
  en: {
    code: 'en',
    label: 'English',
    nativeLabel: 'English',
    tagline: 'CLINICAL GUIDELINES & SYMPTOM RECOGNITION',
    heading: 'When Should You Consult Shree Clinic?',
    subheading: 'KNOW THE SIGNS • TAKE THE NEXT STEP',
    pdfTitle: 'Official Clinical Consultation Guide (English PDF)',
    pdfFilename: '/documents/When-to-Consult-English.pdf',
    pdfDownloadText: 'Download English Guide (PDF)',
    pdfViewText: 'View English Guide Online',
    pdfSize: '24 KB · Official Clinical PDF',
    emergencyTitle: 'Do not delay assessment',
    emergencyText: 'If you or your family member notice sudden hearing drop, or choking while swallowing liquids or meals, early clinical intervention within 48–72 hours is vital.',
    bookButtonText: 'Book Clinical Consultation',
    disciplines: [
      {
        id: 'audiology',
        title: 'Audiology & Hearing Care',
        subtitle: 'Hearing Loss, Tinnitus, Ear Fullness & Pediatric Sounds',
        icon: 'audiology',
        accentColor: 'border-[#053543] text-[#053543]',
        badgeBg: 'bg-[#053543] text-white',
        badgeText: 'Hearing Diagnostics',
        symptoms: [
          'Difficulty hearing in crowded or noisy surroundings (family dinners, traffic, restaurants).',
          'Frequently asking people to repeat words or feeling that people are mumbling.',
          'Constant ringing, buzzing, clicking, or hissing sounds in the ear (Tinnitus).',
          'Setting TV, phone, or radio volume noticeably higher than what family members prefer.',
          'Infants not startled by sudden loud claps or not turning to familiar voices by 6–9 months.',
          'Feeling of ear blockage, fluid fullness, unsteady balance, or sudden dizziness.'
        ],
        recommendedAction: 'Recommended: Pure Tone Audiometry (PTA) & Middle Ear Impedance in soundproof booth.'
      },
      {
        id: 'speech',
        title: 'Speech-Language Pathology',
        subtitle: 'Speech Delays, Articulation, Stammering & Swallowing',
        icon: 'speech',
        accentColor: 'border-[#0891b2] text-[#0891b2]',
        badgeBg: 'bg-[#0891b2] text-white',
        badgeText: 'Speech & Dysphagia',
        symptoms: [
          'Child not speaking single words by 15–18 months or fewer than 50 words by 2 years of age.',
          'Unclear speech pronunciation, repeating syllables/words, or struggling with stammering.',
          'Difficulty speaking, finding words, or slurred speech following a stroke or brain injury.',
          'Coughing, choking, wet voice, or throat clearing while swallowing liquids or meals (Dysphagia).',
          'Persistent hoarseness, breathy voice, vocal strain, or voice loss lasting more than 2 weeks.',
          'Difficulty with social eye contact, peer communication, or signs of developmental delay.'
        ],
        recommendedAction: 'Recommended: Comprehensive Speech-Language Evaluation or VitalStim® swallowing assessment.'
      }
    ]
  },
  te: {
    code: 'te',
    label: 'తెలుగు (Telugu)',
    nativeLabel: 'తెలుగు',
    tagline: 'క్లినికల్ మార్గదర్శకాలు & లక్షణాల వివరాలు',
    heading: 'శ్రీ క్లినిక్‌ను ఎప్పుడు సంప్రదించాలి?',
    subheading: 'సమస్యను ప్రారంభంలోనే గుర్తిస్తే వేగంగా నయం చేయవచ్చు. మా విభాగాల హెచ్చరిక సంకేతాలను తెలుసుకోండి.',
    pdfTitle: 'అధికారిక క్లినికల్ సంప్రదింపుల మార్గదర్శి (తెలుగు PDF)',
    pdfFilename: '/documents/When-to-Consult-Telugu.pdf',
    pdfDownloadText: 'తెలుగు గైడ్ డౌన్‌లోడ్ చేయండి (PDF)',
    pdfViewText: 'తెలుగు గైడ్ ఆన్‌లైన్‌లో చూడండి',
    pdfSize: '57 KB · అధికారిక క్లినికల్ PDF',
    emergencyTitle: 'పరీక్ష ఆలస్యం చేయవద్దు',
    emergencyText: 'మీలో లేదా మీ కుటుంబ సభ్యులలో ఆకస్మికంగా వినికిడి తగ్గడం లేదా ఆహారం మింగేటప్పుడు గొంతులో అడ్డుపడటం జరిగితే వెంటనే సంప్రదించండి.',
    bookButtonText: 'అపాయింట్‌మెంట్ బుక్ చేసుకోండి',
    disciplines: [
      {
        id: 'audiology',
        title: 'వినికిడి & ఆడియోలజీ విభాగం',
        subtitle: 'వినికిడి లోపం, చెవుల్లో హోరు, టిన్నిటస్ & పిల్లల వినికిడి',
        icon: 'audiology',
        accentColor: 'border-[#053543] text-[#053543]',
        badgeBg: 'bg-[#053543] text-white',
        badgeText: 'వినికిడి పరీక్షలు',
        symptoms: [
          'నలుగురిలో ఉన్నప్పుడు లేదా రద్దీగా ఉండే ప్రదేశాలలో మాటలు స్పష్టంగా వినపడకపోవడం.',
          'ఎదుటివారిని మాటిమాటికీ మళ్లీ చెప్పమని అడగడం లేదా వారు గొణుగుతున్నట్లు అనిపించడం.',
          'చెవుల్లో నిరంతరం ఈలలు వేసినట్లు, రింగింగ్ లేదా హోరు శబ్దాలు రావడం (టిన్నిటస్).',
          'ఇంట్లో ఇతరుల కంటే టీవీ లేదా ఫోన్ సౌండ్ ఎక్కువగా పెట్టుకుని వినడం.',
          'పుట్టిన పిల్లలు పెద్ద శబ్దాలకు ఉలిక్కిపడకపోవడం లేదా 6-9 నెలల వయస్సులో పిలిచినా స్పందించకపోవడం.',
          'చెవుల్లో బరువుగా ఉండటం లేదా నొప్పి అనిపించడం.'
        ],
        recommendedAction: 'సిఫార్సు: మా సౌండ్‌ప్రూఫ్ బూత్‌లో పూర్తి ప్యూర్ టోన్ ఆడియోమెట్రీ (PTA) పరీక్ష చేయించుకోండి.'
      },
      {
        id: 'speech',
        title: 'స్పీచ్ & లాంగ్వేజ్ పాథాలజీ',
        subtitle: 'మాటల ఆలస్యం, నత్తి, గొంతు సమస్యలు & ఆహారం మింగే ఇబ్బంది',
        icon: 'speech',
        accentColor: 'border-[#0891b2] text-[#0891b2]',
        badgeBg: 'bg-[#0891b2] text-white',
        badgeText: 'స్పీచ్ థెరపీ & మింగడం',
        symptoms: [
          'పిల్లలలో 1.5 - 2 సంవత్సరాలు దాటినా మాటలు రాకపోవడం లేదా తోటి పిల్లలతో పోలిస్తే ఆలస్యం కావడం.',
          'మాటలు ముద్దగా పలకడం, అక్షరాలు మింగేయడం లేదా మాట్లాడేటప్పుడు నత్తి (Stuttering) రావడం.',
          'పక్షవాతం (స్ట్రోక్) లేదా తలకు దెబ్బ తగిలిన తర్వాత మాట్లాడలేకపోవడం లేదా మాటలు తడబడటం (Aphasia).',
          'ఆహారం లేదా నీళ్లు మింగేటప్పుడు గొంతులో అడ్డుపడటం, దగ్గు రావడం లేదా ఉక్కిరిబిక్కిరి కావడం (Dysphagia).',
          'గొంతు బొంగురుపోవడం, వాయిస్ అలసిపోవడం లేదా 2 వారాల కంటే ఎక్కువ రోజులు మాట మారడం.',
          'పిల్లలలో దృష్టి కేంద్రీకరించకపోవడం, ఆటిజం లేదా ఇతరులతో కలవడానికి ఇబ్బంది పడటం.'
        ],
        recommendedAction: 'సిఫార్సు: స్పీచ్-లాంగ్వేజ్ పాథాలజిస్ట్‌తో పూర్తి అసెస్‌మెంట్ లేదా VitalStim® మింగే చికిత్స తీసుకోండి.'
      }
    ]
  },
  hi: {
    code: 'hi',
    label: 'हिन्दी (Hindi)',
    nativeLabel: 'हिन्दी',
    tagline: 'क्लिनिकल दिशानिर्देश एवं लक्षण पहचान',
    heading: 'श्री क्लिनिक से परामर्श कब लेना चाहिए?',
    subheading: 'शुरुआती अवस्था में पहचान से उपचार जल्दी और स्थायी होता है। चेतावनी लक्षणों को समझें।',
    pdfTitle: 'आधिकारिक क्लिनिकल परामर्श गाइड (हिन्दी PDF)',
    pdfFilename: '/documents/When-to-Consult-Hindi.pdf',
    pdfDownloadText: 'हिन्दी गाइड डाउनलोड करें (PDF)',
    pdfViewText: 'हिन्दी गाइड ऑनलाइन देखें',
    pdfSize: '45 KB · आधिकारिक क्लिनिकल PDF',
    emergencyTitle: 'जांच में देरी न करें',
    emergencyText: 'यदि आपको या आपके परिजन को अचानक सुनने में कमी या भोजन निगलने में दम घुटना महसूस हो, तो तुरंत क्लिनिकल परामर्श लें।',
    bookButtonText: 'परामर्श हेतु अपॉइंटमेंट लें',
    disciplines: [
      {
        id: 'audiology',
        title: 'ऑडियोलॉजी एवं श्रवण देखभाल',
        subtitle: 'कम सुनना, कानों में सीटी बजना, टिनिटस व बच्चों की जांच',
        icon: 'audiology',
        accentColor: 'border-[#053543] text-[#053543]',
        badgeBg: 'bg-[#053543] text-white',
        badgeText: 'श्रवण जांच',
        symptoms: [
          'भीड़-भाड़ या शोरगुल वाले माहौल में बातचीत सुनने या समझने में कठिनाई होना।',
          'दूसरों से बार-बार बात दोहराने को कहना या लगना कि लोग फुसफुसा रहे हैं।',
          'कानों में लगातार सीटी, घंटी या झींगुर जैसी आवाज़ें बजना (टिनिटस)।',
          'घर में दूसरों की तुलना में टीवी या मोबाइल की आवाज़ अत्यधिक तेज़ रखना।',
          'नवजात या छोटे बच्चे का तेज आवाज़ पर न चौंकना या 6-9 महीने में आवाज़ की ओर न देखना।',
          'कान में भारीपन या बंद कान महसूस होना।'
        ],
        recommendedAction: 'सलाह: हमारे आधुनिक साउंडप्रूफ बूथ में प्योर टोन ऑडियोमेट्री (PTA) टेस्ट कराएं।'
      },
      {
        id: 'speech',
        title: 'स्पीच-लैंग्वेज पैथोलॉजी',
        subtitle: 'बच्चों में बोलने में देरी, हकलाना, आवाज़ व निगलने की समस्या',
        icon: 'speech',
        accentColor: 'border-[#0891b2] text-[#0891b2]',
        badgeBg: 'bg-[#0891b2] text-white',
        badgeText: 'स्पीच एवं डिस्फेजिया',
        symptoms: [
          'बच्चे का 1.5 - 2 वर्ष की आयु तक बोलना शुरू न करना या शब्द बहुत कम बोलना।',
          'साफ उच्चारण न होना, तुतलाना या बोलते समय रुक-रुक कर हकलाना (Stuttering)।',
          'स्ट्रोक (लकवा) या सिर की चोट के बाद बोलने में असमर्थता या आवाज़ लड़खड़ाना (Aphasia)।',
          'खाना या पानी निगलते समय खांसी आना, गले में अटकना या सांस फूलना (Dysphagia)।',
          'आवाज़ का भारी होना, बैठ जाना या 2 हफ्तों से अधिक समय तक गले में खिंचाव रहना।',
          'बच्चे में सामाजिक संवाद की कमी या ऑटिज्म संबंधी लक्षण दिखना।'
        ],
        recommendedAction: 'सलाह: विशेषज्ञ स्पीच-लैंग्वेज पैथोलॉजिस्ट से परामर्श लें या VitalStim® स्वैलोइंग थेरेपी कराएं।'
      }
    ]
  }
};

interface WhenToConsultSectionProps {
  onBookDepartment?: (departmentId: string) => void;
}

export const WhenToConsultSection: React.FC<WhenToConsultSectionProps> = ({ onBookDepartment }) => {
  const [selectedLang, setSelectedLang] = useState<LanguageCode>('en');
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const currentContent = CONSULT_DATA[selectedLang];

  const handleBookAppointment = (disciplineId: string) => {
    if (onBookDepartment) {
      onBookDepartment(disciplineId);
    } else {
      const el = document.getElementById('contact');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="when-to-consult" className="py-20 md:py-28 bg-[#fdfbf7] relative border-t border-neutral-200/80">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* SECTION HEADER & MULTI-LANGUAGE SWITCHER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-[11px] font-mono font-bold tracking-wider text-[#053543] mb-3 uppercase">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>{currentContent.tagline}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0b3037] tracking-tight">
              {currentContent.heading}
            </h2>
            <p className="text-xs sm:text-sm font-semibold tracking-wide text-neutral-500 mt-2 uppercase">
              {currentContent.subheading}
            </p>
          </div>

          {/* LANGUAGE PILL SELECTOR */}
          <div className="flex items-center gap-1.5 p-1.5 bg-white rounded-2xl border border-neutral-200 shadow-xs shrink-0 self-start md:self-auto">
            {(['en', 'te', 'hi'] as LanguageCode[]).map((code) => {
              const lang = CONSULT_DATA[code];
              const isSelected = selectedLang === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => setSelectedLang(code)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#053543] text-white shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }`}
                >
                  <span>{lang.nativeLabel}</span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-teal-300" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* CLINICAL PDF DOWNLOAD & PREVIEW BANNER */}
        <div className="mb-12 p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-[#053543] to-[#085a6b] text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
              <FileText className="w-6 h-6 text-teal-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {currentContent.pdfTitle}
                </h3>
                <span className="hidden sm:inline-block text-[10px] font-mono uppercase bg-teal-400/20 text-teal-200 px-2 py-0.5 rounded-md border border-teal-300/30">
                  Free
                </span>
              </div>
              <p className="text-xs text-teal-100/90 mt-0.5 font-medium">
                {currentContent.pdfSize} • Available in English, Telugu &amp; Hindi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setViewModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-[#053543] text-xs font-bold hover:bg-teal-50 transition-all shadow-xs cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>{currentContent.pdfViewText}</span>
            </button>

            <a
              href={currentContent.pdfFilename}
              download
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all border border-white/30 backdrop-blur-xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{currentContent.pdfDownloadText}</span>
            </a>
          </div>
        </div>

        {/* SPECIALTY SYMPTOM CARDS IN CHOSEN LANGUAGE */}
        <div className="grid grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto gap-6 md:gap-8 items-stretch">
          {currentContent.disciplines.map((item) => {
            const isAudiology = item.id === 'audiology';
            const isSpeech = item.id === 'speech';

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl p-6 sm:p-7 border-2 ${
                  isAudiology ? 'border-teal-200/90 hover:border-[#053543]' : 'border-cyan-200/90 hover:border-[#0891b2]'
                } shadow-sm hover:shadow-md transition-all flex flex-col justify-between`}
              >
                <div>
                  {/* CARD HEADER */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="shrink-0 flex items-center justify-center transition-transform duration-300 hover:scale-110">
                        {isAudiology && <Volume2 className="w-8 h-8 text-[#053543]" />}
                        {isSpeech && <MessageSquare className="w-8 h-8 text-[#0891b2]" />}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-neutral-900 leading-tight">
                          {item.title}
                        </h3>
                        <span className="text-[11px] font-mono text-neutral-500 block">
                          {item.badgeText}
                        </span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${item.badgeBg}`}>
                      {selectedLang.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-600 mb-5 font-medium leading-relaxed">
                    {item.subtitle}
                  </p>

                  {/* SYMPTOMS CHECKLIST */}
                  <div className="space-y-2.5 mb-6">
                    <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                      Warning Signs to Notice:
                    </div>
                    <ul className="space-y-2.5">
                      {item.symptoms.map((sym, sIdx) => (
                        <li key={sIdx} className="flex items-start gap-2.5 text-xs text-neutral-700 leading-snug">
                          <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${
                            isAudiology ? 'text-[#053543]' : 'text-[#0891b2]'
                          }`} />
                          <span>{sym}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* CARD FOOTER: RECOMMENDED ACTION & BOOKING BUTTON */}
                <div className="pt-5 border-t border-neutral-100 flex flex-col gap-3">
                  <div className="bg-stone-50 rounded-xl p-3 border border-neutral-200/80 text-[11px] font-medium text-neutral-700 leading-relaxed">
                    {item.recommendedAction}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleBookAppointment(item.id)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                      isAudiology
                        ? 'bg-[#053543] hover:bg-[#0891b2] text-white'
                        : 'bg-[#0891b2] hover:bg-[#053543] text-white'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{currentContent.bookButtonText}</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* EMERGENCY / URGENT CARE ALERT BOX */}
        <div className="mt-12 max-w-5xl mx-auto p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start sm:items-center gap-3.5">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5 sm:mt-0" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <span className="font-bold mr-1.5">{currentContent.emergencyTitle}:</span>
            <span>{currentContent.emergencyText}</span>
          </div>
        </div>

      </div>

      {/* PDF VIEWER MODAL */}
      {viewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-[#053543]" />
                <h4 className="text-sm sm:text-base font-bold text-neutral-900">
                  {currentContent.pdfTitle}
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={currentContent.pdfFilename}
                  download
                  className="px-3 py-1.5 rounded-xl bg-[#053543] text-white text-xs font-bold hover:bg-[#0891b2] transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
                <button
                  type="button"
                  onClick={() => setViewModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-neutral-200 text-neutral-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 w-full bg-neutral-100 p-2 sm:p-4 overflow-hidden flex items-center justify-center min-h-[450px]">
              <iframe
                src={`${currentContent.pdfFilename}#toolbar=0`}
                title={currentContent.pdfTitle}
                className="w-full h-full min-h-[450px] rounded-xl border border-neutral-200 shadow-inner bg-white"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
