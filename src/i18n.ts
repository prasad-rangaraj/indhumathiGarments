import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      nav: {
        about: "About",
        products: "Products",
        contact: "Contact",
        faq: "FAQ",
        searchPlaceholder: "Search products...",
        login: "Login",
        loginSignUp: "Login / Sign Up",
        myOrders: "My Orders",
        myWishlist: "My Wishlist",
        profileDashboard: "Profile / Dashboard",
        logout: "Logout"
      },
      footer: {
        quickLinks: "Quick Links",
        customerService: "Customer Service",
        newsletter: "Newsletter",
        newsletterDesc: "Subscribe to get updates on new products and exclusive offers.",
        emailPlaceholder: "Your email",
        subscribedSuccess: "Subscribed successfully!",
        terms: "Terms & Conditions",
        privacy: "Privacy Policy",
        returnsExchanges: "Returns & Exchanges",
        aboutUs: "About Us",
        orderHistory: "Order History",
        copyright: "© {{year}} {{siteName}}. All rights reserved.",
        brandDesc: "Manufacturing high quality pure cotton women inners. Comfort and elegance for over two decades."
      },
      about: {
        title: "Indhumathi Garments",
        subtitle: "Premium Cotton Attire & Clothing",
        tagline: "Manufacturing high quality pure cotton garments for men and women",
        heroDesc: "For over two decades, we've been dedicated to creating the finest cotton garments that combines comfort, quality, and elegance. Every piece is crafted with love and attention to detail.",
        shopNow: "Shop Now",
        ourStory: "Our Story",
        storyP1: "Founded in 2001, Indhumathi began as a small family business with a simple mission: to provide everyone with the most comfortable, high-quality cotton garments. What started in a small workshop has grown into a trusted brand known for our commitment to natural fabrics and superior craftsmanship.",
        storyP2: "We believe that comfort should never be compromised. That's why we source only the finest cotton fibers and employ traditional techniques alongside modern innovation to create clothing that feels as good as it looks.",
        premiumQuality: "Premium Quality",
        pureCotton: "100% Pure Cotton",
        madeWithLove: "Made with Love",
        handcraftedCare: "Handcrafted Care",
        skinSafe: "Skin Safe",
        hypoallergenic: "Hypoallergenic",
        ecoFriendly: "Eco Friendly",
        sustainableProcesses: "Sustainable Processes",
        yearsExperience: "20 +",
        yearsExperienceTitle: "Years Experience",
        trustedBrand: "Trusted Brand",
        whyChooseTitle: "Why Choose Indhumathi Garments?",
        pureCottonPromise: "Pure Cotton Promise",
        pureCottonPromiseDesc: "We use only 100% pure cotton, ensuring breathability, softness, and comfort for sensitive skin. No synthetic blends, no compromises.",
        expertCraftsmanship: "Expert Craftsmanship",
        expertCraftsmanshipDesc: "Each piece is carefully crafted by skilled artisans who understand the importance of fit, comfort, and durability in daily wear.",
        affordableLuxury: "Affordable Luxury",
        affordableLuxuryDesc: "We believe everyone deserves quality garments. Our direct-to-consumer model ensures premium products at accessible prices."
      }
    }
  },
  ta: {
    translation: {
      nav: {
        about: "எங்களைப் பற்றி",
        products: "தயாரிப்புகள்",
        contact: "தொடர்பு கொள்ள",
        faq: "கேள்வி-பதில்",
        searchPlaceholder: "தயாரிப்புகளைத் தேடுக...",
        login: "உள்நுழைக",
        loginSignUp: "உள்நுழைக / பதிவு செய்க",
        myOrders: "எனது ஆர்டர்கள்",
        myWishlist: "எனது விருப்பப்பட்டியல்",
        profileDashboard: "சுயவிவரம் / டாஷ்போர்டு",
        logout: "வெளியேறுக"
      },
      footer: {
        quickLinks: "விரைவு இணைப்புகள்",
        customerService: "வாடிக்கையாளர் சேவை",
        newsletter: "செய்திமடல்",
        newsletterDesc: "புதிய தயாரிப்புகள் மற்றும் பிரத்தியேக சலுகைகள் பற்றிய அறிவிப்புகளைப் பெற பதிவு செய்யவும்.",
        emailPlaceholder: "உங்கள் மின்னஞ்சல்",
        subscribedSuccess: "வெற்றிகரமாக பதிவு செய்யப்பட்டது!",
        terms: "விதிமுறைகள் மற்றும் நிபந்தனைகள்",
        privacy: "தனியுரிமைக் கொள்கை",
        returnsExchanges: "திரும்பப் பெறுதல் மற்றும் மாற்றுதல்",
        aboutUs: "எங்களைப் பற்றி",
        orderHistory: "ஆர்டர் வரலாறு",
        copyright: "© {{year}} {{siteName}}. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.",
        brandDesc: "உயர்தர சுத்தமான பருத்தி பெண்களுக்கான உள் ஆடைகள் தயாரிப்பாளர்கள். இரண்டு தசாப்தங்களுக்கும் மேலாக வசதி மற்றும் நேர்த்தி."
      },
      about: {
        title: "இந்துமதி கார்மெண்ட்ஸ்",
        subtitle: "பிரீமியம் பருத்தி ஆடைகள்",
        tagline: "ஆண்களுக்கும் பெண்களுக்கும் உயர்தர சுத்தமான பருத்தி ஆடைகளை தயாரித்தல்",
        heroDesc: "இரண்டு தசாப்தங்களுக்கும் மேலாக, வசதி, தரம் மற்றும் நேர்த்தியை இணைக்கும் சிறந்த பருத்தி ஆடைகளை உருவாக்க நாங்கள் அர்ப்பணித்துள்ளோம். ஒவ்வொரு ஆடையும் அன்புடனும் விரிவான கவனத்துடனும் வடிவமைக்கப்பட்டுள்ளது.",
        shopNow: "இப்பொழுதே வாங்குங்கள்",
        ourStory: "எங்கள் கதை",
        storyP1: "2001 இல் நிறுவப்பட்ட இந்துமதி, அனைவருக்கும் மிகவும் வசதியான, உயர்தர பருத்தி ஆடைகளை வழங்குவதற்கான எளிய நோக்கத்துடன் ஒரு சிறிய குடும்ப வணிகமாகத் தொடங்கியது. ஒரு சிறிய பட்டறையில் தொடங்கியது, இயற்கை துணிகள் மற்றும் சிறந்த கைவினைத்திறனுக்கான எங்கள் அர்ப்பணிப்புக்காக அறியப்பட்ட ஒரு நம்பகமான பிராண்டாக வளர்ந்துள்ளது.",
        storyP2: "வசதி ஒருபோதும் சமரசம் செய்யப்படக்கூடாது என்று நாங்கள் நம்புகிறோம். அதனால்தான் நாங்கள் மிகச்சையந்த பருத்தி இழைகளை மட்டுமே பெறுகிறோம் மற்றும் பாரம்பரிய நுட்பங்களை நவீன கண்டுபிடிப்புகளுடன் இணைத்து, பார்க்க அழகாகவும் அணிய வசதியாகவும் இருக்கும் ஆடைகளை உருவாக்குகிறோம்.",
        premiumQuality: "பிரீமியம் தரம்",
        pureCotton: "100% தூய பருத்தி",
        madeWithLove: "அன்போடு உருவாக்கப்பட்டது",
        handcraftedCare: "கைவினைப் பாதுகாப்பு",
        skinSafe: "சருமத்திற்குப் பாதுகாப்பானது",
        hypoallergenic: "ஒவ்வாமை ஏற்படுத்தாதது",
        ecoFriendly: "சுற்றுச்சூழல் நட்பு",
        sustainableProcesses: "நிலையான செயல்முறைகள்",
        yearsExperience: "20 +",
        yearsExperienceTitle: "ஆண்டுகள் அனுபவம்",
        trustedBrand: "நம்பகமான பிராண்ட்",
        whyChooseTitle: "ஏன் இந்துமதி கார்மெண்ட்ஸை தேர்வு செய்ய வேண்டும்?",
        pureCottonPromise: "தூய பருத்தி வாக்குறுதி",
        pureCottonPromiseDesc: "நாங்கள் 100% தூய பருத்தியை மட்டுமே பயன்படுத்துகிறோம், இது உணர்திறன் வாய்ந்த சருமத்திற்கு சுவாசம், மென்மை மற்றும் வசதியை உறுதி செய்கிறது. செயற்கை கலவைகள் இல்லை, சமரசங்கள் இல்லை.",
        expertCraftsmanship: "நிபுணத்துவ கைவினைத்திறன்",
        expertCraftsmanshipDesc: "தினசரி உடைகளில் பொருத்தம், வசதி மற்றும் ஆயுள் ஆகியவற்றின் முக்கியத்துவத்தைப் புரிந்துகொண்ட திறமையான கைவினைஞர்களால் ஒவ்வொரு ஆடையும் கவனமாக வடிவமைக்கப்பட்டுள்ளது.",
        affordableLuxury: "மலிவு விலை ஆடம்பரம்",
        affordableLuxuryDesc: "அனைவரும் தரமான ஆடைக்கு தகுதியானவர்கள் என்று நாங்கள் நம்புகிறோம். எங்களது நேரடி நுகர்வோர் மாதிரி அணுகக்கூடிய விலையில் பிரீமியம் தயாரிப்புகளை உறுதி செய்கிறது."
      }
    }
  },
  hi: {
    translation: {
      nav: {
        about: "हमारे बारे में",
        products: "उत्पाद",
        contact: "संपर्क करें",
        faq: "अक्सर पूछे जाने वाले प्रश्न",
        searchPlaceholder: "उत्पादों की खोज करें...",
        login: "लॉगिन",
        loginSignUp: "लॉगिन / साइन अप",
        myOrders: "मेरे आदेश",
        myWishlist: "मेरी इच्छा सूची",
        profileDashboard: "प्रोफाइल / डैशबोर्ड",
        logout: "लॉगआउट"
      },
      footer: {
        quickLinks: "त्वरित लिंक्स",
        customerService: "ग्राहक सेवा",
        newsletter: "समाचार पत्र",
        newsletterDesc: "नए उत्पादों और विशेष प्रस्तावों पर अपडेट प्राप्त करने के लिए सदस्यता लें।",
        emailPlaceholder: "आपका ईमेल",
        subscribedSuccess: "सफलतापूर्वक सदस्यता ली गई!",
        terms: "नियम और शर्तें",
        privacy: "गोपनीयता नीति",
        returnsExchanges: "रिटर्न और एक्सचेंज",
        aboutUs: "हमारे बारे में",
        orderHistory: "ऑर्डर इतिहास",
        copyright: "© {{year}} {{siteName}}। सर्वाधिकार सुरक्षित।",
        brandDesc: "दो दशकों से अधिक समय से आराम और भव्यता के साथ उच्च गुणवत्ता वाले शुद्ध सूती महिलाओं के इनरवियर का निर्माण।"
      },
      about: {
        title: "इंदुमति गारमेंट्स",
        subtitle: "प्रीमियम सूती पोशाक और कपड़े",
        tagline: "पुरुषों और महिलाओं के लिए उच्च गुणवत्ता वाले शुद्ध सूती कपड़ों का निर्माण",
        heroDesc: "दो दशकों से अधिक समय से, हम बेहतरीन सूती वस्त्र बनाने के लिए समर्पित हैं जो आराम, गुणवत्ता और भव्यता को जोड़ते हैं। हर टुकड़ा प्यार और विस्तार पर ध्यान देकर तैयार किया गया है।",
        shopNow: "अभी खरीदें",
        ourStory: "हमारी कहानी",
        storyP1: "2001 में स्थापित, इंदुमति ने एक सरल मिशन के साथ एक छोटे पारिवारिक व्यवसाय के रूप में शुरुआत की: सभी को सबसे आरामदायक, उच्च गुणवत्ता वाले सूती कपड़े प्रदान करना। एक छोटी कार्यशाला में जो शुरू हुआ था वह प्राकृतिक कपड़ों और बेहतर शिल्प कौशल के प्रति हमारी प्रतिबद्धता के लिए जाने जाने वाले एक विश्वसनीय ब्रांड में बदल गया है।",
        storyP2: "हमारा मानना है कि आराम से कभी समझौता नहीं किया जाना चाहिए। इसलिए हम केवल बेहतरीन सूती फाइबर का स्रोत लेते हैं और पारंपरिक तकनीकों के साथ-साथ आधुनिक नवाचार का उपयोग करके ऐसे कपड़े बनाते हैं जो दिखने में जितने अच्छे हों, महसूस करने में भी उतने ही अच्छे हों।",
        premiumQuality: "प्रीमियम गुणवत्ता",
        pureCotton: "100% शुद्ध कपास",
        madeWithLove: "प्यार से बना",
        handcraftedCare: "हस्तशिल्प देखभाल",
        skinSafe: "त्वचा के लिए सुरक्षित",
        hypoallergenic: "हाइपोएलर्जिक",
        ecoFriendly: "अनुकूल परिस्थितिकी",
        sustainableProcesses: "संधारणीय प्रक्रियाएं",
        yearsExperience: "20 +",
        yearsExperienceTitle: "वर्षों का अनुभव",
        trustedBrand: "विश्वसनीय ब्रांड",
        whyChooseTitle: "इंदुमति गारमेंट्स क्यों चुनें?",
        pureCottonPromise: "शुद्ध कपास का वादा",
        pureCottonPromiseDesc: "हम केवल 100% शुद्ध कपास का उपयोग करते हैं, जो संवेदनशील त्वचा के लिए हवा पार होने की क्षमता, कोमलता और आराम सुनिश्चित करता है। कोई सिंथेटिक मिश्रण नहीं, कोई समझौता नहीं।",
        expertCraftsmanship: "विशेषज्ञ शिल्प कौशल",
        expertCraftsmanshipDesc: "प्रत्येक टुकड़ा कुशल कारीगरों द्वारा सावधानीपूर्वक तैयार किया जाता है जो दैनिक पहनने में फिट, आराम और स्थायित्व के महत्व को समझते हैं।",
        affordableLuxury: "किफायती विलासिता",
        affordableLuxuryDesc: "हमारा मानना है कि हर कोई गुणवत्तापूर्ण कपड़ों का हकदार है। हमारा डायरेक्ट-टू-कंज्यूमर मॉडल सुलभ कीमतों पर प्रीमियम उत्पाद सुनिश्चित करता।"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
