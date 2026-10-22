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
import { PhysiotherapyIcon } from './PhysiotherapyIcon';

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
    id: 'audiology' | 'speech' | 'physio';
    title: string;
    subtitle: string;
    icon: 'audiology' | 'speech' | 'physio';
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
    heading: 'When Should You Consult Us?',
    subheading: 'KNOW THE SIGNS • TAKE THE NEXT STEP',
    pdfTitle: 'Official Clinical Consultation Guide (English PDF)',
    pdfFilename: '/documents/When-to-Consult-English.pdf',
    pdfDownloadText: 'Download English Guide (PDF)',
    pdfViewText: 'View English Guide Online',
    pdfSize: '24 KB · Official Clinical PDF',
    emergencyTitle: 'Do not delay assessment',
    emergencyText: 'If you or your family member notice sudden hearing drop, choking while eating, or severe radiating nerve pain, early clinical intervention within 48–72 hours is vital.',
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
      },
      {
        id: 'physio',
        title: 'Physiotherapy & Mobility',
        subtitle: 'Spine, Knee Joints, Posture, Sciatica & Post-Op Rehab',
        icon: 'physio',
        accentColor: 'border-[#65a30d] text-[#65a30d]',
        badgeBg: 'bg-[#65a30d] text-white',
        badgeText: 'Physical Rehabilitation',
        symptoms: [
          'Persistent neck, mid-back, or lower back pain lasting more than 7–10 days without relief.',
          'Knee joint pain, swelling, grinding sensations, or stiffness when climbing stairs.',
          'Radiating sharp pain, tingling, numbness, or "electric current" feeling down the legs (Sciatica).',
          'Shoulder stiffness, inability to raise arm overhead, or sleep disturbed by shoulder pain (Frozen Shoulder).',
          'Joint stiffness after fracture, orthopedic surgery, sports ligament sprain, or tendon strain.',
          'Balance unsteady while walking, fear of falling, or age-related mobility decline in seniors.'
        ],
        recommendedAction: 'Recommended: Biomechanical movement screening & personalized targeted rehabilitation.'
      }
    ]
  },
  te: {
    code: 'te',
    label: 'తెలుగు (Telugu)',
    nativeLabel: 'తెలుగు',
    tagline: 'క్లినికల్ మార్గదర్శకాలు & లక్షణాల వివరాలు',
    heading: 'వైద్యుడిని ఎప్పుడు సంప్రదించాలి?',
    subheading: 'సమస్యను ప్రారంభంలోనే గుర్తిస్తే వేగంగా మరియు శాశ్వతంగా నయం చేయవచ్చు. మా మూడు విభాగాల హెచ్చరిక సంకేతాలను తెలుసుకోండి మరియు అధికారిక తెలుగు PDF గైడ్‌ను ఉచితంగా డౌన్‌లోడ్ చేసుకోండి.',
    pdfTitle: 'అధికారిక క్లినికల్ సంప్రదింపుల మార్గదర్శి (తెలుగు PDF)',
    pdfFilename: '/documents/When-to-Consult-Telugu.pdf',
    pdfDownloadText: 'తెలుగు గైడ్ డౌన్‌లోడ్ చేయండి (PDF)',
    pdfViewText: 'తెలుగు గైడ్ ఆన్‌లైన్‌లో చూడండి',
    pdfSize: '57 KB · అధికారిక క్లినికల్ PDF',
    emergencyTitle: 'పరీక్ష ఆలస్యం చేయవద్దు',
    emergencyText: 'మీలో లేదా మీ కుటుంబ సభ్యులలో ఆకస్మికంగా వినికిడి తగ్గడం, ఆహారం మింగేటప్పుడు గొంతులో అడ్డుపడటం, లేదా నరాల తీవ్రమైన నొప్పి ఉంటే 48–72 గంటలలోపు డాక్టర్‌ను సంప్రదించడం చాలా ముఖ్యం.',
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
          'చెవుల్లో బరువుగా ఉండటం, నొప్పి లేదా తల తిరిగినట్లు (వర్టిగో) అనిపించడం.'
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
      },
      {
        id: 'physio',
        title: 'ఫిజియోథెరపీ & పునరావాసం',
        subtitle: 'వెన్నునొప్పి, మోకాళ్ల నొప్పులు, సయాటికా & కీళ్ల సమస్యలు',
        icon: 'physio',
        accentColor: 'border-[#65a30d] text-[#65a30d]',
        badgeBg: 'bg-[#65a30d] text-white',
        badgeText: 'ఫిజియోథెరపీ కేర్',
        symptoms: [
          'నిరంతర మెడ నొప్పి, నడుము నొప్పి లేదా వెన్ను సమస్యలు 7-10 రోజులకు మించి తగ్గకపోవడం.',
          'మోకాళ్ల నొప్పులు, కీళ్ల వాపు లేదా మెట్లు ఎక్కేటప్పుడు, కూర్చుని లేచేటప్పుడు తీవ్ర నొప్పి రావడం.',
          'నడుము నుంచి కాళ్ళ వరకు తిమ్మిర్లు, మంటలు లేదా లాగినట్లు ఉండటం (సయాటికా).',
          'భుజం గట్టిపడిపోవడం, చేతులు పైకి ఎత్తలేకపోవడం లేదా చేతి కదలికలు తగ్గిపోవడం (ఫ్రోజెన్ షోల్డర్).',
          'ఆపరేషన్ల తర్వాత లేదా ఆటలలో తగిలిన గాయాల తర్వాత కీళ్లు బిగుసుకుపోవడం.',
          'వయస్సు పైబడిన వారిలో నడక సరిగ్గా లేకపోవడం, బ్యాలెన్స్ తప్పడం లేదా తరచూ పడిపోయే ప్రమాదం ఉండటం.'
        ],
        recommendedAction: 'సిఫార్సు: శాస్త్రీయ మూవ్‌మెంట్ అసెస్‌మెంట్ చేయించుకుని టార్గెటెడ్ ఫిజియోథెరపీ ప్లాన్ ప్రారంభించండి.'
      }
    ]
  },
  hi: {
    code: 'hi',
    label: 'हिन्दी (Hindi)',
    nativeLabel: 'हिन्दी',
    tagline: 'क्लिनिकल दिशानिर्देश एवं लक्षण पहचान',
    heading: 'डॉक्टर से परामर्श कब लेना चाहिए?',
    subheading: 'शुरुआती अवस्था में पहचान से उपचार जल्दी और स्थायी होता है। हमारे तीनों विभागों के चेतावनी लक्षणों को समझें और अपनी भाषा में आधिकारिक पीडीएफ गाइड प्राप्त करें।',
    pdfTitle: 'आधिकारिक क्लिनिकल परामर्श गाइड (हिन्दी PDF)',
    pdfFilename: '/documents/When-to-Consult-Hindi.pdf',
    pdfDownloadText: 'हिन्दी गाइड डाउनलोड करें (PDF)',
    pdfViewText: 'हिन्दी गाइड ऑनलाइन देखें',
    pdfSize: '45 KB · आधिकारिक क्लिनिकल PDF',
    emergencyTitle: 'जांच में देरी न करें',
    emergencyText: 'यदि आपको या आपके परिजन को अचानक सुनने में कमी, भोजन निगलने में दम घुटना या नसों का तेज दर्द हो, तो 48–72 घंटे के भीतर क्लिनिकल परामर्श अत्यंत आवश्यक है।',
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
          'कान में भारीपन, बंद कान महसूस होना या चक्कर (वर्टिगो) आना।'
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
      },
      {
        id: 'physio',
        title: 'फिजियोथेरेपी एवं पुनर्वास',
        subtitle: 'कमर-गर्दन दर्द, घुटनों का दर्द, साइटिका व जोड़ पुनर्वास',
        icon: 'physio',
        accentColor: 'border-[#65a30d] text-[#65a30d]',
        badgeBg: 'bg-[#65a30d] text-white',
        badgeText: 'फिजियोथेरेपी देखभाल',
        symptoms: [
          'गर्दन, कमर या पीठ का पुराना दर्द जो 7–10 दिनों से अधिक समय से बना हुआ हो।',
          'घुटनों व जोड़ों में सूजन, दर्द, सीढ़ियां चढ़ने में परेशानी या आर्थराइटिस।',
          'कमर से पैरों तक झनझनाहट, सुन्नपन या करंट जैसा दर्द जाना (साइटिका)।',
          'कंधे में जकड़न या हाथ ऊपर उठाने में असमर्थता (फ्रोजन शोल्डर)।',
          'सर्जरी के बाद जोड़ों का जाम होना या खेल-कूद की चोटों का पुनर्वास।',
          'बुजुर्गों में चलने में लड़खड़ाहट, संतुलन की कमी या बार-बार गिरने का डर।'
        ],
        recommendedAction: 'सलाह: विस्तृत बायोमैकेनिकल जांच कराएं और लक्षित फिजियोथेरेपी व्यायाम शुरू करें।'
      }
    ]
  }
};

interface WhenToConsultSectionProps {
  onBookClick?: (discipline?: string) => void;
}

export const WhenToConsultSection: React.FC<WhenToConsultSectionProps> = ({ onBookClick }) => {
  const [selectedLang, setSelectedLang] = useState<LanguageCode>('en');
  const [activePdfModal, setActivePdfModal] = useState<string | null>(null);

  const currentContent = CONSULT_DATA[selectedLang];

  const handleBookAppointment = (disciplineId: string) => {
    if (onBookClick) {
      onBookClick(disciplineId);
    } else {
      const contactEl = document.getElementById('contact');
      if (contactEl) {
        contactEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section 
      id="when-to-consult" 
      className="py-20 md:py-28 px-3 md:px-6 max-w-[1440px] mx-auto relative z-10 scroll-mt-20"
    >
      {/* SECTION HEADER & LANGUAGE SELECTOR */}
      <div className="bg-gradient-to-br from-stone-50 via-white to-stone-50 rounded-3xl border border-neutral-200/90 shadow-xs p-6 md:p-10 mb-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-neutral-200/80">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#053543]/10 text-[#053543] text-xs font-mono font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                {currentContent.tagline}
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-neutral-900 tracking-tight leading-tight">
              {currentContent.heading}
            </h2>
            <p className="text-sm md:text-base text-neutral-700 mt-2.5 max-w-2xl font-semibold tracking-wide leading-relaxed">
              {currentContent.subheading}
            </p>
          </div>

          {/* LANGUAGE SELECTOR PILLS */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 bg-white p-2 rounded-2xl border border-neutral-200 shadow-sm shrink-0">
            <div className="flex items-center gap-1.5 px-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
              <Languages className="w-4 h-4 text-[#0891b2]" />
              <span>Language:</span>
            </div>
            <div className="grid grid-cols-3 sm:flex items-center gap-1.5 w-full sm:w-auto">
              {(['en', 'te', 'hi'] as LanguageCode[]).map((code) => {
                const isSelected = selectedLang === code;
                const langObj = CONSULT_DATA[code];
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setSelectedLang(code)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-[#053543] text-white shadow-sm ring-2 ring-[#053543]/30 scale-102'
                        : 'bg-stone-100 hover:bg-stone-200 text-neutral-700'
                    }`}
                  >
                    <span>{langObj.nativeLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* OFFICIAL PDF DOWNLOAD BANNER IN CHOSEN LANGUAGE */}
        <div className="mt-8 bg-gradient-to-r from-[#053543] via-[#0b4756] to-[#0891b2] rounded-2xl p-5 md:p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                  {currentContent.pdfSize}
                </span>
                <span className="text-xs text-white/80 font-medium">Verified Medical Document</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                {currentContent.pdfTitle}
              </h3>
              <p className="text-xs text-white/80 mt-0.5">
                Full checklist with symptoms, tests required, and appointment preparation.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setActivePdfModal(currentContent.pdfFilename)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-[#053543] hover:bg-stone-100 text-xs font-bold transition-all shadow-sm cursor-pointer"
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
      </div>

      {/* THREE SPECIALTY SYMPTOM CARDS IN CHOSEN LANGUAGE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-stretch">
        {currentContent.disciplines.map((item) => {
          const isAudiology = item.id === 'audiology';
          const isSpeech = item.id === 'speech';
          const isPhysio = item.id === 'physio';

          return (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-neutral-200/90 shadow-sm p-6 sm:p-7 flex flex-col justify-between transition-all hover:shadow-md hover:border-neutral-300"
            >
              <div>
                {/* CARD HEADER */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isAudiology ? 'bg-[#053543]/10 text-[#053543]' : isSpeech ? 'bg-[#0891b2]/10 text-[#0891b2]' : 'bg-[#65a30d]/10 text-[#65a30d]'
                    }`}>
                      {isAudiology && <Volume2 className="w-5 h-5" />}
                      {isSpeech && <MessageSquare className="w-5 h-5" />}
                      {isPhysio && <PhysiotherapyIcon className="w-5 h-5" />}
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
                          isAudiology ? 'text-[#053543]' : isSpeech ? 'text-[#0891b2]' : 'text-[#65a30d]'
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
                      : isSpeech
                      ? 'bg-[#0891b2] hover:bg-[#053543] text-white'
                      : 'bg-[#65a30d] hover:bg-[#4d7c0f] text-white'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{currentContent.bookButtonText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* BOTTOM CLINICAL ADVICE CALLOUT */}
      <div className="mt-8 bg-amber-50/80 rounded-2xl border border-amber-200/80 p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-900 flex items-center justify-center shrink-0 mt-0.5">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-amber-950">
              {currentContent.emergencyTitle}
            </h4>
            <p className="text-xs text-amber-800 mt-0.5 leading-relaxed font-medium">
              {currentContent.emergencyText}
            </p>
          </div>
        </div>

        <a
          href="tel:+919949961044"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-900 hover:bg-amber-950 text-white text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Call: +91 99499 61044</span>
        </a>
      </div>

      {/* FULLSCREEN / EMBEDDED PDF VIEWER MODAL */}
      {activePdfModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 md:p-6"
          onClick={() => setActivePdfModal(null)}
        >
          <div 
            className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-neutral-200 w-full max-w-4xl h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="px-5 py-3.5 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white">
                    {currentContent.pdfTitle}
                  </h3>
                  <span className="text-[10px] font-mono text-stone-400">
                    PDF Document · {selectedLang.toUpperCase()} Version
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={activePdfModal}
                  download
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </a>
                <a
                  href={activePdfModal}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">New Tab</span>
                </a>
                <button
                  type="button"
                  onClick={() => setActivePdfModal(null)}
                  className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white transition-colors cursor-pointer"
                  title="Close viewer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* EMBEDDED PDF IFRAME / OBJECT */}
            <div className="flex-1 w-full h-full bg-stone-100 relative">
              <iframe
                src={`${activePdfModal}#toolbar=1&navpanes=0`}
                className="w-full h-full border-0"
                title="Clinical Guideline PDF Viewer"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
