import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const outDir = path.resolve('public', 'documents');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const baseCss = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+Telugu:wght@400;600;700&family=Noto+Sans+Devanagari:wght@400;600;700&display=swap');
  @page {
    size: A4;
    margin: 14mm 12mm;
  }
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  body {
    font-family: 'Inter', 'Noto Sans Telugu', 'Noto Sans Devanagari', -apple-system, sans-serif;
    color: #1c1917;
    background: #ffffff;
    font-size: 11pt;
    line-height: 1.5;
  }
  .header {
    border-bottom: 2px solid #053543;
    padding-bottom: 12px;
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .clinic-title {
    font-size: 20pt;
    font-weight: 800;
    color: #053543;
    letter-spacing: -0.5px;
  }
  .clinic-subtitle {
    font-size: 10pt;
    color: #0891b2;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .clinic-contact {
    text-align: right;
    font-size: 9pt;
    color: #44403c;
    line-height: 1.35;
  }
  .doc-title-box {
    background: linear-gradient(135deg, #053543, #0891b2);
    color: #ffffff;
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 16px;
  }
  .doc-title {
    font-size: 15pt;
    font-weight: 700;
  }
  .doc-desc {
    font-size: 9.5pt;
    opacity: 0.92;
    margin-top: 3px;
  }
  .section-card {
    border: 1px solid #e7e5e4;
    border-radius: 8px;
    padding: 12px 14px;
    margin-bottom: 12px;
    page-break-inside: avoid;
  }
  .section-head {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    padding-bottom: 6px;
    border-bottom: 1.5px solid #f5f5f4;
  }
  .badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 8.5pt;
    font-weight: 700;
    text-transform: uppercase;
    color: #fff;
  }
  .badge-audio { background: #053543; }
  .badge-speech { background: #0891b2; }
  .badge-physio { background: #65a30d; }
  .section-title {
    font-size: 12.5pt;
    font-weight: 700;
    color: #0c0a09;
  }
  .symptom-list {
    list-style: none;
    display: grid;
    grid-template-columns: 1fr;
    gap: 6px;
  }
  .symptom-item {
    font-size: 9.5pt;
    color: #292524;
    display: flex;
    align-items: flex-start;
    gap: 6px;
    line-height: 1.4;
  }
  .symptom-bullet {
    color: #0891b2;
    font-weight: bold;
    flex-shrink: 0;
  }
  .advice-box {
    margin-top: 8px;
    background: #f0fdf4;
    border-left: 3px solid #16a34a;
    padding: 6px 10px;
    font-size: 9pt;
    color: #14532d;
    font-weight: 600;
    border-radius: 0 4px 4px 0;
  }
  .footer {
    margin-top: 14px;
    padding-top: 10px;
    border-top: 1px solid #e7e5e4;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 8.5pt;
    color: #78716c;
  }
  .action-callout {
    background: #fafaf9;
    border: 1px dashed #d6d3d1;
    border-radius: 6px;
    padding: 8px 12px;
    margin-top: 10px;
    text-align: center;
    font-size: 9pt;
    font-weight: 600;
    color: #053543;
  }
`;

const docs = [
  {
    lang: 'English',
    filename: 'when-to-consult-english.pdf',
    title: 'When to Consult a Specialist',
    subtitle: 'Official Clinical Assessment Guidelines & Warning Signs Checklist',
    headerTitle: 'SHREE MULTIDISCIPLINARY HEALTHCARE',
    headerSub: 'Audiology · Speech Language Pathology · Physiotherapy',
    contact: 'Opp. RTC Bus Stand, Anantapur - 515001<br/>Phone: +91 99499 61044 | 08554 355088<br/>Web: www.shreeclinic.org',
    sections: [
      {
        badge: 'Audiology',
        badgeClass: 'badge-audio',
        title: 'Department of Audiology & Hearing Science',
        items: [
          'Difficulty hearing in crowded or noisy surroundings (restaurants, family gatherings).',
          'Frequently asking others to repeat words or feeling like people are mumbling.',
          'Ringing, buzzing, or hissing sounds in one or both ears (Tinnitus).',
          'Turning television, phone, or radio volume noticeably higher than family members.',
          'Newborn or infant not startled by loud noises or not turning toward familiar voices by 6-9 months.',
          'Feeling of ear fullness, blocked ears, balance imbalance, or recurrent dizziness.'
        ],
        advice: 'Recommended Action: Book a Pure Tone Audiometry (PTA) assessment inside our soundproof booth.'
      },
      {
        badge: 'Speech Therapy',
        badgeClass: 'badge-speech',
        title: 'Department of Speech-Language Pathology',
        items: [
          'Child delayed in speaking first words by 15-18 months or speaking fewer than 50 words by age 2.',
          'Unclear pronunciation, difficulty forming sentences, or repeating syllables/words (Stuttering/Stammering).',
          'Difficulty communicating, understanding words, or slurred speech following a stroke (Aphasia/Dysarthria).',
          'Choking, coughing, or throat clearing while eating food or drinking liquids (Dysphagia).',
          'Persistent hoarseness, breathiness, vocal strain, or loss of voice lasting more than 2 weeks.',
          'Child having difficulty socializing or showing communication withdrawal.'
        ],
        advice: 'Recommended Action: Schedule a clinical speech-language evaluation or VitalStim® swallowing assessment.'
      },
      {
        badge: 'Physiotherapy',
        badgeClass: 'badge-physio',
        title: 'Department of Physiotherapy & Rehabilitation',
        items: [
          'Persistent neck, back, or lumbar spine pain persisting more than 7–10 days.',
          'Knee joint pain, swelling, or difficulty climbing stairs due to arthritis or wear.',
          'Radiating pain, numbness, or tingling down legs/arms (Sciatica / Cervical Radiculopathy).',
          'Shoulder stiffness or restricted movement limiting reaching overhead (Frozen Shoulder).',
          'Post-surgical stiffness, sports ligament injuries, or tendon strain requiring structured rehab.',
          'Balance unsteady or frequent near-falls among senior adults requiring gait retraining.'
        ],
        advice: 'Recommended Action: Undergo a biomechanical movement assessment and targeted therapeutic rehabilitation plan.'
      }
    ],
    callout: 'Appointments & Emergency Guidance: Call +91 99499 61044 or visit Shree Clinic directly for comprehensive evaluation.'
  },
  {
    lang: 'Telugu',
    filename: 'when-to-consult-telugu.pdf',
    title: 'వైద్యుడిని ఎప్పుడు సంప్రదించాలి? (క్లినికల్ మార్గదర్శకాలు)',
    subtitle: 'వినికిడి, స్పీచ్ థెరపీ మరియు ఫిజియోథెరపీ లక్షణాలు & హెచ్చరిక సంకేతాలు',
    headerTitle: 'శ్రీ మల్టీడిసిప్లినరీ హెల్త్‌కేర్ క్లినిక్',
    headerSub: 'ఆడియోలజీ · స్పీచ్ లాంగ్వేజ్ పాథాలజీ · ఫిజియోథెరపీ',
    contact: 'RTC బస్టాండ్ ఎదురుగా, అనంతపురం - 515001<br/>ఫోన్: +91 99499 61044 | 08554 355088<br/>వెబ్‌సైట్: www.shreeclinic.org',
    sections: [
      {
        badge: 'ఆడియోలజీ',
        badgeClass: 'badge-audio',
        title: 'వినికిడి & ఆడియోలజీ విభాగం (Audiology)',
        items: [
          'రద్దీగా ఉండే ప్రదేశాలలో లేదా నలుగురిలో ఉన్నప్పుడు ఇతరుల మాటలు స్పష్టంగా వినపడకపోవడం.',
          'ఎదుటివారిని మాటిమాటికీ మళ్లీ చెప్పమని అడగడం లేదా వారు గొణుగుతున్నట్లు అనిపించడం.',
          'చెవుల్లో నిరంతరం ఈలలు వేసినట్లు, రింగింగ్ లేదా హోరు శబ్దాలు రావడం (టిన్నిటస్).',
          'ఇంట్లో ఇతరుల కంటే టీవీ లేదా ఫోన్ సౌండ్ ఎక్కువగా పెట్టుకుని వినడం.',
          'పుట్టిన పిల్లలు పెద్ద శబ్దాలకు ఉలిక్కిపడకపోవడం లేదా 6-9 నెలల వయస్సులో పిలిచినా స్పందించకపోవడం.',
          'చెవుల్లో బరువుగా ఉండటం, నొప్పి లేదా తల తిరిగినట్లు (వర్టిగో) అనిపించడం.'
        ],
        advice: 'సూచించిన చర్య: మా సౌండ్‌ప్రూఫ్ బూత్‌లో పూర్తి ప్యూర్ టోన్ ఆడియోమెట్రీ (PTA) పరీక్ష చేయించుకోండి.'
      },
      {
        badge: 'స్పీచ్ థెరపీ',
        badgeClass: 'badge-speech',
        title: 'స్పీచ్ & లాంగ్వేజ్ పాథాలజీ విభాగం (Speech Therapy)',
        items: [
          'పిల్లలలో 1.5 - 2 సంవత్సరాలు దాటినా మాటలు రాకపోవడం లేదా తోటి పిల్లలతో పోలిస్తే ఆలస్యం కావడం.',
          'మాటలు ముద్దగా పలకడం, అక్షరాలు మింగేయడం లేదా మాట్లాడేటప్పుడు నత్తి (Stuttering) రావడం.',
          'పక్షవాతం (స్ట్రోక్) లేదా తలకు దెబ్బ తగిలిన తర్వాత మాట్లాడలేకపోవడం లేదా మాటలు తడబడటం (Aphasia).',
          'ఆహారం లేదా నీళ్లు మింగేటప్పుడు గొంతులో అడ్డుపడటం, దగ్గు రావడం లేదా ఉక్కిరిబిక్కిరి కావడం (Dysphagia).',
          'గొంతు బొంగురుపోవడం, వాయిస్ అలసిపోవడం లేదా 2 వారాల కంటే ఎక్కువ రోజులు మాట మారడం.',
          'పిల్లలలో దృష్టి కేంద్రీకరించకపోవడం, ఆటిజం లేదా ఇతరులతో కలవడానికి ఇబ్బంది పడటం.'
        ],
        advice: 'సూచించిన చర్య: మా స్పీచ్-లాంగ్వేజ్ పాథాలజిస్ట్‌తో పూర్తి అసెస్‌మెంట్ లేదా VitalStim® మింగే చికిత్స తీసుకోండి.'
      },
      {
        badge: 'ఫిజియోథెరపీ',
        badgeClass: 'badge-physio',
        title: 'ఫిజియోథెరపీ & పునరావాస విభాగం (Physiotherapy)',
        items: [
          'నిరంతర మెడ నొప్పి, నడుము నొప్పి లేదా వెన్నుపాము సమస్యలు 7-10 రోజులకు మించి తగ్గకపోవడం.',
          'మోకాళ్ల నొప్పులు, కీళ్ల వాపు లేదా మెట్లు ఎక్కేటప్పుడు, కూర్చుని లేచేటప్పుడు తీవ్ర నొప్పి రావడం.',
          'నడుము నుంచి కాళ్ళ వరకు తిమ్మిర్లు, మంటలు లేదా లాగినట్లు ఉండటం (సయాటికా).',
          'భుజం గట్టిపడిపోవడం, చేతులు పైకి ఎత్తలేకపోవడం లేదా చేతి కదలికలు తగ్గిపోవడం (ఫ్రోజెన్ షోల్డర్).',
          'ఆపరేషన్ల తర్వాత లేదా ఆటలలో తగిలిన గాయాల తర్వాత కీళ్లు బిగుసుకుపోవడం.',
          'వయస్సు పైబడిన వారిలో నడక సరిగ్గా లేకపోవడం, బ్యాలెన్స్ తప్పడం లేదా తరచూ పడిపోయే ప్రమాదం ఉండటం.'
        ],
        advice: 'సూచించిన చర్య: శాస్త్రీయ మూవ్‌మెంట్ అసెస్‌మెంట్ చేయించుకుని టార్గెటెడ్ ఫిజియోథెరపీ ప్లాన్ ప్రారంభించండి.'
      }
    ],
    callout: 'అపాయింట్‌మెంట్స్ & సహాయం కోసం: +91 99499 61044 కి కాల్ చేయండి లేదా నేరుగా శ్రీ క్లినిక్ సందర్శించండి.'
  },
  {
    lang: 'Hindi',
    filename: 'when-to-consult-hindi.pdf',
    title: 'डॉक्टर से परामर्श कब लें? (क्लिनिकल गाइडलाइन)',
    subtitle: 'ऑडियोलॉजी, स्पीच थेरेपी और फिजियोथेरेपी के लिए लक्षण व चेतावनी संकेत',
    headerTitle: 'श्री मल्टीडिसिप्लिनरी हेल्थकेयर क्लीनिक',
    headerSub: 'ऑडियोलॉजी · स्पीच लैंग्वेज पैथोलॉजी · फिजियोथेरेपी',
    contact: 'RTC बस स्टैंड के सामने, अनंतपुर - 515001<br/>फोन: +91 99499 61044 | 08554 355088<br/>वेबसाइट: www.shreeclinic.org',
    sections: [
      {
        badge: 'ऑडियोलॉजी',
        badgeClass: 'badge-audio',
        title: 'ऑडियोलॉजी एवं श्रवण विज्ञान विभाग (Audiology)',
        items: [
          'भीड़-भाड़ या शोरगुल वाले माहौल में बातचीत सुनने या समझने में कठिनाई होना।',
          'दूसरों से बार-बार बात दोहराने को कहना या लगना कि लोग फुसफुसा रहे हैं।',
          'कानों में लगातार सीटी, घंटी या झींगुर जैसी आवाज़ें बजना (टिनिटस)।',
          'घर में दूसरों की तुलना में टीवी या मोबाइल की आवाज़ अत्यधिक तेज़ रखना।',
          'नवजात या छोटे बच्चे का तेज आवाज़ पर न चौंकना या 6-9 महीने में आवाज़ की ओर न देखना।',
          'कान में भारीपन, बंद कान महसूस होना या चक्कर (वर्टिगो) आना।'
        ],
        advice: 'सलाह: हमारे आधुनिक साउंडप्रूफ बूथ में प्योर टोन ऑडियोमेट्री (PTA) टेस्ट कराएं।'
      },
      {
        badge: 'स्पीच थेरेपी',
        badgeClass: 'badge-speech',
        title: 'स्पीच-लैंग्वेज पैथोलॉजी विभाग (Speech Therapy)',
        items: [
          'बच्चे का 1.5 - 2 वर्ष की आयु तक बोलना शुरू न करना या शब्द बहुत कम बोलना।',
          'साफ उच्चारण न होना, तुतलाना या बोलते समय रुक-रुक कर हकलाना (Stuttering)।',
          'स्ट्रोक (लकवा) या सिर की चोट के बाद बोलने में असमर्थता या आवाज़ लड़खड़ाना (Aphasia)।',
          'खाना या पानी निगलते समय खांसी आना, गले में अटकना या सांस फूलना (Dysphagia)।',
          'आवाज़ का भारी होना, बैठ जाना या 2 हफ्तों से अधिक समय तक गले में खिंचाव रहना।',
          'बच्चे में सामाजिक संवाद की कमी या ऑटिज्म संबंधी लक्षण दिखना।'
        ],
        advice: 'सलाह: विशेषज्ञ स्पीच-लैंग्वेज पैथोलॉजिस्ट से परामर्श लें या VitalStim® स्वैलोइंग थेरेपी कराएं।'
      },
      {
        badge: 'फिजियोथेरेपी',
        badgeClass: 'badge-physio',
        title: 'फिजियोथेरेपी एवं पुनर्वास विभाग (Physiotherapy)',
        items: [
          'गर्दन, कमर या पीठ का पुराना दर्द जो 7–10 दिनों से अधिक समय से बना हुआ हो।',
          'घुटनों व जोड़ों में सूजन, दर्द, सीढ़ियां चढ़ने में परेशानी या आर्थराइटिस।',
          'कमर से पैरों तक झनझनाहट, सुन्नपन या करंट जैसा दर्द जाना (साइटिका)।',
          'कंधे में जकड़न या हाथ ऊपर उठाने में असमर्थता (फ्रोजन शोल्डर)।',
          'सर्जरी के बाद जोड़ों का जाम होना या खेल-कूद की चोटों का पुनर्वास।',
          'बुजुर्गों में चलने में लड़खड़ाहट, संतुलन की कमी या बार-बार गिरने का डर।'
        ],
        advice: 'सलाह: विस्तृत बायोमैकेनिकल जांच कराएं और लक्षित फिजियोथेरेपी व्यायाम शुरू करें।'
      }
    ],
    callout: 'अपॉइंटमेंट व परामर्श के लिए: +91 99499 61044 पर कॉल करें या सीधे श्री क्लीनिक आएं।'
  }
];

for (const doc of docs) {
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${doc.title}</title>
<style>${baseCss}</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="clinic-title">${doc.headerTitle}</div>
      <div class="clinic-subtitle">${doc.headerSub}</div>
    </div>
    <div class="clinic-contact">${doc.contact}</div>
  </div>

  <div class="doc-title-box">
    <div class="doc-title">${doc.title}</div>
    <div class="doc-desc">${doc.subtitle}</div>
  </div>

  ${doc.sections.map(s => `
    <div class="section-card">
      <div class="section-head">
        <span class="badge ${s.badgeClass}">${s.badge}</span>
        <span class="section-title">${s.title}</span>
      </div>
      <ul class="symptom-list">
        ${s.items.map(it => `
          <li class="symptom-item">
            <span class="symptom-bullet">✓</span>
            <span>${it}</span>
          </li>
        `).join('')}
      </ul>
      <div class="advice-box">${s.advice}</div>
    </div>
  `).join('')}

  <div class="action-callout">${doc.callout}</div>

  <div class="footer">
    <span>© Shree Multidisciplinary Healthcare Clinic · All Rights Reserved</span>
    <span>Certified Audiology, Speech Therapy & Physiotherapy Center</span>
  </div>
</body>
</html>`;

  const tempHtmlPath = path.resolve('public', 'documents', `temp_${doc.filename.replace('.pdf', '.html')}`);
  const pdfOutPath = path.resolve('public', 'documents', doc.filename);

  fs.writeFileSync(tempHtmlPath, htmlContent, 'utf-8');

  console.log(`Generating PDF for ${doc.lang} at ${pdfOutPath}...`);
  try {
    execSync(`"${edgePath}" --headless --disable-gpu --print-to-pdf="${pdfOutPath}" "${tempHtmlPath}"`, { stdio: 'inherit' });
    console.log(`Successfully generated ${doc.filename}`);
  } catch (err) {
    console.error(`Error generating PDF for ${doc.filename}:`, err);
  } finally {
    if (fs.existsSync(tempHtmlPath)) {
      fs.unlinkSync(tempHtmlPath);
    }
  }
}
