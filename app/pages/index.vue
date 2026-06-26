<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale, t } = useI18n()

// State for AI chatbot terminal
const customQuery = ref('')
const terminalInput = ref('')
const terminalResponse = ref('')
const isTyping = ref(false)
const activeQuestionIndex = ref(-1)
const terminalContentRef = ref(null)
const terminalInputFieldRef = ref(null)



// Localized suggestions array
const suggestions = computed(() => {
  if (locale.value === 'ar') {
    return [
      {
        label: 'من هو كرم؟',
        text: 'من هو كرم صوان؟',
        response: t('hero.aiResponse')
      },
      {
        label: 'ما هي مهاراته؟',
        text: 'ما هي مهارات كرم البرمجية؟',
        response: 'يتخصص كرم في تطوير التطبيقات الحديثة باستخدام:<br><br>• [span class="text-primary font-weight-bold"]الواجهات الأمامية[/span]: Vue.js, Nuxt.js, Vuetify, HTML5, CSS3, JavaScript (ES6+)<br>• [span class="text-secondary font-weight-bold"]الخلفيات وقواعد البيانات[/span]: Node.js, Express, PostgreSQL, MongoDB, REST APIs<br>• [span class="text-accent font-weight-bold"]أدوات التطوير[/span]: Git, Docker, DevOps, CI/CD'
      },
      {
        label: 'تواصل معه؟',
        text: 'كيف يمكنني التواصل مع كرم صوان؟',
        response: 'يسعد كرم دائماً بالتواصل للتعاون والمشاريع الجديدة!<br><br>يمكنك التواصل معه مباشرة عبر نموذج الاتصال أسفل الصفحة، أو عن طريق البريد الإلكتروني: [span class="text-primary"]contact@karam-sawan.online[/span]. وسيقوم بالرد عليك في أقرب وقت!'
      }
    ]
  } else if (locale.value === 'tr') {
    return [
      {
        label: 'Karam Kimdir?',
        text: 'Karam Sawan kimdir?',
        response: t('hero.aiResponse')
      },
      {
        label: 'Yetenekleri?',
        text: 'Karam hangi teknolojileri kullanıyor?',
        response: 'Karam, modern teknolojilerle ölçeklenebilir çözümler üretir:<br><br>• [span class="text-primary font-weight-bold"]Önyüz (Frontend)[/span]: Vue.js, Nuxt.js, Vuetify, HTML5, CSS3, JS/TS<br>• [span class="text-secondary font-weight-bold"]Arkayüz & Veritabanı[/span]: Node.js, Express, PostgreSQL, MongoDB, RESTful APIs<br>• [span class="text-accent font-weight-bold"]Araçlar & DevOps[/span]: Git, Docker, CI/CD süreçleri ve bulut teknolojileri.'
      },
      {
        label: 'İletişim?',
        text: 'Karam ile nasıl iletişime geçebilirim?',
        response: 'Karam, yeni projeler ve işbirlikleri için sizinle görüşmekten memnuniyet duyar!<br><br>Sayfa sonundaki iletişim formunu kullanabilir veya doğrudan e-posta gönderebilirsiniz: [span class="text-primary"]contact@karam-sawan.online[/span].'
      }
    ]
  } else {
    // English (default)
    return [
      {
        label: 'Who is Karam?',
        text: 'Who is Karam Sawan?',
        response: t('hero.aiResponse')
      },
      {
        label: 'His Skills?',
        text: 'What are Karam\'s technical skills?',
        response: 'Karam excels in building end-to-end applications using:<br><br>• [span class="text-primary font-weight-bold"]Frontend[/span]: Vue.js, Nuxt.js, Vuetify, TailwindCSS, TypeScript<br>• [span class="text-secondary font-weight-bold"]Backend & DB[/span]: Node.js, Express, PostgreSQL, MongoDB, RESTful APIs<br>• [span class="text-accent font-weight-bold"]Tools & DevOps[/span]: Git, Docker, Linux, CI/CD, AWS'
      },
      {
        label: 'Contact Info?',
        text: 'How can I contact Karam?',
        response: 'Karam is always open to collaborations and new opportunities!<br><br>You can reach him via the contact form at the bottom of the page or directly by email: [span class="text-primary"]contact@karam-sawan.online[/span]. He will get back to you shortly!'
      }
    ]
  }
})

// Tokenizer to split HTML tags and regular characters for safe rich-text typing
const tokenizeHtml = (htmlString) => {
  const tokens = []
  let i = 0
  while (i < htmlString.length) {
    if (htmlString[i] === '<') {
      const endIdx = htmlString.indexOf('>', i)
      if (endIdx !== -1) {
        tokens.push({ type: 'html', val: htmlString.substring(i, endIdx + 1) })
        i = endIdx + 1
      } else {
        tokens.push({ type: 'text', val: htmlString[i] })
        i++
      }
    } else {
      const nextTagIdx = htmlString.indexOf('<', i)
      const textVal = nextTagIdx !== -1 ? htmlString.substring(i, nextTagIdx) : htmlString.substring(i)
      
      for (let j = 0; j < textVal.length; j++) {
        tokens.push({ type: 'text', val: textVal[j] })
      }
      i = nextTagIdx !== -1 ? nextTagIdx : htmlString.length
    }
  }
  return tokens
}

let activeTimeout = null
const stopTyping = () => {
  if (activeTimeout) {
    clearTimeout(activeTimeout)
    activeTimeout = null
  }
  isTyping.value = false
}

const startTyping = (rawHtml) => {
  stopTyping()
  isTyping.value = true
  terminalResponse.value = ''
  
  const formattedHtml = rawHtml
    .replace(/\[br\]/g, '<br>')
    .replace(/\[span/g, '<span')
    .replace(/\[\/span\]/g, '</span>')
    .replace(/\]/g, '>')
  
  const tokens = tokenizeHtml(formattedHtml)
  let tokenIdx = 0
  
  const typeNext = () => {
    if (tokenIdx >= tokens.length) {
      isTyping.value = false
      scrollToBottom()
      setTimeout(() => {
        if (terminalInputFieldRef.value) {
          terminalInputFieldRef.value.focus()
        }
      }, 50)
      return
    }
    
    const token = tokens[tokenIdx]
    if (token.type === 'html') {
      terminalResponse.value += token.val
      tokenIdx++
      typeNext()
    } else {
      terminalResponse.value += token.val
      tokenIdx++
      scrollToBottom()
      activeTimeout = setTimeout(typeNext, 12)
    }
  }
  
  typeNext()
}

const scrollToBottom = () => {
  setTimeout(() => {
    if (terminalContentRef.value) {
      terminalContentRef.value.scrollTop = terminalContentRef.value.scrollHeight
    }
  }, 10)
}

const selectSuggestion = (index) => {
  if (isTyping.value) return
  activeQuestionIndex.value = index
  const sug = suggestions.value[index]
  terminalInput.value = sug.text
  startTyping(sug.response)
}

const getChatbotResponse = (query, currentLocale) => {
  const lowercaseQuery = query.toLowerCase()
  
  // 1. Check for valid letters/numbers
  const hasLetters = /[\p{L}\p{N}]/u.test(query)
  const isTooShort = query.replace(/\s+/g, '').length < 2
  const hasSpam = /(.)\1{4,}/.test(query) || (lowercaseQuery.length > 6 && /^([a-z0-9])\1+$/i.test(lowercaseQuery))

  if (!hasLetters || isTooShort || hasSpam) {
    return {
      ar: 'عذراً، يرجى كتابة سؤال واضح أو جملة مفهومة لأتمكن من إجابتك بدقة! يمكنك استخدام الأسئلة السريعة المقترحة بالأعلى.',
      tr: 'Lütfen size doğru cevap verebilmem için net ve anlaşılır bir soru yazın! Yukarıdaki hızlı soruları da kullanabilirsiniz.',
      en: 'Sorry, please type a clear and meaningful question so I can assist you! You can also click on the quick suggestions above.'
    }[currentLocale]
  }

  // 2. Check for Greetings
  const arGreetings = ['مرحبا', 'مرحباً', 'اهلا', 'أهلاً', 'سلام', 'السلام', 'صباح', 'مساء', 'كيف حالك']
  const trGreetings = ['merhaba', 'selam', 'nasılsın', 'gunaydin', 'günaydın', 'iyi günler', 'mrb']
  const enGreetings = ['hello', 'hi', 'hey', 'greetings', 'how are you', 'good morning', 'good afternoon']

  const isGreeting = (
    (currentLocale === 'ar' && arGreetings.some(g => lowercaseQuery.includes(g))) ||
    (currentLocale === 'tr' && trGreetings.some(g => lowercaseQuery.includes(g))) ||
    (currentLocale === 'en' && enGreetings.some(g => lowercaseQuery.includes(g)))
  )

  if (isGreeting) {
    return {
      ar: 'أهلاً وسهلاً بك! أنا المساعد الذكي لكرم صوان. ⚡<br><br>كيف يمكنني مساعدتك اليوم؟ يمكنك سؤالي عن مهاراته، خدماته، مشاريعه، أو كيف تتواصل معه.',
      tr: 'Merhaba! Ben Karam Sawan\'ın yapay zeka asistanıyım. ⚡<br><br>Bugün size nasıl yardımcı olabilirim? Karam\'ın yetenekleri, sunduğu hizmetler, projeleri veya onunla nasıl iletişim kuracağınız hakkında sorular sorabilirsiniz.',
      en: 'Hello and welcome! I am Karam Sawan\'s AI Assistant. ⚡<br><br>How can I help you today? Feel free to ask me about his coding skills, services, projects, or how to reach him.'
    }[currentLocale]
  }

  // 3. Define detailed categories
  const categories = [
    {
      name: 'funny_toxic',
      keywords: {
        ar: ['غبي', 'غباء', 'حمار', 'سخيف', 'أبله', 'فاشل', 'سيء', 'تافه'],
        tr: ['aptal', 'salak', 'gerizekali', 'gerizekalı', 'kötü', 'beceriksiz'],
        en: ['stupid', 'idiot', 'dumb', 'fool', 'silly', 'useless', 'bad', 'suck']
      },
      response: {
        ar: 'أنا مجرد مساعد برمجيات بسيط مبني على القواعد لمساعدتك في تصفح موقع كرم صوان. 🤖 قد لا أمتلك ذكاءً بشرياً كاملاً بعد، لكني ممتاز جداً في إرشادك لأعمال كرم البرمجية ومهاراته! جرب سؤالي عن مهاراته أو مشاريعه.',
        tr: 'Ben sadece Karam Sawan\'ın portföyünü keşfetmenize yardımcı olan basit bir yazılım asistanıyım. 🤖 Henüz bir insan zekasına sahip olmasam da Karam\'ın yeteneklerini ve projelerini size sunmakta oldukça iyiyim! Projelerini sormayı deneyebilirsiniz.',
        en: 'I am a simple programmatic assistant built to help you navigate Karam Sawan\'s portfolio. 🤖 I might not have full human intelligence, but I am great at showcasing Karam\'s programming skills and projects! Try asking about his skills or projects.'
      }
    },
    {
      name: 'about',
      keywords: {
        ar: ['من هو', 'كرم', 'صوان', 'تعريف', 'سيرة', 'ذاتية', 'سي في', 'cv', 'resume', 'info'],
        tr: ['kim', 'karam', 'sawan', 'hakkında', 'ozgecmis', 'özgeçmiş', 'öz geçmiş', 'info', 'cv', 'resume'],
        en: ['who is', 'karam', 'sawan', 'about', 'resume', 'cv', 'background', 'bio', 'profile']
      },
      response: {
        ar: 'كرم صوان هو مهندس ويب متكامل (Full-Stack Web Developer) خبير ومتخصص في تطوير تطبيقات الويب الحديثة والسريعة.<br><br>• يقيم في تركيا ويعمل كمهندس ويب مستقل.<br><br>• لديه شغف كبير بدمج تقنيات الذكاء الاصطناعي لتسريع وتبسيط سير العمل وجودة الكود.<br><br>• يتميز بقدرته على تغطية دورة حياة التطبيق بالكامل من التصميم وحتى النشر (DevOps).',
        tr: 'Karam Sawan, modern ve yüksek performanslı web uygulamaları geliştirme konusunda uzmanlaşmış profesyonel bir Full-Stack Web Geliştiricisidir.<br><br>• Türkiye\'de ikamet etmekte ve serbest zamanlı (freelance) çalışmaktadır.<br><br>• Geliştirme süreçlerini hızlandırmak ve kod kalitesini artırmak için yapay zeka araçlarını iş akışına entegre etme konusunda uzmandır.<br><br>• Bir uygulamanın tasarımdan canlıya alınmasına (DevOps) kadar tüm süreçlerini yönetebilir.',
        en: 'Karam Sawan is a professional Full-Stack Web Developer specialized in building modern, scalable, and high-performance web applications.<br><br>• Based in Turkey, working as an independent software engineer.<br><br>• Passionate about integrating AI tools to accelerate development speed and ensure high code quality.<br><br>• Capable of handling the full application development life cycle, from design and coding to cloud deployment (DevOps).'
      }
    },
    {
      name: 'skills',
      keywords: {
        ar: ['مهارات', 'تقنيات', 'لغات', 'خبرة', 'خبرات', 'تكنولوجيا', 'تكنولوجيات', 'يتقن'],
        tr: ['yetenek', 'teknoloji', 'dil', 'tecrübe', 'deneyim', 'uzmanlık', 'kodlama'],
        en: ['skill', 'tech', 'stack', 'language', 'experience', 'expert', 'capabilities']
      },
      response: {
        ar: 'يتخصص كرم في تقنيات ويب متقدمة لتقديم حلول كاملة ومتينة:<br><br>• [span class="text-primary font-weight-bold"]الواجهات الأمامية[/span]: Vue 3, Nuxt 3, Vuetify, HTML5, CSS3, JavaScript (ES6+), TypeScript.<br>• [span class="text-secondary font-weight-bold"]الخلفيات وقواعد البيانات[/span]: Node.js, Express, PostgreSQL, MongoDB, RESTful APIs.<br>• [span class="text-accent font-weight-bold"]أدوات التطوير و DevOps[/span]: Git, Docker, Linux, CI/CD, Cloud Hosting.',
        tr: 'Karam, modern ve ölçeklenebilir çözümler üretmek için gelişmiş web teknolojilerinde uzmanlaşmıştır:<br><br>• [span class="text-primary font-weight-bold"]Önyüz (Frontend)[/span]: Vue 3, Nuxt 3, Vuetify, HTML5, CSS3, JS/TS.<br>• [span class="text-secondary font-weight-bold"]Arkayüz & Veritabanı[/span]: Node.js, Express, PostgreSQL, MongoDB, RESTful APIs.<br>• [span class="text-accent font-weight-bold"]Araçlar & DevOps[/span]: Git, Docker, Linux, CI/CD süreçleri ve bulut sunucuları.',
        en: 'Karam excels in building end-to-end applications using modern, industry-standard tech stacks:<br><br>• [span class="text-primary font-weight-bold"]Frontend[/span]: Vue 3, Nuxt 3, Vuetify, HTML5, CSS3, JS/TS.<br>• [span class="text-secondary font-weight-bold"]Backend & DB[/span]: Node.js, Express, PostgreSQL, MongoDB, RESTful APIs.<br>• [span class="text-accent font-weight-bold"]Tools & DevOps[/span]: Git, Docker, Linux, CI/CD, Cloud Deployment.'
      }
    },
    {
      name: 'services',
      keywords: {
        ar: ['خدمات', 'ماذا تقدم', 'خدمة', 'بناء', 'تصميم', 'تطوير', 'عمل', 'تسويق', 'برمجة'],
        tr: ['hizmet', 'neler yapıyorsun', 'tasarım', 'gelistirme', 'geliştirme', 'yazilim', 'yazılım'],
        en: ['services', 'what do you do', 'offer', 'build', 'design', 'develop', 'services offered']
      },
      response: {
        ar: 'الخدمات التي يقدمها كرم لعملائه تشمل:<br><br>• [span class="text-primary font-weight-bold"]تطوير مواقع كاملة (SSR/SPA)[/span] سريعة ومتوافقة مع محركات البحث SEO.<br>• [span class="text-secondary font-weight-bold"]تطوير واجهات خلفية سحابية وآمنة[/span] وقواعد بيانات قوية.<br>• [span class="text-accent font-weight-bold"]ربط ودمج واجهات الذكاء الاصطناعي (AI Integration)[/span] في المواقع والتطبيقات.<br>• [span class="text-primary font-weight-bold"]تحسين الأداء وسرعة تحميل الصفحات[/span].',
        tr: 'Karam\'ın müşterilerine sunduğu profesyonel hizmetler şunlardır:<br><br>• SEO uyumlu ve hızlı [span class="text-primary font-weight-bold"]Full-Stack Web Uygulamaları (SSR/SPA)[/span] geliştirme.<br>• Güvenli [span class="text-secondary font-weight-bold"]Arkayüz API Mimarileri[/span] ve veritabanı tasarımı.<br>• Web uygulamalarına [span class="text-accent font-weight-bold"]Yapay Zeka (AI) API Entegrasyonu[/span].<br>• [span class="text-primary font-weight-bold"]Web sitesi hız ve performans optimizasyonu[/span].',
        en: 'Karam offers a range of high-quality services for businesses and individuals:<br><br>• [span class="text-primary font-weight-bold"]Full-Stack Web Development (SSR/SPA)[/span] that are fast, responsive, and SEO-optimized.<br>• [span class="text-secondary font-weight-bold"]Secure Backend Architectures[/span] and robust database schemas.<br>• [span class="text-accent font-weight-bold"]AI API Integrations[/span] (Large Language Models, agents, custom tools).<br>• [span class="text-primary font-weight-bold"]Performance tuning & page load optimization[/span].'
      }
    },
    {
      name: 'projects',
      keywords: {
        ar: ['مشاريع', 'أعمال', 'تطبيقات', 'مواقع', 'معرض', 'معرضي', 'سابق', 'سابقة'],
        tr: ['proje', 'calisma', 'çalışma', 'portfolyo', 'neler yaptın', 'yaptığın', 'web siteleri'],
        en: ['projects', 'portfolio', 'work', 'apps', 'websites', 'done', 'experience portfolio']
      },
      response: {
        ar: 'قام كرم ببناء وتطوير العديد من المشاريع المميزة، ومن أبرزها:<br><br>• [span class="text-primary font-weight-bold"]منصات SaaS متكاملة[/span] مع لوحات تحكم ديناميكية وإحصائيات فورية.<br>• [span class="text-secondary font-weight-bold"]مواقع تجارة إلكترونية وبوابات دفع[/span] سريعة ومحمية.<br>• يمكنك التمرير لأسفل الصفحة لرؤية التفاصيل التفاعلية لكل مشروع بروابط العرض الحي ومستودعات الكود!',
        tr: 'Karam, çeşitli iş kolları için gelişmiş projeler üretmiştir. Bazı örnekler:<br><br>• Dinamik panellere ve gerçek zamanlı istatistiklere sahip [span class="text-primary font-weight-bold"]SaaS Platformları[/span].<br>• Hızlı ve güvenli [span class="text-secondary font-weight-bold"]E-Ticaret ve Ödeme Entegrasyonları[/span].<br>• Projelerin canlı demolarını ve kod depolarını incelemek için sayfayı aşağı kaydırabilirsiniz!',
        en: 'Karam has designed and built several professional applications, including:<br><br>• [span class="text-primary font-weight-bold"]Full-featured SaaS Platforms[/span] with dynamic dashboards and analytics.<br>• Fast and secure [span class="text-secondary font-weight-bold"]E-commerce websites[/span] with payment gateways.<br>• You can scroll down the page to view each project in detail, along with live preview links and GitHub source codes!'
      }
    },
    {
      name: 'contact',
      keywords: {
        ar: ['تواصل', 'اتصل', 'ايميل', 'بريد', 'رسالة', 'رقم', 'هاتف', 'لينكد', 'linkedin', 'github'],
        tr: ['iletisim', 'iletişim', 'eposta', 'mail', 'telefon', 'ulaş', 'linkedin', 'github'],
        en: ['contact', 'email', 'reach', 'call', 'message', 'phone', 'linkedin', 'github', 'social']
      },
      response: {
        ar: 'يمكنك التواصل مع كرم مباشرة لمناقشة مشروع جديد أو فرص عمل:<br><br>• 📧 البريد الإلكتروني: [span class="text-primary"]contact@karam-sawan.online[/span].<br>• 📝 كما يمكنك ملء نموذج المراسلة الموجود في أسفل هذه الصفحة مباشرة وسيرد عليك في أقرب وقت.<br>• 🔗 تواصل معه مهنياً عبر LinkedIn و GitHub المتواجدة روابطهما في الفوتر.',
        tr: 'Yeni projeler veya iş fırsatları için Karam ile doğrudan iletişime geçebilirsiniz:<br><br>• 📧 E-posta adresi: [span class="text-primary"]contact@karam-sawan.online[/span].<br>• 📝 Sayfanın alt kısmındaki iletişim formunu doldurarak mesajınızı iletebilirsiniz.<br>• 🔗 Sayfa altındaki bağlantılardan LinkedIn ve GitHub profillerini inceleyebilirsiniz.',
        en: 'You can reach out to Karam directly to discuss new projects, hires, or collaborations:<br><br>• 📧 Email address: [span class="text-primary"]contact@karam-sawan.online[/span].<br>• 📝 You can fill out the contact form at the bottom of this page to send a direct message.<br>• 🔗 Connect with him on LinkedIn and GitHub via the links in the footer.'
      }
    },
    {
      name: 'frontend',
      keywords: {
        ar: ['واجهات', 'أمامية', 'فرونت', 'تصميم', 'frontend', 'front-end', 'vue', 'nuxt', 'vuetify', 'css', 'html', 'javascript', 'typescript'],
        tr: ['onyuz', 'önyüz', 'frontend', 'front-end', 'vue', 'nuxt', 'vuetify', 'tasarım', 'arayüz'],
        en: ['frontend', 'front-end', 'ui', 'ux', 'vue', 'nuxt', 'vuetify', 'css', 'html', 'javascript', 'typescript']
      },
      response: {
        ar: 'في الواجهات الأمامية، يركز كرم على تقديم تجربة مستخدم (UX) ساحرة وخفيفة:<br><br>• يستخدم [span class="text-primary font-weight-bold"]Vue 3 و Nuxt 3[/span] لبناء تطبيقات سريعة التحميل (SSR) ومتوافقة مع الـ SEO.<br>• يعتمد على [span class="text-secondary font-weight-bold"]Vuetify و TailwindCSS[/span] للتصاميم المتجاوبة والأنيقة.<br>• يدمج التأثيرات الحركية والتفاعلية (Micro-animations) لجعل الواجهة تبدو حية.',
        tr: 'Önyüz (Frontend) tarafında, Karam kullanıcı deneyimini (UX) ve hızı ön planda tutar:<br><br>• Hızlı açılan ve SEO dostu uygulamalar için [span class="text-primary font-weight-bold"]Vue 3 ve Nuxt 3[/span] kullanır.<br>• Modern ve duyarlı (responsive) tasarımlar için [span class="text-secondary font-weight-bold"]Vuetify ve TailwindCSS[/span] tercih eder.<br>• Arayüzleri canlandırmak için pürüzsüz animasyonlar (Micro-animations) ekler.',
        en: 'For frontend development, Karam focuses on delivering pixel-perfect, interactive, and high-performance user interfaces:<br><br>• Uses [span class="text-primary font-weight-bold"]Vue 3 and Nuxt 3[/span] for Server-Side Rendered (SSR) fast websites.<br>• Leverages [span class="text-secondary font-weight-bold"]Vuetify and TailwindCSS[/span] for clean, responsive, and modern component systems.<br>• Integrates smooth transitions and animations to make the UI feel alive and responsive.'
      }
    },
    {
      name: 'backend',
      keywords: {
        ar: ['خلفية', 'خلفيات', 'باك', 'قاعدة', 'بيانات', 'سيرفر', 'backend', 'back-end', 'node', 'express', 'database', 'db', 'postgres', 'mongodb', 'sql', 'nosql', 'api'],
        tr: ['arkayuz', 'arkayüz', 'backend', 'back-end', 'node', 'express', 'database', 'veritabani', 'veritabanı', 'postgres', 'mongodb', 'sql', 'nosql', 'api'],
        en: ['backend', 'back-end', 'server', 'node', 'express', 'database', 'db', 'postgres', 'mongodb', 'sql', 'nosql', 'api']
      },
      response: {
        ar: 'في الواجهات الخلفية وقواعد البيانات، يركز كرم على الأمان وسرعة معالجة البيانات:<br><br>• يعتمد على [span class="text-primary font-weight-bold"]Node.js و Express[/span] لبناء سيرفرات API سريعة وآمنة.<br>• يستخدم [span class="text-secondary font-weight-bold"]PostgreSQL (SQL) و MongoDB (NoSQL)[/span] لتخزين وإدارة البيانات بكفاءة.<br>• يقوم بهيكلة قواعد البيانات لتتحمل الضغط والطلبات المتعددة بكفاءة.',
        tr: 'Arkayüz (Backend) ve veritabanı tarafında, Karam güvenlik ve hızlı veri işlemeye odaklanır:<br><br>• Hızlı ve güvenli API servisleri için [span class="text-primary font-weight-bold"]Node.js ve Express[/span] kullanır.<br>• Esnek ve güçlü veri yönetimi için [span class="text-secondary font-weight-bold"]PostgreSQL ve MongoDB[/span] tercih eder.<br>• Veritabanı sorgularını optimize ederek yüksek yüklere dayanıklı yapılar kurar.',
        en: 'For backend and databases, Karam prioritizes security, speed, and clean code architecture:<br><br>• Utilizes [span class="text-primary font-weight-bold"]Node.js and Express[/span] to build scalable, high-performance RESTful APIs.<br>• Designs database schemas using [span class="text-secondary font-weight-bold"]PostgreSQL[/span] (relational) and [span class="text-accent font-weight-bold"]MongoDB[/span] (NoSQL).<br>• Focuses on query optimization, secure authentication, and data integrity.'
      }
    },
    {
      name: 'ai_workflow',
      keywords: {
        ar: ['ذكاء', 'اصطناعي', 'أدوات', 'الذكاء', 'ai', 'workflow', 'artificial', 'intelligence', 'yapay', 'zeka', 'copilot', 'chatgpt'],
        tr: ['yapay', 'zeka', 'ai', 'is akisi', 'iş akışı', 'copilot', 'chatgpt', 'arac', 'araç'],
        en: ['ai', 'artificial', 'intelligence', 'workflow', 'copilot', 'chatgpt', 'agent', 'assistants']
      },
      response: {
        ar: 'كرم صوان مطور ويب متطور يدمج الذكاء الاصطناعي في صميم عمله:<br><br>• يستخدم [span class="text-primary font-weight-bold"]مساعدات الذكاء الاصطناعي البرمجية[/span] لتسريع وتيرة كتابة الأكواد ومراجعتها.<br>• يقوم بأتمتة المهام المتكررة وكتابة الاختبارات لضمان خلو الأكواد من الأخطاء البرمجية.<br>• يساعده هذا الأسلوب في إنجاز المشاريع بجودة شركات برمجية كبرى وفي نصف الوقت المعتاد!',
        tr: 'Karam, yapay zekayı işinin merkezine entegre eden modern bir geliştiricidir:<br><br>• Kod yazma ve inceleme süreçlerini hızlandırmak için [span class="text-primary font-weight-bold"]yapay zeka kodlama asistanlarını[/span] aktif olarak kullanır.<br>• Hataları önlemek ve kod kalitesini artırmak için test yazımını yapay zeka ile otomatikleştirir.<br>• Bu yaklaşım, projeleri standart sürenin yarı zamanında ve kurumsal kalitede tamamlamasını sağlar.',
        en: 'Karam Sawan is a modern developer who fully integrates AI into his daily workflow:<br><br>• Uses [span class="text-primary font-weight-bold"]AI coding assistants[/span] to accelerate code generation, review, and refactoring.<br>• Automates routine tasks and tests creation to maintain clean, bug-free, and robust codebases.<br>• This modern workflow allows him to deliver enterprise-grade software at twice the traditional speed!'
      }
    }
  ]

  // 4. Match the query with categories
  for (const cat of categories) {
    const matched = cat.keywords[currentLocale].some(kw => lowercaseQuery.includes(kw))
    if (matched) {
      return cat.response[currentLocale]
    }
  }

  // 5. Fallback response (general info & out of context redirect)
  return {
    ar: 'أنا المساعد الذكي الخاص بكرم صوان. لست متأكداً من إجابة هذا السؤال المحدد لأنه خارج سياق أعمال كرم. 🤖<br><br>لكن يسعدني إجابتك على أي سؤال يخص مهاراته البرمجية، مشاريعه، خدماته، أو كيف تتواصل معه!',
    tr: 'Ben Karam Sawan\'ın yapay zeka asistanıyım. Karam\'ın çalışmaları dışında bir konu olduğu için bu soruya tam bir cevabım yok. 🤖<br><br>Ancak Karam\'ın yetenekleri, projeleri, hizmetleri veya onunla nasıl iletişim kuracağınızla ilgili soruları yanıtlamaktan memnuniyet duyarım!',
    en: 'I am Karam Sawan\'s AI Assistant. I\'m not sure about the answer to this specific question as it is outside Karam\'s portfolio context. 🤖<br><br>However, I\'d be happy to answer any questions about his programming skills, projects, services, or how to contact him!'
  }[currentLocale]
}

const submitCustomQuery = () => {
  if (isTyping.value || !customQuery.value.trim()) return
  activeQuestionIndex.value = -1
  const query = customQuery.value.trim()
  terminalInput.value = query
  customQuery.value = ''
  
  const response = getChatbotResponse(query, locale.value)
  startTyping(response)
}

// Auto-run first question on load
onMounted(() => {
  setTimeout(() => {
    selectSuggestion(0)
  }, 1200)
})

onBeforeUnmount(() => {
  stopTyping()
})
</script>

<template>
  <div class="app-layout">
    <!-- Hero (About) Section -->
    <div id="about" class="hero-section">
      <v-container class="position-relative fill-height d-flex align-center hero-container">
        <v-row class="align-center py-10 py-md-16">
          <!-- Left Column: Intro Text & CTA -->
          <v-col cols="12" md="6" class="intro-col">
            <!-- Welcome Badge -->
            <div class="welcome-badge d-inline-flex align-center mb-6">
              <v-icon icon="mdi-robot-outline" color="primary" class="mr-2 ml-2 welcome-badge-icon" size="18"></v-icon>
              <span class="text-caption font-weight-black tracking-wider">
                {{ locale === 'ar' ? 'مطور ويب مدعوم بالذكاء الاصطناعي ⚡' : locale === 'tr' ? 'YAPAY ZEKA DESTEKLİ GELİŞTİRİCİ ⚡' : 'AI-POWERED WEB DEVELOPER ⚡' }}
              </span>
            </div>
            
            <!-- Heading -->
            <h1 class="hero-title font-weight-black mb-4">
              <span class="text-white block-text">{{ $t('hero.greeting') }}</span>
              <span class="gradient-text block-text">{{ $t('hero.name') }}</span>
            </h1>
            
            <!-- Subtitle / Role -->
            <div class="role-container mb-6">
              <span class="role-text text-h5 text-sm-h4 font-weight-bold text-primary">
                {{ $t('hero.title') }}
              </span>
            </div>
            
            <!-- Description -->
            <p class="hero-desc text-body-1 mb-8 max-w-xl">
              {{ $t('hero.desc') }}
            </p>
            
            <!-- Actions Buttons -->
            <div class="d-flex flex-wrap gap-4 btn-actions-group">
              <v-btn
                href="#projects"
                color="primary"
                variant="flat"
                size="large"
                class="cta-btn primary-cta px-6 px-sm-8 py-3 text-capitalize font-weight-bold"
                elevation="6"
              >
                {{ $t('hero.projectsBtn') }}
                <v-icon :icon="locale === 'ar' ? 'mdi-arrow-left' : 'mdi-arrow-right'" class="ml-2 mr-2" size="18"></v-icon>
              </v-btn>
              
              <v-btn
                href="#contact"
                variant="outlined"
                size="large"
                class="cta-btn secondary-cta px-6 px-sm-8 py-3 text-capitalize font-weight-bold"
              >
                {{ $t('hero.contactBtn') }}
              </v-btn>
              
              <!-- Download CV (secondary link button) -->
              <v-btn
                variant="text"
                color="grey-lighten-1"
                size="large"
                class="cta-btn text-cta px-4 py-3 text-capitalize font-weight-bold"
                prepend-icon="mdi-download"
              >
                {{ $t('hero.cvBtn') }}
              </v-btn>
            </div>
          </v-col>
          
          <!-- Right Column: Interactive AI Terminal & SVG Robot -->
          <v-col cols="12" md="6" class="position-relative d-flex justify-center align-center cyber-col">
            <div class="cyber-workspace">
              <!-- Concentric Rotating Cyber Rings (Background) -->
              <div class="cyber-portal">
                <div class="cyber-ring ring-outer"></div>
                <div class="cyber-ring ring-middle"></div>
                <div class="cyber-ring ring-inner"></div>
              </div>
              
              <!-- Floating Robot Container -->
              <div class="robot-img-container">
                <img src="/images/robot-ani2.svg" alt="AI Robot Assistant" class="robot-svg" />
              </div>
              
              <!-- Interactive AI Hologram Terminal -->
              <div class="hologram-terminal-card" :class="{ 'typing-active': isTyping }">
                <div class="terminal-header d-flex align-center justify-space-between px-4 py-2">
                  <div class="terminal-dots d-flex align-center">
                    <span class="dot red"></span>
                    <span class="dot yellow"></span>
                    <span class="dot green"></span>
                  </div>
                  <div class="terminal-title text-caption font-weight-bold text-uppercase">
                    AI-Agent-Terminal v1.0.8
                  </div>
                  <div class="d-flex align-center">
                    <v-icon icon="mdi-circle" size="8" :color="isTyping ? 'primary' : 'grey-darken-2'" class="pulse-indicator mr-1 ml-1"></v-icon>
                  </div>
                </div>
                
                <div class="terminal-body p-4 d-flex flex-column justify-space-between">
                  <!-- Response Display -->
                  <div class="terminal-content mb-4" ref="terminalContentRef">
                    <div class="terminal-welcome mb-3 text-caption text-grey">
                      &gt; SYSTEM ONLINE. ASK KARAM'S AI AGENT...
                    </div>
                    
                    <!-- If user has triggered a response -->
                    <div v-if="terminalInput" class="terminal-user-query mb-2">
                      <span class="text-secondary font-weight-bold">&gt; {{ terminalInput }}</span>
                    </div>
                    
                    <div class="terminal-ai-response-wrapper">
                      <div v-if="terminalResponse" class="terminal-ai-response" v-html="terminalResponse"></div>
                      <!-- Blinking Cursor -->
                      <span class="terminal-cursor" v-if="isTyping"></span>
                    </div>
                  </div>
                  
                  <!-- Quick Suggestion Badges -->
                  <div class="terminal-suggestions mb-4">
                    <span class="suggestion-label text-caption text-grey d-block mb-2">
                      {{ locale === 'ar' ? 'أسئلة سريعة للتجربة:' : locale === 'tr' ? 'Hızlı Sorular:' : 'Quick Prompts:' }}
                    </span>
                    <div class="terminal-suggestions-list">
                      <button
                        v-for="(sug, index) in suggestions"
                        :key="index"
                        class="suggestion-badge"
                        :class="{ active: activeQuestionIndex === index }"
                        @click="selectSuggestion(index)"
                        :disabled="isTyping"
                      >
                        {{ sug.label }}
                      </button>
                    </div>
                  </div>
                  
                  <!-- Input Box -->
                  <div class="terminal-input-wrapper">
                    <span class="terminal-prompt-symbol text-primary font-weight-bold">&gt;</span>
                    <input
                      ref="terminalInputFieldRef"
                      type="text"
                      class="terminal-input-field"
                      v-model="customQuery"
                      :placeholder="$t('hero.aiPlaceholder')"
                      @keyup.enter="submitCustomQuery"
                      :disabled="isTyping"
                    />
                    <v-btn
                      icon="mdi-send"
                      variant="text"
                      color="primary"
                      density="comfortable"
                      @click="submitCustomQuery"
                      :disabled="isTyping || !customQuery.trim()"
                    ></v-btn>
                  </div>
                </div>
              </div>
              
            </div>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <!-- Skills Section (For Scrollspy Test) -->
    <section id="skills" class="dummy-section">
      <v-container>
        <h2 class="section-title">
          <span class="gradient-text">{{ locale === 'ar' ? 'المهارات' : locale === 'tr' ? 'Yetenekler' : 'Skills' }}</span>
        </h2>
        <div class="section-content">
          <p>{{ locale === 'ar' ? 'هذا القسم مخصص لعرض المهارات البرمجية والخبرات التقنية.' : locale === 'tr' ? 'Bu bölüm teknik becerileri ve programlama yeteneklerini sergilemek içindir.' : 'This section is designed to showcase programming skills and technical expertise.' }}</p>
        </div>
      </v-container>
    </section>

    <!-- Projects Section (For Scrollspy Test) -->
    <section id="projects" class="dummy-section">
      <v-container>
        <h2 class="section-title">
          <span class="gradient-text">{{ locale === 'ar' ? 'المشاريع' : locale === 'tr' ? 'Projeler' : 'Projects' }}</span>
        </h2>
        <div class="section-content">
          <p>{{ locale === 'ar' ? 'هنا سيتم عرض أبرز المشاريع البرمجية وتطبيقات الويب الحديثة.' : locale === 'tr' ? 'En son web uygulamaları ve yazılım projeleri burada sergilenecektir.' : 'Key software projects and modern web applications will be displayed here.' }}</p>
        </div>
      </v-container>
    </section>

    <!-- Experience Section (For Scrollspy Test) -->
    <section id="experience" class="dummy-section">
      <v-container>
        <h2 class="section-title">
          <span class="gradient-text">{{ locale === 'ar' ? 'الخبرة المهنية' : locale === 'tr' ? 'Deneyim' : 'Experience' }}</span>
        </h2>
        <div class="section-content">
          <p>{{ locale === 'ar' ? 'تاريخ الخبرة العملية والمناصب التي تم شغلها في تطوير البرمجيات.' : locale === 'tr' ? 'Yazılım geliştirme alanındaki iş geçmişi ve deneyimler.' : 'Work history and professional career path in software development.' }}</p>
        </div>
      </v-container>
    </section>

    <!-- Contact Section (For Scrollspy Test) -->
    <section id="contact" class="dummy-section">
      <v-container>
        <h2 class="section-title">
          <span class="gradient-text">{{ locale === 'ar' ? 'اتصل بي' : locale === 'tr' ? 'İletişim' : 'Contact' }}</span>
        </h2>
        <div class="section-content">
          <p>{{ locale === 'ar' ? 'تواصل معي مباشرة لمناقشة المشاريع والتعاون البرمجي.' : locale === 'tr' ? 'İşbirlikleri ve yazılım projeleri için benimle doğrudan iletişime geçin.' : 'Get in touch with me directly to discuss projects and collaboration.' }}</p>
        </div>
      </v-container>
    </section>
  </div>
</template>

<style scoped>
/* Hero Section Container & Background styling */
.hero-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  overflow: hidden;
  background-color: transparent;
  padding: 100px 0 60px 0;
  z-index: 2;
}

/* Base grid pattern background overlay */
.hero-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 50px 50px;
  background-position: center;
  pointer-events: none;
  z-index: 1;
}

.hero-container {
  z-index: 2;
}

/* Welcome Badge Capsule */
.welcome-badge {
  background: rgba(122, 255, 251, 0.06);
  border: 1px solid rgba(122, 255, 251, 0.18);
  border-radius: 50px;
  padding: 8px 18px;
  color: #7afffb;
  box-shadow: 0 0 20px rgba(122, 255, 251, 0.08);
  backdrop-filter: blur(12px);
  transition: all 0.3s ease;
}

.welcome-badge:hover {
  background: rgba(122, 255, 251, 0.1);
  border-color: rgba(122, 255, 251, 0.35);
  box-shadow: 0 0 25px rgba(122, 255, 251, 0.15);
}

.welcome-badge-icon {
  animation: pulseIcon 2s infinite ease-in-out;
}

@keyframes pulseIcon {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
}

/* Typography styles */
.hero-title {
  font-size: clamp(2.5rem, 5vw, 4.5rem);
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.block-text {
  display: block;
}

.gradient-text {
  background: linear-gradient(135deg, #7afffb 0%, #6366F1 50%, #D946EF 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
}

.role-container {
  border-left: 3px solid #7afffb;
  padding-left: 16px;
}
[dir="rtl"] .role-container {
  border-left: none;
  border-right: 3px solid #7afffb;
  padding-left: 0;
  padding-right: 16px;
}

.hero-desc {
  color: #94A3B8;
  font-size: 1.125rem;
  line-height: 1.6;
  max-width: 520px;
}

/* Call-to-actions buttons styling */
.cta-btn {
  border-radius: 12px !important;
  font-weight: 700 !important;
  letter-spacing: 0.5px !important;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
}

.primary-cta {
  background: linear-gradient(135deg, #7afffb 0%, #6366F1 100%) !important;
  color: #0B0F19 !important;
  border: none !important;
  box-shadow: 0 4px 20px rgba(122, 255, 251, 0.25) !important;
}

.primary-cta:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(122, 255, 251, 0.45) !important;
}

.secondary-cta {
  border: 1.5px solid rgba(255, 255, 255, 0.15) !important;
  color: #FFFFFF !important;
  background: rgba(255, 255, 255, 0.02) !important;
  backdrop-filter: blur(8px);
}

.secondary-cta:hover {
  border-color: #7afffb !important;
  color: #7afffb !important;
  background: rgba(122, 255, 251, 0.04) !important;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(122, 255, 251, 0.08) !important;
}

.text-cta:hover {
  color: #7afffb !important;
  background: rgba(255, 255, 255, 0.04) !important;
}

/* Cyber col workspace container */
.cyber-col {
  min-height: 520px;
}

.cyber-workspace {
  position: relative;
  width: 100%;
  max-width: 520px;
  height: 520px;
  margin: 0 auto;
}

/* Concentric Rotating Cyber Portal */
.cyber-portal {
  position: absolute;
  top: -50px;
  left: 0;
  right: 0;
  margin: 0 auto;
  width: 320px;
  height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 1;
}

.cyber-ring {
  position: absolute;
  border-radius: 50%;
}

.ring-outer {
  width: 320px;
  height: 320px;
  border: 1px dashed rgba(122, 255, 251, 0.12);
  animation: rotateCW 35s linear infinite;
}

.ring-middle {
  width: 265px;
  height: 265px;
  border: 1px dotted rgba(99, 102, 241, 0.18);
  animation: rotateCCW 28s linear infinite;
}

.ring-inner {
  width: 210px;
  height: 210px;
  border: 2px dashed rgba(217, 70, 239, 0.1);
  animation: rotateCW 20s linear infinite;
}

@keyframes rotateCW {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes rotateCCW {
  from { transform: rotate(360deg); }
  to { transform: rotate(0deg); }
}

/* Floating Robot Image Container */
.robot-img-container {
  position: absolute;
  top: -90px;
  left: 0;
  right: 0;
  margin: 0 auto;
  width: 350px;
  height: 350px;
  z-index: 10;
  animation: robotFloat 6s ease-in-out infinite;
}

.robot-svg {
  width: 100%;
  height: 100%;
  display: block;
}



@keyframes robotFloat {
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-14px) rotate(1.5deg); }
  100% { transform: translateY(0px) rotate(0deg); }
}



/* Glassmorphism AI Terminal Card */
.hologram-terminal-card {
  position: absolute;
  width: 100%;
  bottom: 10px;
  background: rgba(17, 24, 39, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  overflow: hidden;
  z-index: 20;
  transition: border-color 0.4s ease, box-shadow 0.4s ease, transform 0.4s ease;
}
[dir="ltr"] .hologram-terminal-card { left: 0; }
[dir="rtl"] .hologram-terminal-card { right: 0; }

.hologram-terminal-card.typing-active {
  border-color: rgba(122, 255, 251, 0.35);
  box-shadow: 0 0 35px rgba(122, 255, 251, 0.18), 0 20px 50px rgba(0, 0, 0, 0.5);
  transform: translateY(-2px);
}

.terminal-header {
  background: rgba(17, 24, 39, 0.85);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.terminal-dots {
  gap: 6px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.dot.red { background-color: #F43F5E; }
.dot.yellow { background-color: #F59E0B; }
.dot.green { background-color: #10B981; }

.terminal-title {
  font-family: 'Outfit', sans-serif;
  color: #64748B;
  font-size: 0.725rem;
  letter-spacing: 1px;
}

.pulse-indicator {
  animation: pulseIndicator 1.5s infinite ease-in-out;
}

@keyframes pulseIndicator {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}

.terminal-body {
  padding: 16px;
  min-height: 290px;
}

.terminal-content {
  height: 140px;
  overflow-y: auto;
  font-family: 'Fira Code', 'Courier New', monospace;
  padding-right: 4px;
  scrollbar-width: thin;
  scrollbar-color: rgba(122, 255, 251, 0.2) transparent;
}

.terminal-content::-webkit-scrollbar {
  width: 4px;
}
.terminal-content::-webkit-scrollbar-thumb {
  background-color: rgba(122, 255, 251, 0.2);
  border-radius: 4px;
}

.terminal-welcome {
  font-size: 0.75rem;
  letter-spacing: 0.5px;
}

.terminal-user-query {
  font-size: 0.825rem;
}

.terminal-ai-response-wrapper {
  display: inline;
}

.terminal-ai-response {
  display: inline;
  font-size: 0.85rem;
  line-height: 1.5;
  color: #E2E8F0;
}

.terminal-cursor {
  display: inline-block;
  width: 7px;
  height: 14px;
  background: #7afffb;
  margin-left: 4px;
  margin-right: 4px;
  animation: terminalBlink 0.8s infinite;
  vertical-align: middle;
}

@keyframes terminalBlink {
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
}

/* Suggested Question Badges */
.terminal-suggestions {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 12px;
}

.suggestion-label {
  font-size: 0.75rem;
  font-family: 'Outfit', 'Cairo', sans-serif;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.terminal-suggestions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.suggestion-badge {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #94A3B8;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-family: 'Outfit', 'Cairo', sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.suggestion-badge:hover:not(:disabled) {
  background: rgba(122, 255, 251, 0.08);
  border-color: rgba(122, 255, 251, 0.35);
  color: #7afffb;
  transform: translateY(-1px);
}

.suggestion-badge.active {
  background: rgba(122, 255, 251, 0.12);
  border-color: #7afffb;
  color: #7afffb;
}

.suggestion-badge:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* Chat Input Field */
.terminal-input-wrapper {
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 2px 4px 2px 12px;
  transition: all 0.3s ease;
}

.terminal-input-wrapper:focus-within {
  border-color: rgba(122, 255, 251, 0.45);
  box-shadow: 0 0 15px rgba(122, 255, 251, 0.12);
}

.terminal-prompt-symbol {
  font-size: 1rem;
  margin-right: 6px;
  margin-left: 6px;
  font-family: monospace;
}

.terminal-input-field {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #F1F5F9;
  font-size: 0.85rem;
  font-family: 'Outfit', 'Cairo', sans-serif;
  padding: 8px 0;
  min-width: 0;
}

.terminal-input-field::placeholder {
  color: #475569;
}

.terminal-input-field:disabled {
  color: #64748B;
}
/* Interactive Background Particles Canvas */
.hero-bg-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

/* Responsiveness adjustments */
@media (max-width: 959px) {
  .hero-section {
    padding: 90px 0 50px 0;
    min-height: auto;
  }
  
  .intro-col {
    text-align: center !important;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 40px;
  }

  .role-container {
    border-left: none;
    border-right: none;
    border-bottom: 2px solid #7afffb;
    padding: 0 0 8px 0;
    margin-left: auto;
    margin-right: auto;
    display: inline-block;
  }
  
  .btn-actions-group {
    justify-content: center;
  }

  .cyber-col {
    min-height: 480px;
  }

  .cyber-workspace {
    max-width: 380px;
    height: 460px;
  }

  .cyber-portal {
    top: -80px;
    left: 0 !important;
    right: 0 !important;
    margin: 0 auto;
    width: 250px;
    height: 250px;
  }

  .ring-outer { width: 250px; height: 250px; }
  .ring-middle { width: 205px; height: 205px; }
  .ring-inner { width: 160px; height: 160px; }

  .robot-img-container {
    top: -95px;
    left: 0 !important;
    right: 0 !important;
    margin: 0 auto;
    width: 300px;
    height: 300px;
  }

  .hologram-terminal-card {
    position: relative;
    margin-top: 220px;
    left: auto !important;
    right: auto !important;
    max-width: 380px;
  }


}

/* Dummy Sections for testing Scroll & Scrollspy */
.dummy-section {
  position: relative;
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  border-top: 1px solid rgba(255, 255, 255, 0.03);
  padding: 80px 0;
  z-index: 2;
}

.dummy-section:nth-of-type(even) {
  background-color: rgba(255, 255, 255, 0.015);
}

.section-title {
  font-size: 2.2rem;
  font-weight: 900;
  margin-bottom: 20px;
  text-align: center;
  letter-spacing: 1px;
}

.section-content {
  text-align: center;
  color: #94A3B8;
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}
</style>