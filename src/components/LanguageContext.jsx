"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export const LANGUAGES = [
  { code: "mr", name: "मराठी", label: "Marathi", flag: "🚩" },
  { code: "en", name: "English", label: "English", flag: "🇬🇧" },
  { code: "hi", name: "हिंदी", label: "Hindi", flag: "🇮🇳" },
];

export const TRANSLATIONS = {
  mr: {
    nav_home: "तपास",
    nav_categories: "विषय सूची",
    nav_about: "आमच्याबद्दल",
    nav_contact: "संपर्क",
    nav_search: "शोधा...",
    nav_dashboard: "डॅशबोर्ड",
    
    spotlight_tag: "विशेष तपास",
    read_full_story: "संपूर्ण कथा वाचा",
    latest_blogs_title: "नवीन तपास आणि शोधकथा",
    latest_blogs_subtitle: "सत्यशोध आणि पुराव्यांवर आधारित चालू तपासणी",
    show_all: "सर्व दाखवा",
    read_more: "वाचा",
    minutes_read: "मिनिटे वाचन",
    previous_investigations: "मागील तपासणी",
    categories_title: "विषय सूची",
    categories_subtitle: "सत्यवेधच्या व्यासपीठावर आम्ही विविध पैलूंनी इतिहासाचा आणि वर्तमानाचा वेध घेतो.",
    read_investigation: "शोधकथा वाचा",
    analyses: "विश्लेषणे",
    articles_research: "लेख व संशोधन",
    documentaries_history: "माहितीपट आणि इतिहास",
    quote_text: "इतिहास कधीच मरत नाही... तो फक्त पुन्हा वाचला जातो.",
    quote_author: "सत्यवेध संपादकीय",
    popular_documentaries: "लोकप्रिय माहितीपट",
    popular_documentaries_subtitle: "सखोल संशोधनावर आधारित लेख आणि वृत्त",
    no_blogs_found: "कोणतेही लेख आढळले नाहीत.",
    
    footer_tagline: "इतिहासाच्या पाऊलखुणांचा वैज्ञानिक आणि पुराव्यांवर आधारित वेध घेणारे महाराष्ट्रातील अग्रगण्य व्यासपीठ.",
    links: "दुवे",
    information: "माहिती",
    editorial_policy: "संपादकीय धोरणे",
    subscription: "सदस्यता",
    subscription_text: "नवीन तपासांचे अपडेट्स थेट तुमच्या ईमेलवर मिळवा.",
    email_placeholder: "ईमेल पत्ता",
    subscribe_button: "सबस्क्राईब करा",
    subscription_success: "तुमची सदस्यता यशस्वी झाली आहे!",
    all_rights_reserved: "सर्व हक्क सुरक्षित.",
    
    browse_by_category: "विषय सूचीनुसार ब्राउझ करा",
    categories_desc: "आमच्या डिझाईन आर्किटेक्ट्स, कोड क्रिएटर्स आणि डेटाबेस तज्ञांनी लिहिलेले विशेष स्तंभ.",
    search_categories: "वर्ग शोधा...",
    clear: "स्पष्ट करा",
    categories_available: "श्रेण्या उपलब्ध आहेत",
    articles_count: "लेख",
    explore_articles: "लेख एक्सप्लोर करा",
    
    back_to_articles: "मागे जा",
    views: "व्ह्यूज",
    min_read: "मिनिटे वाचन",
    share: "शेअर करा",
    copied: "कॉपी केले!",
    comments: "प्रतिक्रिया",
    leave_comment: "प्रतिक्रिया द्या",
    your_name: "तुमचे नाव",
    write_comment: "तुमची प्रतिक्रिया लिहा...",
    post_comment: "प्रतिक्रिया पोस्ट करा",
    comment_success: "प्रतिक्रिया यशस्वीरीत्या जोडली गेली!",
    related_articles: "संबंधित लेख",

    get_in_touch: "संपर्कात रहा",
    contact_desc: "तुमच्या मनात काही प्रश्न किंवा विचार आहेत का? आम्हाला संदेश पाठवा.",
    name: "नाव",
    email: "ईमेल",
    message: "संदेश",
    send_message: "संदेश पाठवा",

    about_us: "आमच्याबद्दल",
    admin_dashboard: "डॅशबोर्ड",
    admin_blogs: "लेख व्यवस्थापन",
    admin_categories: "श्रेण्या",
    admin_messages: "संदेश",
    admin_newsletter: "न्यूजलेटर",
    admin_media: "मीडिया लायब्ररी",
    admin_settings: "सेटिंग्ज",
    admin_admins: "प्रशासक",
    visitor_portal: "मुख्य वेबसाईट",
    sign_out: "लॉग आउट",
    photo_credit: "फोटो सौजन्य",
  },
  en: {
    nav_home: "Home",
    nav_categories: "Categories",
    nav_about: "About Us",
    nav_contact: "Contact",
    nav_search: "Search...",
    nav_dashboard: "Dashboard",
    
    spotlight_tag: "Special Investigation",
    read_full_story: "Read Full Story",
    latest_blogs_title: "Latest Investigations & Stories",
    latest_blogs_subtitle: "Ongoing truth-seeking and evidence-based investigations",
    show_all: "Show All",
    read_more: "Read",
    minutes_read: "min read",
    previous_investigations: "Previous Investigations",
    categories_title: "Categories Directory",
    categories_subtitle: "Exploring history, present events, and scientific analysis.",
    read_investigation: "Read Investigation",
    analyses: "Analyses",
    articles_research: "Articles & Research",
    documentaries_history: "Documentaries & History",
    quote_text: "History never dies... it is simply re-read.",
    quote_author: "Satyavedh Editorial",
    popular_documentaries: "Popular Documentaries",
    popular_documentaries_subtitle: "In-depth research-backed articles and reports",
    no_blogs_found: "No articles found.",
    
    footer_tagline: "Maharashtra's leading platform exploring historical footprints with scientific & evidence-based rigor.",
    links: "Quick Links",
    information: "Information",
    editorial_policy: "Editorial Policies",
    subscription: "Newsletter Subscription",
    subscription_text: "Get updates on new investigations directly to your email.",
    email_placeholder: "Enter your email address",
    subscribe_button: "Subscribe",
    subscription_success: "You have successfully subscribed!",
    all_rights_reserved: "All rights reserved.",
    
    browse_by_category: "Browse by Category",
    categories_desc: "Specialized columns authored by design architects, code creators, and research experts.",
    search_categories: "Search categories...",
    clear: "Clear",
    categories_available: "categories available",
    articles_count: "articles",
    explore_articles: "Explore Articles",
    
    back_to_articles: "Back to Articles",
    views: "views",
    min_read: "min read",
    share: "Share",
    copied: "Copied!",
    comments: "Comments",
    leave_comment: "Leave a Comment",
    your_name: "Your Name",
    write_comment: "Write your comment...",
    post_comment: "Post Comment",
    comment_success: "Comment posted successfully!",
    related_articles: "Related Articles",

    get_in_touch: "Get in Touch",
    contact_desc: "Have any questions or thoughts? Send us a message.",
    name: "Name",
    email: "Email",
    message: "Message",
    send_message: "Send Message",

    about_us: "About Us",
    admin_dashboard: "Dashboard",
    admin_blogs: "Blogs",
    admin_categories: "Categories",
    admin_messages: "Messages",
    admin_newsletter: "Newsletter",
    admin_media: "Media Library",
    admin_settings: "Settings",
    admin_admins: "Admins",
    visitor_portal: "Visitor Portal",
    sign_out: "Sign Out",
    photo_credit: "Photo Credit",
  },
  hi: {
    nav_home: "जांच",
    nav_categories: "विषय सूची",
    nav_about: "हमारे बारे में",
    nav_contact: "संपर्क",
    nav_search: "खोजें...",
    nav_dashboard: "डैशबोर्ड",
    
    spotlight_tag: "विशेष जांच",
    read_full_story: "पूरी कहानी पढ़ें",
    latest_blogs_title: "नवीनतम जांच और शोध गाथाएं",
    latest_blogs_subtitle: "सत्य-खोज और साक्ष्यों पर आधारित जांच",
    show_all: "सभी दिखाएं",
    read_more: "पढ़ें",
    minutes_read: "मिनट पठन",
    previous_investigations: "पिछली जांच",
    categories_title: "विषय सूची",
    categories_subtitle: "इतिहास और वर्तमान के विविध पहलुओं की जांच।",
    read_investigation: "जांच पढ़ें",
    analyses: "विश्लेषण",
    articles_research: "लेख एवं अनुसंधान",
    documentaries_history: "वृत्तचित्र और इतिहास",
    quote_text: "इतिहास कभी नहीं मरता... वह बस पुन: पढ़ा जाता है।",
    quote_author: "सत्यवेध संपादकीय",
    popular_documentaries: "लोकप्रिय वृत्तचित्र",
    popular_documentaries_subtitle: "गहन शोध पर आधारित लेख और रिपोर्ट",
    no_blogs_found: "कोई लेख नहीं मिला।",
    
    footer_tagline: "वैज्ञानिक और साक्ष्य-आधारित दृष्टिकोण से इतिहास के पदचिन्हों की जांच करने वाला प्रमुख मंच।",
    links: "त्वरित लिंक",
    information: "जानकारी",
    editorial_policy: "संपादकीय नीतियां",
    subscription: "सदस्यता",
    subscription_text: "नई जांचों के अपडेट सीधे अपने ईमेल पर प्राप्त करें।",
    email_placeholder: "ईमेल पता दर्ज करें",
    subscribe_button: "सदस्यता लें",
    subscription_success: "आपकी सदस्यता सफल रही!",
    all_rights_reserved: "सर्वाधिकार सुरक्षित।",
    
    browse_by_category: "श्रेणी अनुसार खोजें",
    categories_desc: "डिजाइन आर्किटेक्ट्स और विशेषज्ञों द्वारा लिखे गए विशेष स्तंभ।",
    search_categories: "श्रेणियां खोजें...",
    clear: "साफ़ करें",
    categories_available: "श्रेणियां उपलब्ध हैं",
    articles_count: "लेख",
    explore_articles: "लेख एक्सप्लोर करें",
    
    back_to_articles: "वापस जाएं",
    views: "व्यूज",
    min_read: "मिनट पठन",
    share: "शेयर करें",
    copied: "कॉपी हो गया!",
    comments: "टिप्पणियां",
    leave_comment: "टिप्पणी लिखें",
    your_name: "आपका नाम",
    write_comment: "अपनी टिप्पणी लिखें...",
    post_comment: "पोस्ट करें",
    comment_success: "टिप्पणी सफलतापूर्वक जोड़ी गई!",
    related_articles: "संबंधित लेख",

    get_in_touch: "संपर्क करें",
    contact_desc: "कोई प्रश्न या विचार है? हमें संदेश भेजें।",
    name: "नाम",
    email: "ईमेल",
    message: "संदेश",
    send_message: "संदेश भेजें",

    about_us: "हमारे बारे में",
    admin_dashboard: "डैशबोर्ड",
    admin_blogs: "लेख प्रबंधन",
    admin_categories: "श्रेणियां",
    admin_messages: "संदेश",
    admin_newsletter: "न्यूजलेटर",
    admin_media: "मीडिया गैलरी",
    admin_settings: "सेटिंग्स",
    admin_admins: "प्रशासक",
    visitor_portal: "मुख्य वेबसाइट",
    sign_out: "साइन आउट",
    photo_credit: "फोटो साभार",
  }
};

export const CONTENT_TRANSLATIONS = {
  en: {
    // Post Titles
    "कृत्रिम बुद्धिमत्ता (AI) आणि मानवी जीवन: एक नवी दिशा": "Artificial Intelligence (AI) and Human Life: A New Direction",
    "वेब डिझाइनमधील आधुनिक ट्रेंड्स २०२६": "Modern Trends in Web Design 2026",
    "वेब डिझाइनमधील आधुनिक ट्रेंड्स 2026": "Modern Trends in Web Design 2026",
    "रिएक्ट १९ मधील नवीन फीचर्स आणि त्यांचे फायदे": "New Features in React 19 and Their Benefits",
    "सायबर सुरक्षा: तुमचे डिजिटल अस्तित्व कसे सुरक्षित ठेवावे?": "Cyber Security: How to Protect Your Digital Presence?",
    "युझर इंटरफेस (UI) डिझाइनचे ५ महत्त्वाचे नियम": "5 Essential Rules of User Interface (UI) Design",
    "डेटा सायन्समध्ये करिअर कसे करावे?": "How to Build a Career in Data Science?",
    "क्लाउड कम्प्युटिंग: भविष्यातील तंत्रज्ञानाचा पाया": "Cloud Computing: The Foundation of Future Technology",

    // Post Excerpts
    "कृत्रिम बुद्धिमत्ता (AI) आपल्या दैनंदिन जीवनाचा एक महत्त्वाचा भाग बनत चालली आहे. या लेखात आपण त्याचे मानवी जीवनावरील सकारात्मक आणि नकारात्मक परिणाम पाहणार आहोत.": "Artificial Intelligence (AI) is becoming an essential part of our daily lives. In this article, we explore its positive and negative impacts on human life.",
    "वेब डिझाइन जग सतत बदलत असते. या वर्षात लोकप्रिय ठरणारे ग्लासमॉर्फिझम, थ्रीडी एलिमेंट्स आणि डार्क मोड डिझाइन्स याविषयी सविस्तर माहिती घ्या.": "The web design world is constantly evolving. Get detailed insights into glassmorphism, 3D elements, and dark mode designs trending this year.",
    "वेब डिझाइन जग सतत बदलत असते. या वर्षात लोकप्रिय ठरणारे ग्लासमॉर्फिझम, 3डी एलिमेंट्स आणि डार्क मोड डिझाइन्स याविषयी सविस्तर माहिती घ्या.": "The web design world is constantly evolving. Get detailed insights into glassmorphism, 3D elements, and dark mode designs trending this year.",
    "रिएक्ट १९ चे नवीन कॉम्पायलर आणि रिॲक्ट सर्वर कॉम्पोनंट्स (RSC) डिझाइनिंगला आणि परफॉर्मन्सला कशी नवी गती देणार आहेत ते समजून घ्या.": "Understand how the new React 19 compiler and React Server Components (RSC) bring new speed to design and performance.",
    "आजच्या डिजिटल युगात सायबर गुन्हेगारी वेगाने वाढत आहे. या लेखात आपण आपले सोशल मीडिया खाती, बँक खाती आणि वैयक्तिक डेटा सुरक्षित ठेवण्यासाठी काही टिप्स जाणून घेणार आहोत.": "Cybercrime is growing rapidly in today's digital era. In this article, we share key tips to keep your social media accounts, bank accounts, and personal data secure.",
    "एक उत्तम युझर इंटरफेस कसा डिझाइन करावा? या लेखात आपण UI डिझाइनचे ५ सोपे पण अत्यंत प्रभावी नियम अभ्यासणार आहोत जे प्रत्येक डिझायनरला माहित असावेत.": "How to design a great user interface? In this article, we study 5 simple yet highly effective UI design rules that every designer should know.",
    "डेटा सायन्स हे सध्याच्या काळातील सर्वात जास्त मागणी असलेले क्षेत्र आहे. या क्षेत्रात करिअर करण्यासाठी कोणती कौशल्ये आवश्यक आहेत आणि सुरुवात कशी करावी याबद्दल मार्गदर्शन.": "Data science is one of the most in-demand fields today. Learn what skills are required and how to get started in this career path.",
    "AWS, Google Cloud आणि Azure यांसारख्या क्लाउड प्लॅटफॉर्म्सचे महत्त्व आणि ते आजच्या व्यवसायांचे संचालन कसे बदलत आहेत, याबद्दल सविस्तर माहिती.": "Detailed insights into the importance of cloud platforms like AWS, Google Cloud, and Azure, and how they are transforming business operations today.",

    // Categories
    "वेब डेव्हलपमेंट": "Web Development",
    "डिझाईन सिस्टम": "Design Systems",
    "कृत्रिम बुद्धिमत्ता": "Artificial Intelligence",
    "सायबर सुरक्षा": "Cyber Security",
    "डेटा सायन्स": "Data Science",
    "क्लाउड कम्प्युटिंग": "Cloud Computing",
    "मोबाईल ॲप्स": "Mobile Apps",
    "डेटाबेस मॅनेजमेंट": "Database Management",
    "यूआय/यूएक्स डिझाईन": "UI/UX Design",
    "डेव्हऑप्स इंजिनिअरिंग": "DevOps Engineering",
  },
  hi: {
    // Post Titles
    "कृत्रिम बुद्धिमत्ता (AI) आणि मानवी जीवन: एक नवी दिशा": "कृत्रिम बुद्धिमत्ता (AI) और मानव जीवन: एक नई दिशा",
    "वेब डिझाइनमधील आधुनिक ट्रेंड्स २०२६": "वेब डिज़ाइन में आधुनिक ट्रेंड्स 2026",
    "वेब डिझाइनमधील आधुनिक ट्रेंड्स 2026": "वेब डिज़ाइन में आधुनिक ट्रेंड्स 2026",
    "रिएक्ट १९ मधील नवीन फीचर्स आणि त्यांचे फायदे": "रिएक्ट 19 में नए फीचर्स और उनके लाभ",
    "सायबर सुरक्षा: तुमचे डिजिटल अस्तित्व कसे सुरक्षित ठेवावे?": "साइबर सुरक्षा: अपनी डिजिटल उपस्थिति को कैसे सुरक्षित रखें?",
    "युझर इंटरफेस (UI) डिझाइनचे ५ महत्त्वाचे नियम": "यूजर इंटरफेस (UI) डिज़ाइन के 5 महत्वपूर्ण नियम",
    "डेटा सायन्समध्ये करिअर कसे करावे?": "डेटा साइंस में करियर कैसे बनाएं?",
    "क्लाउड कम्प्युटिंग: भविष्यातील तंत्रज्ञानाचा पाया": "क्लाउड कंप्यूटिंग: भविष्य की तकनीक की नींव",

    // Post Excerpts
    "कृत्रिम बुद्धिमत्ता (AI) आपल्या दैनंदिन जीवनाचा एक महत्त्वाचा भाग बनत चालली आहे. या लेखात आपण त्याचे मानवी जीवनावरील सकारात्मक आणि नकारात्मक परिणाम पाहणार आहोत.": "कृत्रिम बुद्धिमत्ता (AI) हमारे दैनिक जीवन का एक महत्वपूर्ण हिस्सा बनती जा रही है। इस लेख में हम मानव जीवन पर इसके प्रभाव को देखेंगे।",
    "वेब डिझाइन जग सतत बदलत असते. या वर्षात लोकप्रिय ठरणारे ग्लासमॉर्फिझम, थ्रीडी एलिमेंट्स आणि डार्क मोड डिझाइन्स याविषयी सविस्तर माहिती घ्या.": "वेब डिज़ाइन की दुनिया लगातार बदल रही है। इस वर्ष लोकप्रिय होने वाले ग्लासमोर्फिज्म, 3D एलिमेंट्स और डार्क मोड डिज़ाइन के बारे में विस्तार से जानें।",
    "वेब डिझाइन जग सतत बदलत असते. या वर्षात लोकप्रिय ठरणारे ग्लासमॉर्फिझम, 3डी एलिमेंट्स आणि डार्क मोड डिझाइन्स याविषयी सविस्तर माहिती घ्या.": "वेब डिज़ाइन की दुनिया लगातार बदल रही है। इस वर्ष लोकप्रिय होने वाले ग्लासमोर्फिज्म, 3D एलिमेंट्स और डार्क मोड डिज़ाइन के बारे में विस्तार से जानें।",
    "रिएक्ट १९ चे नवीन कॉम्पायलर आणि रिॲक्ट सर्वर कॉम्पोनंट्स (RSC) डिझाइनिंगला आणि परफॉर्मन्सला कशी नवी गती देणार आहेत ते समजून घ्या.": "समझें कि कैसे नया रिएक्ट 19 कंपाइलर और रिएक्ट सर्वर कंपोनेंट्स (RSC) डिज़ाइनिंग और परफॉर्मेंस को नई गति देंगे।",
    "आजच्या डिजिटल युगात सायबर गुन्हेगारी वेगाने वाढत आहे. या लेखात आपण आपले सोशल मीडिया खाती, बँक खाती आणि वैयक्तिक डेटा सुरक्षित ठेवण्यासाठी काही टिप्स जाणून घेणार आहोत.": "आज के डिजिटल युग में साइबर अपराध तेजी से बढ़ रहा है। इस लेख में हम सोशल मीडिया अकाउंट और पर्सनल डेटा सुरक्षित रखने के टिप्स जानेंगे।",
    "एक उत्तम युझर इंटरफेस कसा डिझाइन करावा? या लेखात आपण UI डिझाइनचे ५ सोपे पण अत्यंत प्रभावी नियम अभ्यासणार आहोत जे प्रत्येक डिझायनरला माहित असावेत.": "एक बेहतरीन यूजर इंटरफेस कैसे डिजाइन करें? इस लेख में हम UI डिज़ाइन के 5 सरल लेकिन अत्यधिक प्रभावी नियमों का अध्ययन करेंगे।",
    "डेटा सायन्स हे सध्याच्या काळातील सर्वात जास्त मागणी असलेले क्षेत्र आहे. या क्षेत्रात करिअर करण्यासाठी कोणती कौशल्ये आवश्यक आहेत आणि सुरुवात कशी करावी याबद्दल मार्गदर्शन.": "डेटा साइंस वर्तमान समय के सबसे मांग वाले क्षेत्रों में से एक है। जानें कि इस क्षेत्र में करियर बनाने के लिए कौन से कौशल आवश्यक हैं।",
    "AWS, Google Cloud आणि Azure यांसारख्या क्लाउड प्लॅटफॉर्म्सचे महत्त्व आणि ते आजच्या व्यवसायांचे संचालन कसे बदलत आहेत, याबद्दल सविस्तर माहिती.": "AWS, Google Cloud और Azure जैसे क्लाउड प्लेटफॉर्म के महत्व और वे आज के व्यावसायिक संचालन को कैसे बदल रहे हैं, इस पर विस्तृत जानकारी।",

    // Categories
    "वेब डेव्हलपमेंट": "वेब डेवलपमेंट",
    "डिझाईन सिस्टम": "डिजाइन सिस्टम",
    "कृत्रिम बुद्धिमत्ता": "कृत्रिम बुद्धिमत्ता",
    "सायबर सुरक्षा": "साइबर सुरक्षा",
    "डेटा सायन्स": "डेटा साइंस",
    "क्लाउड कम्प्युटिंग": "क्लाउड कंप्यूटिंग",
    "मोबाईल ॲप्स": "मोबाइल ऐप्स",
    "डेटाबेस मॅनेजमेंट": "डेटाबेस मैनेजमेंट",
    "यूआय/यूएक्स डिझाईन": "यूआई/यूएक्स डिजाइन",
    "डेव्हऑप्स इंजिनिअरिंग": "डेवऑप्स इंजीनियरिंग",
  }
};

const LanguageContext = createContext(undefined);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("mr");

  useEffect(() => {
    const saved = localStorage.getItem("aether_language");
    if (saved && TRANSLATIONS[saved]) {
      setLanguage(saved);
    }
  }, []);

  const changeLanguage = (code) => {
    if (TRANSLATIONS[code]) {
      setLanguage(code);
      localStorage.setItem("aether_language", code);
    }
  };

  const t = (key) => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.mr;
    return dict[key] || TRANSLATIONS.mr[key] || key;
  };

  const translateText = (text) => {
    if (!text || language === "mr") return text;
    const langDict = CONTENT_TRANSLATIONS[language];
    if (langDict && langDict[text]) {
      return langDict[text];
    }
    // Also try fuzzy normalized key lookup
    if (langDict) {
      const normalizedKey = Object.keys(langDict).find(k => k.trim() === String(text).trim());
      if (normalizedKey) return langDict[normalizedKey];
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, translateText, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: "mr",
      changeLanguage: () => {},
      t: (key) => TRANSLATIONS.mr[key] || key,
      translateText: (text) => text,
      languages: LANGUAGES,
    };
  }
  return context;
};
