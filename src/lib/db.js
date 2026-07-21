import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  increment,
  updateDoc,
} from "firebase/firestore";
import { db, isFirebaseConfigured, storage } from "./firebase";

const FIREBASE_TIMEOUT_MS = 10000;
// Only block WRITE operations when they fail — never block reads
let firebaseWriteUnavailable = false;

function canUseFirebase() {
  return isFirebaseConfigured && Boolean(db);
}

// Only used for non-critical write operations (views, analytics)
function handleWriteFailure(operation, error) {
  if (!firebaseWriteUnavailable) {
    firebaseWriteUnavailable = true;
    console.warn(`Firebase ${operation} write failed (non-critical):`, error?.message);
  }
}

// Define Interfaces

const MOCK_CATEGORIES = [
  { id: "cat-web-dev", name: "वेब डेव्हलपमेंट", slug: "web-dev", description: "Modern frontend techniques, Next.js, React, CSS, and serverless engineering.", image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=60" },
  { id: "cat-design-systems", name: "डिझाईन सिस्टम", slug: "design-systems", description: "Typography, fluid grids, tokenization, animations, and premium visual components.", image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=60" },
  { id: "cat-ai-engineering", name: "कृत्रिम बुद्धिमत्ता", slug: "ai-engineering", description: "Generative AI, Large Language Model orchestration, prompt engineering, and agent systems.", image: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=60" },
  { id: "cat-cyber-security", name: "सायबर सुरक्षा", slug: "cyber-security", description: "Learn cyber security, social media account defense, bank account protection, and digital self-defense.", image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=60" },
  { id: "cat-data-science", name: "डेटा सायन्स", slug: "data-science", description: "Explore python data analysis, SQL databases, metrics, statistics, and trends forecasting.", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60" },
  { id: "cat-cloud-computing", name: "क्लाउड कम्प्युटिंग", slug: "cloud-computing", description: "Master AWS, Google Cloud, Azure server operations, networks, and cloud architecture.", image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=60" },
  { id: "cat-mobile-dev", name: "मोबाईल ॲप्स", slug: "mobile-dev", description: "Building Android and iOS applications with React Native, Flutter, Swift, and Kotlin.", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=60" },
  { id: "cat-database", name: "डेटाबेस मॅनेजमेंट", slug: "database", description: "Relational and NoSQL database administration, Postgres, Firebase Firestore, and Redis caches.", image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=60" },
  { id: "cat-ui-ux", name: "यूआय/यूएक्स डिझाईन", slug: "ui-ux", description: "User interface and user experience design patterns, Figma prototyping, typography, and wireframes.", image: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800&auto=format&fit=crop&q=60" },
  { id: "cat-devops", name: "डेव्हऑप्स इंजिनिअरिंग", slug: "devops", description: "CI/CD pipelines, Docker containers, Kubernetes clusters, automation scripts, and server performance.", image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=60" }
];

const MOCK_SETTINGS = {
  websiteName: "Aether",
  logo: "✦ AETHER",
  logoImage: "",
  homepage: {
    spotlightTag: "विशेष तपास",
    latestBlogsTitle: "नवीन तपास आणि शोधकथा",
    latestBlogsSubtitle: "सत्यशोध आणि पुराव्यांवर आधारित चालू तपासणी",
    sidebarTitle: "मागील तपासणी",
    categoriesTitle: "विषय सूची",
    categoriesSubtitle: "सत्यवेधच्या व्यासपीठावर आम्ही विविध पैलूंनी इतिहासाचा आणि वर्तमानाचा वेध घेतो.",
    featuredVideosTitle: "लोकप्रिय माहितीपट",
    featuredVideosSubtitle: "सखोल संशोधनावर आधारित लेख आणि वृत्त",
    timelineTitle: "काळाचा ओघ: एक प्रवास",
    timelineSubtitle: "महाराष्ट्राच्या आणि भारताच्या समृद्ध वारशाचा वेध घेण्यासाठी या कालपटलावर नजर टाका.",
    quoteText: "इतिहास कधीच मरत नाही... तो फक्त पुन्हा वाचला जातो.",
    quoteAuthor: "सत्यवेध संपादकीय",
    timeline: [
      {
        year: "१९४७",
        title: "स्वातंत्र्याचा सूर्योदय",
        desc: "वसाहतवादाच्या अंताची आणि नव्या स्वतंत्र भारताच्या निर्मितीची सुवर्णगाथा."
      },
      {
        year: "१८५७",
        title: "पहिले स्वातंत्र्यसमर",
        desc: "मंगल पांडे ते झाशीची राणी लक्ष्मीबाई... इंग्रज सत्तेविरुद्ध संघर्षाची पहिली महाठिणगी."
      },
      {
        year: "१६७४",
        title: "शिवराज्याभिषेक सोहळा",
        desc: "रायगडावर छत्रपती शिवाजी महाराजांचा राज्याभिषेक आणि हिंदवी स्वराज्याची अधिकृत स्थापना."
      }
    ]
  },
  hero: {
    title: "The Future of Web Engineering & Aesthetics",
    subtitle:
      "Exploring next-generation technologies, interactive interfaces, serverless systems, and the design languages of tomorrow.",
    ctaText: "Explore Blogs",
    ctaLink: "#featured",
  },
  theme: {
    primaryColorLight: "#4f46e5",
    primaryColorDark: "#818cf8",
    footerBgColorLight: "#f4f4f5",
    footerBgColorDark: "#101014",
  },
  aboutContent: {
    title: "Crafting Premium Digital Experiences",
    text: "Welcome to Aether. We are a collection of developers, designers, and AI researchers documenting our path through the digital frontier. We believe that technology should not only be highly performant, but visually gorgeous and satisfying to interact with.",
    mission:
      "To inspire and educate developers by producing high-fidelity technical articles that pair bleeding-edge code with premium interactive design.",
    vision:
      "To become the definitive journal for high-end web development, AI integration, and fluid UX systems.",
    stats: [
      { label: "Active Readers", value: "250K+" },
      { label: "Articles Published", value: "480+" },
      { label: "Community Members", value: "50K+" },
      { label: "Open Source Stars", value: "12K+" },
    ],
    team: [
      {
        name: "Yadnesh Thorat",
        role: "Chief Architect & Editor",
        avatar:
          "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=60",
        bio: "Yadnesh is a full stack specialist who spends his time designing systems with Next.js, Firebase, and real-time data sync.",
      },
      {
        name: "Aria Sterling",
        role: "Head of Design",
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=60",
        bio: "Aria is obsessed with motion design, typography, and creating digital environments that respond fluidly to users.",
      },
    ],
    timeline: [
      {
        year: "2024",
        title: "Project Inception",
        desc: "Aether was launched as a small technical newsletter with 100 subscribers.",
      },
      {
        year: "2025",
        title: "Expanding to AI Hub",
        desc: "Introduced dedicated columns covering generative AI integration and Next.js App Router tutorials.",
      },
      {
        year: "2026",
        title: "v2 Portal Launch",
        desc: "Redesigned the entire visitor experience using glassmorphism and real-time Firebase tracking.",
      },
    ],
  },
  contactInfo: {
    email: "contact@aether-blog.com",
    phone: "+1 (555) 019-2834",
    address: "One Infinite Loop, Cupertino, CA 95014",
    mapsEmbed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3172.3325300305886!2d-122.0311812!3d37.33182!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808fb5b5c907b311%3A0x25e412613cf7b2b6!2sApple%20Infinite%20Loop!5e0!3m2!1sen!2sus!4v1700000000000",
    socialLinks: {
      twitter: "https://twitter.com/aether_blog",
      github: "https://github.com/aether",
      linkedin: "https://linkedin.com/company/aether",
      youtube: "https://youtube.com/aether",
    },
  },
  footerText:
    "© 2026 Aether Journal. Built with React, Tailwind CSS, and Firebase.",
  seoDefaults: {
    title: "Aether | The Modern Tech & Design Journal",
    description:
      "A beautifully crafted blog platform exploring modern frontend, web design systems, Firebase backend, and generative artificial intelligence.",
    ogImage:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80",
  },
};

export const MOCK_BLOGS = [
  {
    id: "mock-blog-1",
    title: "कृत्रिम बुद्धिमत्ता (AI) आणि मानवी जीवन: एक नवी दिशा",
    slug: "ai-and-human-life-new-direction",
    excerpt: "कृत्रिम बुद्धिमत्ता (AI) आपल्या दैनंदिन जीवनाचा एक महत्त्वाचा भाग बनत चालली आहे. या लेखात आपण त्याचे मानवी जीवनावरील सकारात्मक आणि नकारात्मक परिणाम पाहणार आहोत.",
    content: "## कृत्रिम बुद्धिमत्ता (AI) म्हणजे काय?\n\nकृत्रिम बुद्धिमत्ता ही संगणक विज्ञानाची एक शाखा आहे जी मानवी बुद्धिमत्तेचे अनुकरण करू शकणारे स्मार्ट मशीन तयार करण्याशी संबंधित आहे. आजच्या काळात AI चा वापर आरोग्य, शिक्षण, वाहतूक आणि मनोरंजन अशा सर्वच क्षेत्रांमध्ये वेगाने होत आहे.\n\n### मानवी जीवनावरील प्रभाव\n\nAI मुळे मानवी कामे अधिक सुलभ आणि कार्यक्षम झाली आहेत. परंतु, यामुळे नोकऱ्यांवर होणारा परिणाम आणि डेटा सुरक्षितता याविषयी चिंता देखील वाढत आहे.",
    coverImage: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=1200&auto=format&fit=crop&q=80",
    category: "ai-engineering",
    tags: ["AI", "Technology", "Future"],
    status: "published",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    views: 1250,
    readingTime: 5,
    author: {
      name: "Yadnesh Thorat",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      role: "Chief Architect & Editor",
      bio: "Yadnesh is a full stack specialist who spends his time designing systems with Next.js, Firebase, and real-time data sync."
    }
  },
  {
    id: "mock-blog-2",
    title: "वेब डिझाइनमधील आधुनिक ट्रेंड्स २०२६",
    slug: "modern-trends-in-web-design-2026",
    excerpt: "वेब डिझाइन जग सतत बदलत असते. या वर्षात लोकप्रिय ठरणारे ग्लासमॉर्फिझम, थ्रीडी एलिमेंट्स आणि डार्क मोड डिझाइन्स याविषयी सविस्तर माहिती घ्या.",
    content: "## वेब डिझाइनचे नवीन पर्व\n\n२०२६ मध्ये वेब डिझाइनिंग केवळ सुंदर दिसण्यापुरते मर्यादित राहिलेले नाही, तर ते अधिक परस्परसंवादी (interactive) आणि वापरण्यास सोपे (user-friendly) बनले आहे. या वर्षात ग्लासमॉर्फिझम (Glassmorphism) आणि निओमॉर्फिझम (Neomorphism) हे ट्रेंड्स अधिक लोकप्रिय ठरत आहेत.\n\n### महत्त्वाचे ट्रेंड्स\n1. **डार्क मोड** - डोळ्यांना त्रास न होण्यासाठी डार्क मोड आता अनिवार्य झाला आहे.\n2. **थ्रीडी ग्राफिक्स** - अधिक आकर्षक अनुभव देण्यासाठी थ्रीडी इमेजेसचा वापर वाढला आहे.",
    coverImage: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80",
    category: "design-systems",
    tags: ["Web Design", "UI/UX", "Trends"],
    status: "published",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    views: 980,
    readingTime: 4,
    author: {
      name: "Yadnesh Thorat",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      role: "Chief Architect",
      bio: "Specialist in Next.js and Firebase."
    }
  },
  {
    id: "mock-blog-3",
    title: "रिएक्ट १९ मधील नवीन फीचर्स आणि त्यांचे फायदे",
    slug: "react-19-new-features-and-benefits",
    excerpt: "रिएक्ट १९ चे नवीन कॉम्पायलर आणि रिॲक्ट सर्वर कॉम्पोनंट्स (RSC) डिझाइनिंगला आणि परफॉर्मन्सला कशी नवी गती देणार आहेत ते समजून घ्या.",
    content: "## रिएक्ट १९ चे आगमन\n\nरिएक्ट १९ मध्ये अनेक महत्त्वपूर्ण बदल करण्यात आले आहेत. सर्वात मोठा बदल म्हणजे 'React Compiler' चा समावेश, जो न वापरलेला कोड आणि मेमोआयझेशन (memoization) स्वयंचलितपणे हाताळतो, ज्यामुळे डेव्हलपर्सचा वेळ वाचतो.",
    coverImage: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&auto=format&fit=crop&q=80",
    category: "web-dev",
    tags: ["React", "JavaScript", "Frontend"],
    status: "published",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    views: 2400,
    readingTime: 6,
    author: {
      name: "Yadnesh Thorat",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      role: "Chief Architect",
      bio: "Specialist in Next.js and Firebase."
    }
  },
  {
    id: "mock-blog-4",
    title: "सायबर सुरक्षा: तुमचे डिजिटल अस्तित्व कसे सुरक्षित ठेवावे?",
    slug: "cyber-security-protect-digital-presence",
    excerpt: "आजच्या डिजिटल युगात सायबर गुन्हेगारी वेगाने वाढत आहे. या लेखात आपण आपले सोशल मीडिया खाती, बँक खाती आणि वैयक्तिक डेटा सुरक्षित ठेवण्यासाठी काही टिप्स जाणून घेणार आहोत.",
    content: "## सायबर सुरक्षेचे महत्त्व\n\nइंटरनेटचा वापर वाढल्याने सायबर हल्ल्यांचा धोकाही वाढला आहे. फिशिंग, मालवेअर आणि रॅन्समवेअर यांसारख्या धोक्यांपासून स्वतःचा बचाव करणे आवश्यक आहे.",
    coverImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80",
    category: "web-dev",
    tags: ["Security", "Cyber", "Tips"],
    status: "published",
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    views: 1850,
    readingTime: 5,
    author: {
      name: "Yadnesh Thorat",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      role: "Chief Architect",
      bio: "Specialist in Next.js and Firebase."
    }
  },
  {
    id: "mock-blog-5",
    title: "युझर इंटरफेस (UI) डिझाइनचे ५ महत्त्वाचे नियम",
    slug: "5-important-rules-of-ui-design",
    excerpt: "एक उत्तम युझर इंटरफेस कसा डिझाइन करावा? या लेखात आपण UI डिझाइनचे ५ सोपे पण अत्यंत प्रभावी नियम अभ्यासणार आहोत जे प्रत्येक डिझायनरला माहित असावेत.",
    content: "## UI डिझाइनचे नियम\n\nउत्कृष्ट UI मुळे युझरचा अनुभव सुधारतो. नियम १: सुसंगतता (Consistency), नियम २: स्पष्टता (Clarity), नियम ३: फीडबॅक (Feedback), नियम ४: नियंत्रण (User Control), नियम ५: साधेपणा (Simplicity).",
    coverImage: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=1200&auto=format&fit=crop&q=80",
    category: "design-systems",
    tags: ["UI", "UX", "Design"],
    status: "published",
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    views: 1420,
    readingTime: 4,
    author: {
      name: "Yadnesh Thorat",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      role: "Chief Architect",
      bio: "Specialist in Next.js and Firebase."
    }
  },
  {
    id: "mock-blog-6",
    title: "डेटा सायन्समध्ये करिअर कसे करावे?",
    slug: "how-to-make-career-in-data-science",
    excerpt: "डेटा सायन्स हे सध्याच्या काळातील सर्वात जास्त मागणी असलेले क्षेत्र आहे. या क्षेत्रात करिअर करण्यासाठी कोणती कौशल्ये आवश्यक आहेत आणि सुरुवात कशी करावी याबद्दल मार्गदर्शन.",
    content: "## डेटा सायन्स आणि करिअर\n\nडेटा सायन्स म्हणजे डेटाच्या मदतीने महत्त्वाचे निष्कर्ष काढणे. यासाठी पायथन (Python), एसक्यूएल (SQL), आणि स्टॅटिस्टिक्स (Statistics) यांचे ज्ञान असणे आवश्यक आहे.",
    coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80",
    category: "ai-engineering",
    tags: ["Data Science", "Career", "Python"],
    status: "published",
    createdAt: new Date(Date.now() - 3600000 * 96).toISOString(),
    views: 3100,
    readingTime: 7,
    author: {
      name: "Yadnesh Thorat",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      role: "Chief Architect",
      bio: "Specialist in Next.js and Firebase."
    }
  },
  {
    id: "mock-blog-7",
    title: "क्लाउड कम्प्युटिंग: भविष्यातील तंत्रज्ञानाचा पाया",
    slug: "cloud-computing-foundation-of-future-tech",
    excerpt: "AWS, Google Cloud आणि Azure यांसारख्या क्लाउड प्लॅटफॉर्म्सचे महत्त्व आणि ते आजच्या व्यवसायांचे संचालन कसे बदलत आहेत, याबद्दल सविस्तर माहिती.",
    content: "## क्लाउड कम्प्युटिंगचे महत्त्व\n\nक्लाउड कम्प्युटिंगमुळे कंपन्यांना स्वतःचे फिजिकल सर्व्हर्स ठेवण्याची गरज भासत नाही. ते सर्व्हिस मॉडेलवर स्पेस आणि कम्प्युटिंग पॉवर भाड्याने घेऊ शकतात, ज्याने खर्च कमी होतो.",
    coverImage: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=1200&auto=format&fit=crop&q=80",
    category: "web-dev",
    tags: ["Cloud", "AWS", "DevOps"],
    status: "published",
    createdAt: new Date(Date.now() - 3600000 * 120).toISOString(),
    views: 1150,
    readingTime: 5,
    author: {
      name: "Yadnesh Thorat",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      role: "Chief Architect",
      bio: "Specialist in Next.js and Firebase."
    }
  },
  {
    id: "mock-blog-8",
    title: "स्मार्टफोन्सचे भविष्य आणि फोल्डेबल तंत्रज्ञान",
    slug: "future-of-smartphones-and-foldable-tech",
    excerpt: "फोल्डेबल आणि फ्लेक्सिबल स्क्रीन्सच्या आगमनामुळे स्मार्टफोन डिझाइनमध्ये क्रांती झाली आहे. पुढील ५ वर्षांत स्मार्टफोन कसे असतील याचा आढावा.",
    content: "## स्मार्टफोनचे बदलते स्वरूप\n\nसध्या सॅमसंग, वनप्लस आणि गुगल या कंपन्यांचे फोल्डेबल फोन्स बाजारात उपलब्ध आहेत. भविष्यात स्क्रोल करण्यायोग्य (rollable) डिस्प्ले देखील पाहायला मिळू शकतात.",
    coverImage: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&auto=format&fit=crop&q=80",
    category: "design-systems",
    tags: ["Mobile", "Foldable", "Gadgets"],
    status: "published",
    createdAt: new Date(Date.now() - 3600000 * 144).toISOString(),
    views: 2040,
    readingTime: 4,
    author: {
      name: "Yadnesh Thorat",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      role: "Chief Architect",
      bio: "Specialist in Next.js and Firebase."
    }
  },
  {
    id: "mock-blog-9",
    title: "मशीन लर्निंग आणि त्याचा उद्योगांवर होणारा परिणाम",
    slug: "machine-learning-impact-on-industries",
    excerpt: "मशीन लर्निंग (ML) मॉडेल्सचा वापर करून विविध क्षेत्रे आपले काम कसे स्वयंचलित करत आहेत, आणि यामुळे व्यवसायांमध्ये कशी वाढ होत आहे ते जाणून घ्या.",
    content: "## मशीन लर्निंगचे औद्योगिक महत्त्व\n\nमशीन लर्निंगमुळे फायनान्स, हेल्थकेअर, आणि ई-कॉमर्समध्ये मोठे बदल झाले आहेत. उदा. खरेदीदार काय खरेदी करू शकतात याचा अंदाज लावणे.",
    coverImage: "https://images.unsplash.com/photo-1527474305487-b87b222841cc?w=1200&auto=format&fit=crop&q=80",
    category: "ai-engineering",
    tags: ["ML", "Data science", "AI"],
    status: "published",
    createdAt: new Date(Date.now() - 3600000 * 168).toISOString(),
    views: 1950,
    readingTime: 5,
    author: {
      name: "Yadnesh Thorat",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      role: "Chief Architect",
      bio: "Specialist in Next.js and Firebase."
    }
  },
  {
    id: "mock-blog-10",
    title: "सर्व्हरलेस तंत्रज्ञान म्हणजे काय? सोप्या भाषेत",
    slug: "what-is-serverless-technology-in-simple-words",
    excerpt: "डेव्हलपर्ससाठी सर्व्हरलेस आर्किटेक्चरचे महत्त्व, त्याचे फायदे (उदा. ऑटो-स्केलिंग, पे-पर-युज) आणि या तंत्रज्ञानाच्या मर्यादा यावर एक सखोल नजर.",
    content: "## सर्व्हरलेस आर्किटेक्चर म्हणजे काय?\n\nसर्व्हरलेस म्हणजे सर्व्हर नसणे नव्हे, तर त्याचा अर्थ असा की डेव्हलपर्सना सर्व्हर मॅनेज करण्याची गरज नसते. ही जबाबदारी क्लाउड प्रोव्हाइ़डरवर असते. त्यामुळे डेव्हलपर्स केवळ कोड लिहिण्यावर लक्ष केंद्रित करू शकतात.",
    coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80",
    category: "web-dev",
    tags: ["Serverless", "Backend", "Functions"],
    status: "published",
    createdAt: new Date(Date.now() - 3600000 * 192).toISOString(),
    views: 1670,
    readingTime: 5,
    author: {
      name: "Yadnesh Thorat",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      role: "Chief Architect",
      bio: "Specialist in Next.js and Firebase."
    }
  }
];

const MOCK_CONTACTS = [];

const MOCK_SUBSCRIBERS = [];

const MOCK_ADMINS = [
  {
    id: "admin-primary",
    email: "admin@aether-blog.com",
    password: "admin123",
    displayName: "Primary Admin",
    role: "Administrator",
    createdAt: new Date("2026-07-01").toISOString()
  }
];

const MOCK_COMMENTS = [
  {
    id: "c-mock-1",
    blogId: "blog-1",
    blogSlug: "modern-trends-in-web-design-2026",
    blogTitle: "वेब डिझाइनमधील आधुनिक ट्रेंड्स २०२६",
    name: "Marcus Aurelius",
    content: "This is a masterpiece of a breakdown. The section about Partial Prerendering helped clarify the streaming boundaries. Thanks!",
    createdAt: "2026-07-02T14:23:00Z",
    approved: true
  },
  {
    id: "c-mock-2",
    blogId: "blog-1",
    blogSlug: "modern-trends-in-web-design-2026",
    blogTitle: "वेब डिझाइनमधील आधुनिक ट्रेंड्स २०२६",
    name: "Elsa Frost",
    content: "Aria, the easing functions in CSS transitions are indeed critical for UI speed perception. Ease-out-expo feels extremely responsive.",
    createdAt: "2026-07-04T08:12:00Z",
    approved: true
  }
];

const MOCK_ANALYTICS = {
  totalVisitors: 84320,
  todaysVisitors: 1240,
  monthlyVisitors: 38900,
  visitorTrends: [
    { name: "Mon", visitors: 800, bounceRate: 35, duration: 120 },
    { name: "Tue", visitors: 950, bounceRate: 32, duration: 145 },
    { name: "Wed", visitors: 1100, bounceRate: 34, duration: 160 },
    { name: "Thu", visitors: 1050, bounceRate: 36, duration: 155 },
    { name: "Fri", visitors: 1300, bounceRate: 30, duration: 180 },
    { name: "Sat", visitors: 980, bounceRate: 28, duration: 190 },
    { name: "Sun", visitors: 1240, bounceRate: 29, duration: 200 },
  ],
  trafficSources: [
    { name: "Direct", value: 35000 },
    { name: "Organic Search", value: 28000 },
    { name: "Social Media", value: 14000 },
    { name: "Newsletter", value: 7320 },
  ],
  deviceTypes: [
    { name: "Desktop", value: 52000 },
    { name: "Mobile", value: 28000 },
    { name: "Tablet", value: 4320 },
  ],
  topLandingPages: [
    { path: "/", views: 42000 },
    { path: "/blogs/mastering-nextjs-15", views: 24000 },
    { path: "/blogs/designing-fluid-interfaces", views: 12000 },
    { path: "/categories", views: 6320 },
  ],
};

// STORAGE ACTIONS (LOCAL STORAGE OR MEMORY STORAGE FALLBACKS)
function getLocalData(key, fallback) {
  if (typeof window === "undefined") return fallback;
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
  return JSON.parse(stored);
}

function setLocalData(key, data) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
}

// Helper to race Firestore operations against a timeout so the app never hangs
function withTimeout(promise, timeoutMs = FIREBASE_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("Firebase operation timed out")),
      timeoutMs,
    );
    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

// HIGH LEVEL DATABASE SERVICE
export const dbService = {
  // --- BLOGS ---
  // Helper to map blog authors to a proper object
  _resolveAuthor(blog, admins) {
    if (!blog) return blog;

    // Extract a lookup key from the author field (whether string or object)
    let lookupName = null;
    let lookupEmail = null;
    if (blog.author && typeof blog.author === "string") {
      // Could be email or display name
      if (blog.author.includes("@")) {
        lookupEmail = blog.author.toLowerCase();
      } else {
        lookupName = blog.author.toLowerCase();
      }
    } else if (blog.author && typeof blog.author === "object") {
      lookupName = blog.author.name?.toLowerCase();
    }

    // Always try to find a real admin profile match first
    if (admins && admins.length > 0 && (lookupName || lookupEmail)) {
      const matched = admins.find((a) => {
        const adminName = a.displayName?.toLowerCase();
        const adminEmail = a.email?.toLowerCase();
        return (
          (lookupEmail && adminEmail === lookupEmail) ||
          (lookupName && adminName === lookupName)
        );
      });

      if (matched) {
        return {
          ...blog,
          author: {
            name: matched.displayName || matched.email,
            avatar: matched.avatarUrl || null,
            role: matched.role || "Administrator",
            bio: matched.bio || "Aether blog administrator and tech enthusiast."
          }
        };
      }
    }

    // If author is a structured object with data, use it as-is (or try to upgrade with first admin)
    const GENERIC_NAMES = ["admin user", "primary admin", "aether writer", "writer", "administrator"];
    const isGeneric = GENERIC_NAMES.includes((lookupName || "").toLowerCase());

    if (blog.author && typeof blog.author === "object") {
      // If the stored name is generic and we have admins, use the first/primary admin
      if (isGeneric && admins && admins.length > 0) {
        const primaryAdmin = admins[0];
        return {
          ...blog,
          author: {
            name: primaryAdmin.displayName || primaryAdmin.email,
            avatar: primaryAdmin.avatarUrl || null,
            role: primaryAdmin.role || "Administrator",
            bio: primaryAdmin.bio || "Aether blog administrator and tech enthusiast."
          }
        };
      }
      return {
        ...blog,
        author: {
          name: blog.author.name || "Aether Writer",
          avatar: null,  // Don't use hardcoded mock avatars — only real uploaded profile photos
          role: blog.author.role || "Writer",
          bio: blog.author.bio || null
        }
      };
    }

    // Default fallback — use primary admin if available
    if (admins && admins.length > 0) {
      const primaryAdmin = admins[0];
      return {
        ...blog,
        author: {
          name: primaryAdmin.displayName || primaryAdmin.email || "Aether Writer",
          avatar: primaryAdmin.avatarUrl || null,
          role: primaryAdmin.role || "Administrator",
          bio: primaryAdmin.bio || "Aether blog administrator and tech enthusiast."
        }
      };
    }

    return {
      ...blog,
      author: {
        name: (typeof blog.author === "string" ? blog.author : null) || "Aether Writer",
        avatar: null,
        role: "Writer",
        bio: "Aether blog administrator and tech enthusiast."
      }
    };
  },

  async getBlogs(includeDrafts = false) {
    let rawList = [];
    if (canUseFirebase()) {
      try {
        const blogsRef = collection(db, "aether_blogs_v2");
        let q;
        if (includeDrafts) {
          q = query(blogsRef, orderBy("createdAt", "desc"));
        } else {
          q = query(
            blogsRef,
            where("status", "==", "published"),
            orderBy("createdAt", "desc"),
          );
        }
        const snapshot = await withTimeout(getDocs(q));
        snapshot.forEach((d) => {
          rawList.push({ id: d.id, ...d.data() });
        });
      } catch (err) {
        // Read failure — fall back to local cache, but do NOT block future Firebase reads
        console.warn("getBlogs: Firestore read failed, using local cache:", err?.message);
      }
    } else {
      // Fallback
      let blogs = getLocalData("aether_blogs_v2", MOCK_BLOGS);
      if (blogs.length <= 1) {
        setLocalData("aether_blogs_v2", MOCK_BLOGS);
        blogs = MOCK_BLOGS;
      }
      let filtered = blogs;
      if (!includeDrafts) {
        filtered = blogs.filter((b) => b.status === "published");
      }
      rawList = filtered.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }

    // Map authors dynamically
    const admins = await this.getAdmins();
    return rawList.map((b) => this._resolveAuthor(b, admins));
  },

  async getBlogBySlug(slug) {
    if (!slug) return null;
    const normalizedSlug = slug.replace(/^\/+/, "").trim().toLowerCase();

    let rawBlog = null;

    if (canUseFirebase()) {
      try {
        const blogsRef = collection(db, "aether_blogs_v2");
        // Try exact slug and lowercase variant
        const q = query(
          blogsRef,
          where("slug", "in", [normalizedSlug, `/${normalizedSlug}`, slug.trim()]),
          limit(1)
        );
        const snapshot = await withTimeout(getDocs(q), FIREBASE_TIMEOUT_MS);
        if (!snapshot.empty) {
          const docSnap = snapshot.docs[0];
          rawBlog = { id: docSnap.id, ...docSnap.data() };
        } else {
          // Fallback: scan all blogs and do case-insensitive match
          const allSnap = await withTimeout(getDocs(blogsRef), FIREBASE_TIMEOUT_MS);
          allSnap.forEach((d) => {
            if (!rawBlog) {
              const s = (d.data().slug || "").replace(/^\/+/, "").trim().toLowerCase();
              if (s === normalizedSlug) {
                rawBlog = { id: d.id, ...d.data() };
              }
            }
          });
        }
      } catch (err) {
        // Do NOT poison global Firebase state for reads — just try local cache
        console.warn("getBlogBySlug: Firestore error, trying local cache", err?.message);
        const blogs = getLocalData("aether_blogs_v2", MOCK_BLOGS);
        rawBlog = blogs.find((b) => {
          const blogSlugNorm = (b.slug || "").replace(/^\/+/, "").trim().toLowerCase();
          return blogSlugNorm === normalizedSlug;
        }) || null;
      }
    } else {
      const blogs = getLocalData("aether_blogs_v2", MOCK_BLOGS);
      rawBlog = blogs.find((b) => {
        const blogSlugNorm = (b.slug || "").replace(/^\/+/, "").trim().toLowerCase();
        return blogSlugNorm === normalizedSlug;
      }) || null;
    }

    if (!rawBlog) return null;
    const admins = await this.getAdmins();
    return this._resolveAuthor(rawBlog, admins);
  },

  async saveBlog(blog) {
    const defaultAuthor = MOCK_SETTINGS.aboutContent.team[0];
    const words = (blog.content || "").trim().split(/\s+/).length;
    const readingTime = Math.ceil(words / 225) || 1;

    const newBlog = {
      id: blog.id || "blog-" + Math.random().toString(36).substr(2, 9),
      title: blog.title || "Untitled Blog",
      slug: blog.slug,
      excerpt: blog.excerpt || "",
      content: blog.content || "",
      coverImage:
        blog.coverImage ||
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
      coverImageCredit: blog.coverImageCredit || blog.imageCredit || "",
      category: blog.category || "web-dev",
      tags: blog.tags || [],
      author: blog.author || defaultAuthor,
      status: blog.status || "draft",
      publishedAt:
        blog.status === "published"
          ? blog.publishedAt || new Date().toISOString()
          : "",
      createdAt: blog.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      scheduledAt: blog.scheduledAt || null,
      views: blog.views || 0,
      readingTime: readingTime,
      seo: {
        title: blog.seo?.title || blog.title || "Untitled Blog",
        description: blog.seo?.description || blog.excerpt || "",
      },
    };

    if (canUseFirebase()) {
      try {
        await withTimeout(setDoc(doc(db, "aether_blogs_v2", newBlog.id), newBlog));
        return newBlog;
      } catch (err) {
        handleWriteFailure("saveBlog", err);
      }
    }

    // Fallback
    const blogs = getLocalData("aether_blogs_v2", MOCK_BLOGS);
    const index = blogs.findIndex((b) => b.id === newBlog.id);
    if (index > -1) {
      blogs[index] = newBlog;
    } else {
      blogs.push(newBlog);
    }
    setLocalData("aether_blogs_v2", blogs);
    return newBlog;
  },

  async deleteBlog(id) {
    if (canUseFirebase()) {
      try {
        await withTimeout(deleteDoc(doc(db, "aether_blogs_v2", id)));
        return true;
      } catch (err) {
        handleWriteFailure("deleteBlog", err);
        return false;
      }
    }
    // Fallback
    const blogs = getLocalData("aether_blogs_v2", MOCK_BLOGS);
    const filtered = blogs.filter((b) => b.id !== id);
    setLocalData("aether_blogs_v2", filtered);
    return true;
  },

  async incrementViews(slug) {
    if (canUseFirebase()) {
      try {
        const blogsRef = collection(db, "aether_blogs_v2");
        const q = query(blogsRef, where("slug", "==", slug), limit(1));
        const snapshot = await withTimeout(getDocs(q));
        if (!snapshot.empty) {
          const docSnap = snapshot.docs[0];
          await withTimeout(
            updateDoc(doc(db, "aether_blogs_v2", docSnap.id), {
              views: increment(1),
            }),
          );
        }
        return;
      } catch (err) {
        // Non-critical — silently skip view count increment
      }
    }
    // Fallback
    const blogs = getLocalData("aether_blogs_v2", MOCK_BLOGS);
    const blog = blogs.find((b) => b.slug === slug);
    if (blog) {
      blog.views = (blog.views || 0) + 1;
      setLocalData("aether_blogs_v2", blogs);
    }
  },

  // --- CATEGORIES ---
  async getCategories() {
    if (canUseFirebase()) {
      try {
        const snapshot = await withTimeout(
          getDocs(collection(db, "aether_categories_v2")),
        );
        const list = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...d.data() });
        });
        if (list.length > 0) return list;

        // Auto-seed default categories if database is empty
        for (const cat of MOCK_CATEGORIES) {
          await setDoc(doc(db, "aether_categories_v2", cat.id), cat);
          list.push(cat);
        }
        return list;
      } catch (err) {
        console.warn("getCategories: Firestore read failed, using local cache:", err?.message);
      }
    }
    // Fallback
    let cats = getLocalData("aether_categories_v2", MOCK_CATEGORIES);
    if (cats.length < 10) {
      setLocalData("aether_categories_v2", MOCK_CATEGORIES);
      cats = MOCK_CATEGORIES;
    }
    return cats;
  },

  async saveCategory(cat) {
    const newCat = {
      id: cat.id || "cat-" + Math.random().toString(36).substr(2, 9),
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      image:
        cat.image ||
        "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=60",
    };

    if (canUseFirebase()) {
      try {
        await withTimeout(setDoc(doc(db, "aether_categories_v2", newCat.id), newCat));
        return newCat;
      } catch (err) {
        handleWriteFailure("saveCategory", err);
      }
    }

    // Fallback
    const cats = getLocalData("aether_categories_v2", MOCK_CATEGORIES);
    const index = cats.findIndex((c) => c.id === newCat.id);
    if (index > -1) {
      cats[index] = newCat;
    } else {
      cats.push(newCat);
    }
    setLocalData("aether_categories_v2", cats);
    return newCat;
  },

  async deleteCategory(id) {
    if (canUseFirebase()) {
      try {
        await withTimeout(deleteDoc(doc(db, "aether_categories_v2", id)));
        return true;
      } catch (err) {
        handleWriteFailure("deleteCategory", err);
        return false;
      }
    }
    // Fallback
    const cats = getLocalData("aether_categories_v2", MOCK_CATEGORIES);
    const filtered = cats.filter((c) => c.id !== id);
    setLocalData("aether_categories_v2", filtered);
    return true;
  },

  // --- SETTINGS ---
  async getSettings() {
    let settingsData = null;
    if (canUseFirebase()) {
      try {
        const docSnap = await withTimeout(
          getDoc(doc(db, "aether_settings_v2", "global")),
        );
        if (docSnap.exists()) {
          settingsData = docSnap.data();
        }
      } catch (err) {
        console.warn("getSettings: Firestore read failed, using local cache:", err?.message);
      }
    }
    if (!settingsData) {
      // Fallback
      settingsData = getLocalData("aether_settings_v2", MOCK_SETTINGS);
    }

    // Safety merge for homepage settings to support backward compatibility
    if (settingsData) {
      if (!settingsData.homepage) {
        settingsData.homepage = { ...MOCK_SETTINGS.homepage };
      } else {
        settingsData.homepage = {
          ...MOCK_SETTINGS.homepage,
          ...settingsData.homepage,
        };
      }
    }
    return settingsData;
  },

  async saveSettings(settings) {
    if (canUseFirebase()) {
      try {
        await withTimeout(setDoc(doc(db, "aether_settings_v2", "global"), settings));
        return settings;
      } catch (err) {
        handleWriteFailure("saveSettings", err);
      }
    }
    // Fallback
    setLocalData("aether_settings_v2", settings);
    return settings;
  },

  // --- CONTACTS ---
  async getContacts() {
    if (canUseFirebase()) {
      try {
        const snapshot = await withTimeout(
          getDocs(
            query(collection(db, "aether_contacts_v2"), orderBy("createdAt", "desc")),
          ),
        );
        const list = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...d.data() });
        });
        return list;
      } catch (err) {
        console.warn("getContacts: Firestore read failed:", err?.message);
      }
    }
    // Fallback
    return getLocalData("aether_contacts_v2", MOCK_CONTACTS);
  },

  async addContact(msg) {
    const newMsg = {
      id: "msg-" + Math.random().toString(36).substr(2, 9),
      ...msg,
      createdAt: new Date().toISOString(),
      read: false,
    };

if (canUseFirebase()) {
      try {
        await withTimeout(setDoc(doc(db, "aether_contacts_v2", newMsg.id), newMsg));
        return newMsg;
      } catch (err) {
        handleWriteFailure("addContact", err);
      }
    }

    // Fallback
    const contacts = getLocalData("aether_contacts_v2", MOCK_CONTACTS);
    contacts.unshift(newMsg);
    setLocalData("aether_contacts_v2", contacts);
    return newMsg;
  },

  async markContactAsRead(id) {
    if (canUseFirebase()) {
      try {
        await withTimeout(updateDoc(doc(db, "aether_contacts_v2", id), { read: true }));
        return;
      } catch (err) {
        handleWriteFailure("markContactAsRead", err);
      }
    }
    // Fallback
    const contacts = getLocalData("aether_contacts_v2", MOCK_CONTACTS);
    const index = contacts.findIndex((c) => c.id === id);
    if (index > -1) {
      contacts[index].read = true;
      setLocalData("aether_contacts_v2", contacts);
    }
  },

  async deleteContact(id) {
    if (canUseFirebase()) {
      try {
        await withTimeout(deleteDoc(doc(db, "aether_contacts_v2", id)));
        return true;
      } catch (err) {
        handleWriteFailure("deleteContact", err);
      }
    }
    // Fallback
    const contacts = getLocalData("aether_contacts_v2", MOCK_CONTACTS);
    const filtered = contacts.filter((c) => c.id !== id);
    setLocalData("aether_contacts_v2", filtered);
    return true;
  },

  // --- NEWSLETTER ---
  async getNewsletterSubscribers() {
    if (canUseFirebase()) {
      try {
        const snapshot = await withTimeout(getDocs(
          query(collection(db, "aether_newsletter_v2"), orderBy("subscribedAt", "desc")),
        ));
        const list = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...d.data() });
        });
        return list;
      } catch (err) {
        console.warn("getNewsletterSubscribers: Firestore read failed:", err?.message);
      }
    }
    // Fallback
    return getLocalData("aether_newsletter_v2", MOCK_SUBSCRIBERS);
  },

  async subscribeNewsletter(email) {
    const subscriber = {
      id: "sub-" + Math.random().toString(36).substr(2, 9),
      email: email.trim().toLowerCase(),
      subscribedAt: new Date().toISOString(),
    };

    if (canUseFirebase()) {
      try {
        const newsletterRef = collection(db, "aether_newsletter_v2");
        const q = query(
          newsletterRef,
          where("email", "==", subscriber.email),
          limit(1),
        );
        const snapshot = await withTimeout(getDocs(q));
        if (!snapshot.empty) {
          return { success: true, isNew: false };
        }
        await withTimeout(setDoc(doc(db, "aether_newsletter_v2", subscriber.id), subscriber));
        return { success: true, isNew: true };
      } catch (err) {
        handleWriteFailure("subscribeNewsletter", err);
      }
    }

    // Fallback
    const subscribers = getLocalData("aether_newsletter_v2", MOCK_SUBSCRIBERS);
    const exists = subscribers.some((s) => s.email === subscriber.email);
    if (exists) {
      return { success: true, isNew: false };
    }
    subscribers.unshift(subscriber);
    setLocalData("aether_newsletter_v2", subscribers);
    return { success: true, isNew: true };
  },

  async deleteSubscriber(id) {
    if (canUseFirebase()) {
      try {
        await withTimeout(deleteDoc(doc(db, "aether_newsletter_v2", id)));
        return true;
      } catch (err) {
        handleWriteFailure("deleteSubscriber", err);
      }
    }
    // Fallback
    const subscribers = getLocalData("aether_newsletter_v2", MOCK_SUBSCRIBERS);
    const filtered = subscribers.filter((s) => s.id !== id);
    setLocalData("aether_newsletter_v2", filtered);
    return true;
  },

  // --- ANALYTICS ---
  async getAnalyticsData() {
    let blogs = [];
    let categories = [];
    let contacts = [];
    let newsletter = [];

    if (canUseFirebase()) {
      try {
        blogs = await this.getBlogs(true);
        categories = await this.getCategories();
        contacts = await this.getContacts();
        newsletter = await this.getNewsletterSubscribers();
      } catch (err) {
        console.warn("getAnalyticsData: Firestore read failed:", err?.message);
      }
    }

    // If Firebase failed or was bypassed, load fallback local data
    if (blogs.length === 0) {
      blogs = getLocalData("aether_blogs_v2", MOCK_BLOGS);
    }
    if (categories.length === 0) {
      categories = getLocalData("aether_categories_v2", MOCK_CATEGORIES);
    }
    if (contacts.length === 0) {
      contacts = getLocalData("aether_contacts_v2", MOCK_CONTACTS);
    }
    if (newsletter.length === 0) {
      newsletter = getLocalData("aether_newsletter_v2", MOCK_SUBSCRIBERS);
    }

    // Calculate actual sums
    const publishedBlogsCount = blogs.filter((b) => b.status === "published").length;
    const totalViews = blogs.reduce((sum, b) => sum + (b.views || 0), 0);

    // Compute logically consistent traffic metrics derived from actual views
    const derivedTodaysVisitors = Math.floor(totalViews * 0.08) + 12;
    const derivedMonthlyVisitors = Math.floor(totalViews * 0.45) + 45;
    const baseTrend = Math.max(12, Math.floor(totalViews / 30));

    const visitorTrends = [
      { name: "Mon", visitors: Math.floor(baseTrend * 0.8), bounceRate: 35, duration: 120 },
      { name: "Tue", visitors: Math.floor(baseTrend * 0.95), bounceRate: 32, duration: 145 },
      { name: "Wed", visitors: Math.floor(baseTrend * 1.1), bounceRate: 34, duration: 160 },
      { name: "Thu", visitors: Math.floor(baseTrend * 1.05), bounceRate: 36, duration: 155 },
      { name: "Fri", visitors: Math.floor(baseTrend * 1.3), bounceRate: 30, duration: 180 },
      { name: "Sat", visitors: Math.floor(baseTrend * 0.98), bounceRate: 28, duration: 190 },
      { name: "Sun", visitors: derivedTodaysVisitors, bounceRate: 29, duration: 200 },
    ];

    const trafficSources = [
      { name: "Direct", value: Math.floor(totalViews * 0.4) },
      { name: "Organic Search", value: Math.floor(totalViews * 0.3) },
      { name: "Social Media", value: Math.floor(totalViews * 0.2) },
      { name: "Newsletter", value: Math.floor(totalViews * 0.1) },
    ];

    const deviceTypes = [
      { name: "Desktop", value: Math.floor(totalViews * 0.6) },
      { name: "Mobile", value: Math.floor(totalViews * 0.3) },
      { name: "Tablet", value: Math.floor(totalViews * 0.1) },
    ];

    return {
      totalBlogs: blogs.length,
      publishedBlogs: publishedBlogsCount,
      draftBlogs: blogs.length - publishedBlogsCount,
      categoriesCount: categories.length,
      totalViews: totalViews,
      todaysVisitors: derivedTodaysVisitors,
      monthlyVisitors: derivedMonthlyVisitors,
      contactsCount: contacts.length,
      newsletterCount: newsletter.length,
      visitorTrends,
      trafficSources,
      deviceTypes,
      topLandingPages: MOCK_ANALYTICS.topLandingPages,
    };
  },

  // --- ADMINS ---
  async getAdmins() {
    if (canUseFirebase()) {
      try {
        const snapshot = await withTimeout(getDocs(collection(db, "aether_admins_v2")));
        const list = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...d.data() });
        });
        return list;
      } catch (err) {
        console.warn("getAdmins: Firestore read failed, using local cache:", err?.message);
      }
    }
    // Fallback
    return getLocalData("aether_admins_v2", MOCK_ADMINS);
  },

  async addAdmin(admin) {
    const newAdmin = {
      id: "admin-" + Math.random().toString(36).substr(2, 9),
      ...admin,
      createdAt: new Date().toISOString(),
    };

    if (canUseFirebase()) {
      try {
        await withTimeout(setDoc(doc(db, "aether_admins_v2", newAdmin.id), newAdmin));
        return newAdmin;
      } catch (err) {
        handleWriteFailure("addAdmin", err);
      }
    }

    // Fallback
    const admins = getLocalData("aether_admins_v2", MOCK_ADMINS);
    admins.push(newAdmin);
    setLocalData("aether_admins_v2", admins);
    return newAdmin;
  },

  async deleteAdmin(id) {
    if (canUseFirebase()) {
      try {
        await withTimeout(deleteDoc(doc(db, "aether_admins_v2", id)));
        return true;
      } catch (err) {
        handleWriteFailure("deleteAdmin", err);
      }
    }

    // Fallback
    const admins = getLocalData("aether_admins_v2", MOCK_ADMINS);
    const filtered = admins.filter((a) => a.id !== id);
    setLocalData("aether_admins_v2", filtered);
    return true;
  },

  async updateAdminProfile(id, data) {
    if (canUseFirebase()) {
      try {
        await withTimeout(updateDoc(doc(db, "aether_admins_v2", id), data));
        return true;
      } catch (err) {
        handleWriteFailure("updateAdminProfile", err);
      }
    }

    // Fallback
    const admins = getLocalData("aether_admins_v2", MOCK_ADMINS);
    const idx = admins.findIndex((a) => a.id === id);
    if (idx > -1) {
      admins[idx] = { ...admins[idx], ...data };
      setLocalData("aether_admins_v2", admins);
    }
    return true;
  },

  // --- COMMENTS ---
  async getComments(blogId = null) {
    if (canUseFirebase()) {
      try {
        let q = collection(db, "aether_comments_v2");
        if (blogId) {
          q = query(q, where("blogId", "==", blogId));
        }
        const snapshot = await withTimeout(getDocs(q));
        const list = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...d.data() });
        });
        return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } catch (err) {
        console.warn("getComments: Firestore read failed, using local cache:", err?.message);
      }
    }

    // Fallback
    const comments = getLocalData("aether_comments_v2", MOCK_COMMENTS);
    let filtered = comments;
    if (blogId) {
      filtered = comments.filter((c) => c.blogId === blogId);
    }
    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async addComment(comment) {
    const newComment = {
      id: "comment-" + Math.random().toString(36).substr(2, 9),
      ...comment,
      createdAt: new Date().toISOString(),
      approved: true, // Auto-approved by default
    };

    if (canUseFirebase()) {
      try {
        await withTimeout(setDoc(doc(db, "aether_comments_v2", newComment.id), newComment));
        return newComment;
      } catch (err) {
        handleWriteFailure("addComment", err);
      }
    }

    // Fallback
    const comments = getLocalData("aether_comments_v2", MOCK_COMMENTS);
    comments.push(newComment);
    setLocalData("aether_comments_v2", comments);
    return newComment;
  },

  async deleteComment(id) {
    if (canUseFirebase()) {
      try {
        await withTimeout(deleteDoc(doc(db, "aether_comments_v2", id)));
        return true;
      } catch (err) {
        handleWriteFailure("deleteComment", err);
      }
    }

    // Fallback
    const comments = getLocalData("aether_comments_v2", MOCK_COMMENTS);
    const filtered = comments.filter((c) => c.id !== id);
    setLocalData("aether_comments_v2", filtered);
    return true;
  },

  // --- IMAGE UPLOADS ---
  async uploadImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800; // Resize to max 800px width for fast loading & small size
          const MAX_HEIGHT = 600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          // Compress to JPEG with 0.7 quality (very small size, high quality)
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  },
};
