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

// Interactive experience dashboard state
const selectedJobIndex = ref(0)
const failedLogos = ref({})
const whiteBgCompanies = ['E Technologies', 'Smartizi Teknoloji', 'SeRiCo YAPI A.Ş', 'Namaa Solution', 'MGS Software']

// Skills section interactive filtering & data
const activeSkillsFilter = ref('all')

const skillCategories = computed(() => [
  { id: 'all', label: { en: 'All Arsenal', ar: 'كل العتاد', tr: 'Tümü' } },
  { id: 'frontend', label: { en: 'Frontend Dev', ar: 'تطوير الواجهات', tr: 'Önyüz' } },
  { id: 'backend', label: { en: 'Backend & APIs', ar: 'الخلفيات والربط', tr: 'Sunucu & API' } },
  { id: 'database', label: { en: 'Database & Cloud', ar: 'قواعد البيانات والسحاب', tr: 'Veritabanı & Bulut' } },
  { id: 'workflow', label: { en: 'AI & Workflow', ar: 'الذكاء الاصطناعي والإنتاجية', tr: 'Yapay Zeka & Süreç' } }
])

const skills = computed(() => [
  {
    name: 'Vue.js / Nuxt 3',
    category: 'frontend',
    level: 95,
    icon: 'mdi-vuejs',
    color: '#42b883',
    glowColor: 'rgba(66, 184, 131, 0.3)'
  },
  {
    name: 'JavaScript / TypeScript',
    category: 'frontend',
    level: 90,
    icon: 'mdi-language-typescript',
    color: '#3178c6',
    glowColor: 'rgba(49, 120, 198, 0.3)'
  },
  {
    name: 'Tailwind CSS / Vuetify',
    category: 'frontend',
    level: 95,
    icon: 'mdi-tailwind',
    color: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.3)'
  },
  {
    name: 'Pinia / Vuex',
    category: 'frontend',
    level: 90,
    icon: 'mdi-layers-outline',
    color: '#ffe066',
    glowColor: 'rgba(255, 224, 102, 0.3)'
  },
  {
    name: 'Laravel / PHP',
    category: 'backend',
    level: 92,
    icon: 'mdi-laravel',
    color: '#ff2d20',
    glowColor: 'rgba(255, 45, 32, 0.3)'
  },
  {
    name: 'Node.js / Express',
    category: 'backend',
    level: 85,
    icon: 'mdi-nodejs',
    color: '#68a063',
    glowColor: 'rgba(104, 160, 99, 0.3)'
  },
  {
    name: 'RESTful & SOAP APIs',
    category: 'backend',
    level: 90,
    icon: 'mdi-api',
    color: '#a5b4fc',
    glowColor: 'rgba(165, 180, 252, 0.3)'
  },
  {
    name: 'Marketplace & Logistics Integrations',
    category: 'backend',
    level: 88,
    icon: 'mdi-truck-delivery-outline',
    color: '#fb923c',
    glowColor: 'rgba(251, 146, 60, 0.3)'
  },
  {
    name: 'Supabase / PostgreSQL',
    category: 'database',
    level: 90,
    icon: 'mdi-database',
    color: '#3ecf8e',
    glowColor: 'rgba(62, 207, 142, 0.3)'
  },
  {
    name: 'MySQL / Relational DBs',
    category: 'database',
    level: 88,
    icon: 'mdi-database-outline',
    color: '#00758f',
    glowColor: 'rgba(0, 117, 143, 0.3)'
  },
  {
    name: 'Firebase / Firestore',
    category: 'database',
    level: 82,
    icon: 'mdi-firebase',
    color: '#ffca28',
    glowColor: 'rgba(255, 202, 40, 0.3)'
  },
  {
    name: 'AI-Assisted Dev (10x Productivity)',
    category: 'workflow',
    level: 95,
    icon: 'mdi-robot-outline',
    color: '#7afffb',
    glowColor: 'rgba(122, 255, 251, 0.3)'
  },
  {
    name: 'Git & DevOps / CI-CD',
    category: 'workflow',
    level: 85,
    icon: 'mdi-git',
    color: '#f05032',
    glowColor: 'rgba(240, 80, 50, 0.3)'
  },
  {
    name: 'Agile & Tech Leadership',
    category: 'workflow',
    level: 90,
    icon: 'mdi-account-group-outline',
    color: '#c084fc',
    glowColor: 'rgba(192, 132, 252, 0.3)'
  }
])

const filteredSkills = computed(() => {
  if (activeSkillsFilter.value === 'all') return skills.value
  return skills.value.filter(s => s.category === activeSkillsFilter.value)
})

const activeProjectsFilter = ref('all')

const projectCategories = computed(() => [
  { id: 'all', label: { en: 'All Projects', ar: 'الكل', tr: 'Tümü' } },
  { id: 'saas', label: { en: 'SaaS & ERP', ar: 'منصات سحابية & ERP', tr: 'SaaS & ERP' } },
  { id: 'ecommerce', label: { en: 'E-Commerce & Logistics', ar: 'التجارة واللوجستيات', tr: 'E-Ticaret & Lojistik' } },
  { id: 'enterprise', label: { en: 'Enterprise & Utilities', ar: 'الأنظمة المؤسسية والمرافق', tr: 'Kurumsal & Araçlar' } }
])

const projects = computed(() => [
  // SaaS & ERP
  {
    titleKey: 'projects.looplanfyTitle',
    descKey: 'projects.looplanfyDesc',
    category: 'saas',
    image: '/images/001.png',
    tech: ['Nuxt 3', 'Vue.js', 'Tailwind CSS', 'Laravel', 'Supabase'],
    demoUrl: '#',
    codeUrl: '#',
    accentColor: '#3ecf8e',
    glowColor: 'rgba(62, 207, 142, 0.25)'
  },
  {
    titleKey: 'projects.financeTitle',
    descKey: 'projects.financeDesc',
    category: 'saas',
    image: '/images/looplanfy_finance.png',
    tech: ['Amazon API', 'Trendyol API', 'Hepsiburada API', 'Laravel', 'MySQL', 'Vue 3'],
    demoUrl: '#',
    codeUrl: '#',
    accentColor: '#fb923c',
    glowColor: 'rgba(251, 146, 60, 0.25)'
  },
  {
    titleKey: 'projects.kokpitTitle',
    descKey: 'projects.kokpitDesc',
    category: 'saas',
    image: '/images/kokpit.png',
    tech: ['Vue 3', 'Pinia', 'Tailwind CSS', 'Node.js', 'Express', 'MongoDB'],
    demoUrl: '#',
    codeUrl: '#',
    accentColor: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.25)'
  },
  {
    titleKey: 'projects.onikiTitle',
    descKey: 'projects.onikiDesc',
    category: 'saas',
    image: '/images/oniki.png',
    tech: ['AI Matchmaking', 'Node.js', 'Vue.js', 'Tailwind CSS', 'Websockets'],
    demoUrl: '#',
    codeUrl: '#',
    accentColor: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.25)'
  },
  // E-Commerce & Logistics
  {
    titleKey: 'projects.yollandoTitle',
    descKey: 'projects.yollandoDesc',
    category: 'ecommerce',
    image: '/images/yollando.png',
    tech: ['B2B Portal', 'B2C Platform', 'Admin Dashboard', 'Laravel', 'MySQL', 'Vue.js'],
    demoUrl: '#',
    codeUrl: '#',
    accentColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.25)'
  },
  {
    titleKey: 'projects.bpazarTitle',
    descKey: 'projects.bpazarDesc',
    category: 'ecommerce',
    image: '/images/bpazar.png',
    tech: ['Multi-vendor', 'Laravel', 'Vue.js', 'Tailwind CSS', 'MySQL'],
    demoUrl: '#',
    codeUrl: '#',
    accentColor: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.25)'
  },
  {
    titleKey: 'projects.sileversinTitle',
    descKey: 'projects.sileversinDesc',
    category: 'ecommerce',
    image: '/images/sileversin.png',
    tech: ['Mobile App', 'Geolocation', 'Node.js', 'Express', 'Vue 3', 'Tailwind'],
    demoUrl: '#',
    codeUrl: '#',
    accentColor: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.25)'
  },
  // Enterprise & Utilities
  {
    titleKey: 'projects.givingTitle',
    descKey: 'projects.givingDesc',
    category: 'enterprise',
    image: '/images/islam_channel_giving.png',
    tech: ['Pusher Chat', 'Stripe Payments', 'Laravel', 'Nuxt 3', 'Tailwind CSS'],
    demoUrl: '#',
    codeUrl: '#',
    accentColor: '#6366f1',
    glowColor: 'rgba(99, 102, 241, 0.25)'
  },
  {
    titleKey: 'projects.radTitle',
    descKey: 'projects.radDesc',
    category: 'enterprise',
    image: '/images/rad_pro.png',
    tech: ['Multi-tenant AAA', 'Billing Gateway', 'Laravel', 'Vue.js', 'PostgreSQL'],
    demoUrl: '#',
    codeUrl: '#',
    accentColor: '#ec4899',
    glowColor: 'rgba(236, 72, 153, 0.25)'
  },
  {
    titleKey: 'projects.perapassageTitle',
    descKey: 'projects.perapassageDesc',
    category: 'enterprise',
    image: '/images/perapassage.png',
    tech: ['Visitor Check-In', 'Social Network', 'Vue.js', 'Nuxt 3', 'Firebase'],
    demoUrl: '#',
    codeUrl: '#',
    accentColor: '#14b8a6',
    glowColor: 'rgba(20, 184, 166, 0.25)'
  },
  {
    titleKey: 'projects.shamelaTitle',
    descKey: 'projects.shamelaDesc',
    category: 'enterprise',
    image: '/images/shamela.png',
    tech: ['Full-text Search', 'Indexing Engine', 'Nuxt 3', 'Vue 3', 'PostgreSQL', 'Tailwind'],
    demoUrl: '#',
    codeUrl: '#',
    accentColor: '#eab308',
    glowColor: 'rgba(234, 179, 8, 0.25)'
  }
])

const filteredProjects = computed(() => {
  if (activeProjectsFilter.value === 'all') return projects.value
  return projects.value.filter(p => p.category === activeProjectsFilter.value)
})

const handleLogoError = (company) => {
  failedLogos.value[company] = true
}

const getFallbackLogo = (companyName) => {
  if (companyName.includes('MGS')) return 'MGS'
  if (companyName.includes('SeRiCo')) return 'SR'
  if (companyName.includes('E Technologies')) return 'E'
  if (companyName.includes('Smartizi')) return 'S'
  if (companyName.includes('Limonist')) return 'L'
  if (companyName.includes('Namaa')) return 'N'
  return companyName.charAt(0)
}

const jobs = computed(() => [
  {
    company: 'E Technologies',
    logoImg: '/images/etechnologies.png',
    role: {
      en: 'Lead Frontend Developer',
      ar: 'مطور واجهات أمامية أول (Lead Frontend)',
      tr: 'Öncü Önyüz Geliştirici (Lead Frontend)'
    },
    period: {
      en: '10/2024 – Present',
      ar: '10/2024 – الآن',
      tr: '10/2024 – Günümüz'
    },
    location: {
      en: 'Istanbul, Turkiye',
      ar: 'إسطنبول، تركيا',
      tr: 'İstanbul, Türkiye'
    },
    tech: ['Vue.js', 'TypeScript', 'Pusher', 'Stripe', 'AI Tools', 'HTML5/CSS3', 'REST APIs'],
    details: {
      en: [
        "Served as the primary frontend lead, architecting and developing the client-side of the platform using Vue.js and TypeScript to ensure a scalable, maintainable, and type-safe codebase.",
        "Engineered a robust, real-time direct chat system utilizing Pusher (WebSockets), facilitating seamless and instant communication between donors and authorized UK organizations.",
        "Successfully integrated Stripe as the primary payment gateway, building secure and optimized donation flows to handle regular contributions and complex fundraising campaigns safely.",
        "Leveraged early-stage AI tools to accelerate component creation, troubleshoot code, and streamline frontend workflows during the initial development phases."
      ],
      ar: [
        "توليت مسؤولية قيادة وتطوير جانب العميل للمنصة باستخدام Vue.js و TypeScript لضمان كود برمجي آمن ومتين وقابل للتطوير.",
        "قمت ببناء نظام دردشة فوري متين باستخدام Pusher (WebSockets) لتسهيل التواصل اللحظي والمباشر بين المتبرعين والمنظمات البريطانية المعتمدة.",
        "دمجت بوابة Stripe كخيار دفع رئيسي، مع بناء تدفقات تبرع آمنة ومحسنة للتعامل مع الاشتراكات الدورية وحملات جمع التبرعات المعقدة.",
        "استخدمت أدوات الذكاء الاصطناعي لتسريع بناء المكونات، وحل المشكلات البرمجية، وتبسيط دورات العمل للواجهات الأمامية."
      ],
      tr: [
        "Vue.js ve TypeScript kullanarak platformun istemci tarafını mimari olarak tasarlayıp geliştirdim; ölçeklenebilir, bakımı kolay ve tip güvenli bir kod tabanı sağladım.",
        "Pusher (WebSockets) kullanarak bağışçılar ile yetkili Birleşik Krallık kuruluşları arasında sorunsuz ve anlık iletişimi kolaylaştıran güçlü bir sohbet sistemi kurdum.",
        "Stripe ödeme ağ geçidini entegre ederek düzenli bağışları ve karmaşık bağış toplama kampanyalarını güvenle yöneten optimize edilmiş akışlar oluşturdum.",
        "Bileşen oluşturmayı hızlandırmak, hataları çözmek ve önyüz iş akışlarını kolaylaştırmak için erken aşama yapay zeka araçlarını kullandım."
      ]
    }
  },
  {
    company: 'Smartizi Teknoloji',
    logoImg: '/images/Smartizi.png',
    role: {
      en: 'Lead Full-Stack Developer & Team Leader',
      ar: 'مطور ويب متكامل أول وقائد فريق (Part-Time)',
      tr: 'Öncü Full-Stack Geliştirici ve Ekip Lideri (Yarı Zamanlı)'
    },
    period: {
      en: '03/2021 – Present',
      ar: '03/2021 – الآن',
      tr: '03/2021 – Günümüz'
    },
    location: {
      en: 'Istanbul, Turkiye',
      ar: 'إسطنبول، تركيا',
      tr: 'İstanbul, Türkiye'
    },
    tech: ['Nuxt 3', 'Vue.js', 'Tailwind CSS', 'Laravel', 'Supabase', 'PHP', 'Node.js', 'REST APIs', 'Logistics APIs'],
    details: {
      en: [
        "Looplanfy (SaaS Platform): Architected and launched a comprehensive multi-tenant SaaS platform designed for creating and managing e-commerce stores and digital restaurant menus. Engineered the complete infrastructure integrating Nuxt 3, Vue.js, and Tailwind CSS with Laravel and Supabase, utilizing AI to achieve a 10x development speed.",
        "Looplanfy Finance (Mini-ERP): Developed a custom financial and inventory management system integrated with major marketplace APIs (Amazon Seller Central, Hepsiburada, Trendyol) and automated logistics (HepsiJET, Trendyol Express) to centralize e-commerce operations.",
        "Rad+ & Rad Pro (ISP Management): Directed the frontend team in building a complex, multi-tenant Authentication, Authorization, and Accounting (AAA) system tailored for internet service providers. Delivered advanced modules for detailed reporting, billing, and payment tracking.",
        "Digital Platforms & Libraries: Led the technical delivery of diverse web applications, optimizing user experience and system architecture for platforms like Sileversin (mobile car wash management) and The Golden Shamela (scalable digital library for researchers)."
      ],
      ar: [
        "منصة Looplanfy (SaaS): قمت بهندسة وإطلاق منصة SaaS متعددة المستأجرين لإنشاء وإدارة المتاجر الإلكترونية وقوائم المطاعم الرقمية. طوّرت البنية التحتية الكاملة برربط Nuxt 3 و Vue.js و Tailwind CSS مع Laravel و Supabase، مستخدماً الذكاء الاصطناعي لتحقيق سرعة تطوير ضاعفت الإنتاجية 10 مرات.",
        "نظام Looplanfy المالي (ERP مصغر): قمت بتطوير نظام مخصص لإدارة الشؤون المالية والمخزون، متكامل مع واجهات برمجة الأسواق الكبرى (Amazon, Hepsiburada, Trendyol) والخدمات اللوجستية المؤتمتة (HepsiJET, Trendyol Express) لتركيز وإدارة العمليات.",
        "إدارة شبكات Rad+ & Rad Pro: قدت فريق الواجهات الأمامية في بناء نظام AAA معقد ومتعدد المستأجرين مخصص لمزودي خدمات الإنترنت (ISPs)، مع تقديم وحدات متقدمة لإعداد التقارير المفصلة، الفواتير، وتتبع المدفوعات.",
        "المنصات والمكتبات الرقمية: قدت التسليم التقني لتطبيقات ويب متنوعة، محسّناً تجربة المستخدم وبنية الأنظمة مثل منصة Sileversin (إدارة غسيل السيارات المتنقل) والمكتبة الذهبية (مصدر رقمي متكامل وقابل للتوسع للباحثين)."
      ],
      tr: [
        "Looplanfy (SaaS Platformu): E-ticaret mağazaları ve dijital restoran menüleri oluşturmak için çok kiracılı (multi-tenant) kapsamlı bir SaaS platformu tasarlayıp başlattım. Nuxt 3, Vue.js ve Tailwind CSS'i Laravel ve Supabase ile entegre ederek altyapıyı kurdum; 10 kat geliştirme hızı elde etmek için yapay zekadan yararlandım.",
        "Looplanfy Finans (Mini-ERP): E-ticaret operasyonlarını merkezileştirmek için pazaryeri API'leri (Amazon, Hepsiburada, Trendyol) ve otomatik lojistik (HepsiJET, Trendyol Express) entegrasyonuna sahip özel bir finans ve envanter yönetim sistemi geliştirdim.",
        "Rad+ ve Rad Pro (ISP Yönetimi): İnternet servis sağlayıcıları için uyarlanmış karmaşık, çok kiracılı bir AAA (Kimlik Doğrulama, Yetkilendirme ve Hesap Yönetimi) sistemi oluşturmada önyüz ekibine liderlik ettim; detaylı raporlama, faturalandırma ve ödeme takibi modülleri sundum.",
        "Dijital Platformlar ve Kütüphaneler: Mobil araç yıkama yönetim sistemi (Sileversin) ve araştırmacılar için ölçeklenebilir dijital kütüphane kaynağı (The Golden Shamela) gibi platformların sistem mimarisini ve kullanıcı deneyimini optimize ettim."
      ]
    }
  },
  {
    company: 'Limonist Meta',
    logoImg: '/images/limonist.png',
    role: {
      en: 'Frontend Team Leader',
      ar: 'قائد فريق الواجهات الأمامية (Frontend Team Leader)',
      tr: 'Önyüz Ekip Lideri (Frontend Team Leader)'
    },
    period: {
      en: '07/2023 – 06/2024',
      ar: '07/2023 – 06/2024',
      tr: '07/2023 – 06/2024'
    },
    location: {
      en: 'Istanbul, Turkiye',
      ar: 'إسطنبول، تركيا',
      tr: 'İstanbul, Türkiye'
    },
    tech: ['Vue.js', 'Nuxt.js', 'Vuetify', 'REST APIs', 'B2B/B2C Systems', 'Logistics Systems', 'Admin Dashboard'],
    details: {
      en: [
        "Team Leadership & Delivery: Directed the frontend development team in building the complete suite of Yollando applications (B2B, B2C, and Admin Panel), a global package forwarding and logistics platform.",
        "B2B/B2C Platform Development: Engineered a user-centric frontend architecture allowing global customers to seamlessly generate local Turkish shipping addresses, manage their remote inventory, and consolidate international shipments.",
        "Logistics Admin Dashboard: Architected a comprehensive, high-performance admin panel to track complex delivery processes, manage customized logistics workflows, and oversee user accounts and international dispatch operations."
      ],
      ar: [
        "قيادة الفريق والتسليم: قدت فريق تطوير الواجهات الأمامية لبناء مجموعة تطبيقات Yollando الكاملة (B2B, B2C، ولوحة التحكم)، وهي منصة عالمية لإعادة توجيه الطرود والخدمات اللوجستية.",
        "تطوير منصات B2B/B2C: صممت واجهات مستخدم متطورة تتيح للعملاء حول العالم إنشاء عناوين شحن تركية محلية، وإدارة مخزونهم عن بعد، وتجميع الشحنات الدولية بسهولة.",
        "لوحة تحكم الخدمات اللوجستية: قمت بهندسة لوحة تحكم إدارية عالية الأداء لتتبع عمليات التوصيل المعقدة، وإدارة تدفقات العمل اللوجستية المخصصة، ومراقبة الحسابات وعمليات الإرسال الدولي."
      ],
      tr: [
        "Ekip Liderliği ve Teslimat: Küresel bir paket yönlendirme ve lojistik platformu olan Yollando uygulamalarının (B2B, B2C ve Yönetici Paneli) geliştirilmesinde önyüz ekibini yönettim.",
        "B2B/B2C Platform Geliştirme: Küresel müşterilerin yerel Türkçe gönderim adresleri oluşturmasına, envanterlerini uzaktan yönetmesine ve uluslararası gönderileri birleştirmesine olanak tanıyan kullanıcı odaklı bir mimari kurdum.",
        "Lojistik Yönetim Paneli: Karmaşık teslimat süreçlerini izlemek, özel lojistik iş akışlarını yönetmek ve uluslararası sevkiyat operasyonlarını denetlemek için yüksek performanslı ve kapsamlı bir yönetici paneli tasarladım."
      ]
    }
  },
  {
    company: 'MGS Software',
    logoImg: '/images/mgs.png',
    role: {
      en: 'Senior Frontend Developer',
      ar: 'مطور واجهات أمامية أول (Senior Frontend)',
      tr: 'Kıdemli Önyüz Geliştirici (Senior Frontend)'
    },
    period: {
      en: '03/2020 – 11/2023',
      ar: '03/2020 – 11/2023',
      tr: '03/2020 – 11/2023'
    },
    location: {
      en: 'Istanbul, Turkiye',
      ar: 'إسطنبول، تركيا',
      tr: 'İstanbul, Türkiye'
    },
    tech: ['Vue.js', 'Nuxt.js', 'JavaScript', 'Tailwind CSS', 'SaaS', 'B2B Platforms', 'AI Event Matchmaking'],
    details: {
      en: [
        "Enterprise Frontend Development: Acted as a core senior frontend developer within a large-scale engineering team, delivering high-performance UI solutions for diverse and complex applications.",
        "SaaS & B2B Platforms: Developed the client-side architecture for Kokpit (a comprehensive SaaS field management application for security firms) and Oniki (an AI-driven hybrid B2B matchmaking event platform).",
        "User-Centric Interfaces: Built intuitive and scalable interfaces for applications like PeraPassage (corporate visitor management) and Petner, ensuring cross-device compatibility and optimal user experience.",
        "Team Collaboration & Integration: Collaborated closely with backend engineers, UI/UX designers, and product managers to ensure seamless API integrations and maintain clean, scalable codebases across all projects."
      ],
      ar: [
        "تطوير واجهات الشركات الكبرى: عملت كمطور واجهات أمامية أول أساسي ضمن فريق هندسي كبير، مقدماً حلول واجهات مستخدم عالية الأداء لتطبيقات متنوعة ومعقدة.",
        "منصات SaaS و B2B: قمت بتطوير البنية البرمجية لجانب العميل لكل من تطبيق Kokpit (تطبيق SaaS لإدارة الميدان لشركات الأمن) ومنصة Oniki (منصة تفاعلية مدعومة بالذكاء الاصطناعي لتنظيم فعاليات الـ B2B).",
        "واجهات متمحورة حول المستخدم: قمت ببناء واجهات مرنة وسهلة الاستخدام لتطبيقات مثل PeraPassage (إدارة الزوار للشركات) وتطبيق Petner، مع ضمان التوافق التام مع الأجهزة وتحسين تجربة التصفح.",
        "التعاون والتكامل: عملت بتعاون وثيق مع مهندسي الخلفيات، ومصممي الواجهات، ومديري المنتجات لضمان دمج سلس للواجهات البرمجية والحفاظ على كود نظيف وقابل للتطوير."
      ],
      tr: [
        "Kurumsal Önyüz Geliştirme: Büyük ölçekli bir mühendislik ekibinde kıdemli önyüz geliştirici olarak görev aldım; çeşitli ve karmaşık uygulamalar için yüksek performanslı kullanıcı arayüzü çözümleri sundum.",
        "SaaS ve B2B Platformları: Güvenlik firmaları için SaaS tabanlı saha yönetim uygulaması Kokpit ve yapay zeka destekli hibrit B2B eşleştirme platformu Oniki'nin istemci mimarisini geliştirdim.",
        "Kullanıcı Odaklı Arayüzler: Kurumsal ziyaretçi yönetim sistemi PeraPassage ve Petner gibi uygulamalar için cihazlar arası uyumluluk ve optimum kullanıcı deneyimi sağlayan sezgisel arayüzler oluşturdum.",
        "Ekip İşbirliği ve Entegrasyon: Tüm projelerde sorunsuz API entegrasyonu ve ölçeklenebilir temiz kod tabanları sürdürmek için arka uç mühendisleri, UI/UX tasarımcıları ve ürün yöneticileriyle yakın işbirliği yaptım."
      ]
    }
  },
  {
    company: 'Namaa Solution',
    logoImg: '/images/Namaa Solution.png',
    role: {
      en: 'Full Stack Developer',
      ar: 'مطور ويب متكامل (Full Stack)',
      tr: 'Full Stack Web Geliştirici'
    },
    period: {
      en: '08/2019 – 03/2020',
      ar: '08/2019 – 03/2020',
      tr: '08/2019 – 03/2020'
    },
    location: {
      en: 'Istanbul, Turkiye',
      ar: 'إسطنبول، تركيا',
      tr: 'İstanbul, Türkiye'
    },
    tech: ['PHP', 'Laravel', 'JavaScript', 'E-commerce', 'PostgreSQL', 'Multi-vendor Systems'],
    details: {
      en: [
        "E-Commerce & Corporate Systems: Engineered multi-vendor e-commerce platforms (Bpazar, Trolley Market) and enterprise corporate sites (Baladna Halal), handling both frontend architectures and backend database logic to ensure robust performance and scalability."
      ],
      ar: [
        "منصات التجارة الإلكترونية ومواقع الشركات: قمت بتطوير منصات تجارة إلكترونية متعددة التجار (Bpazar, Trolley Market) ومواقع شركات كبرى (Baladna Halal)، متولياً هندسة الواجهات الأمامية والمنطق البرمجي للخلفيات لضمان الأداء القوي والتوسع."
      ],
      tr: [
        "E-Ticaret ve Kurumsal Sistemler: Çok satıcılı e-ticaret platformları (Bpazar, Trolley Market) ve kurumsal web siteleri (Baladna Halal) tasarladım; performans ve ölçeklenebilirlik için hem önyüz mimarisini hem de veritabanı mantığını yönettim."
      ]
    }
  },
  {
    company: 'SeRiCo YAPI A.Ş',
    logoImg: '/images/SeRiCo.png',
    role: {
      en: 'Web System Manager',
      ar: 'مدير أنظمة الويب والـ ERP',
      tr: 'Web Sistem Yöneticisi & ERP Geliştirici'
    },
    period: {
      en: '01/2017 – 08/2019',
      ar: '01/2017 – 08/2019',
      tr: '01/2017 – 08/2019'
    },
    location: {
      en: 'Istanbul, Turkiye',
      ar: 'إسطنبول، تركيا',
      tr: 'İstanbul, Türkiye'
    },
    tech: ['PHP', 'MySQL', 'ERP Systems', 'Stock Management', 'Internal Tools'],
    details: {
      en: [
        "Internal Tools & ERP: Developed and managed internal operational systems from scratch, including a custom Stock Management application for automated spare parts ordering and an Export Manager system designed to generate official, government-recognized export documentation."
      ],
      ar: [
        "الأدوات الداخلية ونظام الـ ERP: طوّرت وأدرت أنظمة تشغيل داخلية من الصفر، بما في ذلك تطبيق مخصص لإدارة المخزون والطلب التلقائي لقطع الغيار، ونظام إدارة التصدير (Export Manager) لإنشاء وثائق التصدير الرسمية المعترف بها حكومياً."
      ],
      tr: [
        "Dahili Araçlar ve ERP: Otomatik yedek parça siparişi için özel bir Stok Yönetim uygulaması ve resmi dış ticaret belgeleri oluşturan İhracat Yönetim sistemi dahil olmak üzere dahili operasyonel sistemleri sıfırdan geliştirdim ve yönettim."
      ]
    }
  }
])

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

    <!-- Skills Section (Futuristic Capabilities Hub) -->
    <section id="skills" class="skills-section">
      <v-container>
        <div class="text-center mb-12">
          <h2 class="section-title">
            <span class="gradient-text">{{ $t('skills.title') }}</span>
          </h2>
          <p class="section-subtitle">{{ $t('skills.subtitle') }}</p>
        </div>

        <!-- Filter Navigation Pills -->
        <div class="skills-filter-nav d-flex flex-wrap justify-center align-center mb-10">
          <button
            v-for="cat in skillCategories"
            :key="cat.id"
            class="filter-pill-btn"
            :class="{ 'active': activeSkillsFilter === cat.id }"
            @click="activeSkillsFilter = cat.id"
          >
            {{ cat.label[locale] }}
          </button>
        </div>

        <!-- Skills Grid -->
        <v-row class="skills-grid justify-center">
          <v-col
            v-for="skill in filteredSkills"
            :key="skill.name"
            cols="12"
            sm="6"
            md="4"
            class="skill-card-col"
          >
            <div class="skill-card">
              <!-- Glow overlay matching the tech color -->
              <div class="skill-card-glow" :style="{ background: `radial-gradient(circle at 50% 50%, ${skill.glowColor} 0%, transparent 60%)` }"></div>
              
              <!-- Content -->
              <div class="skill-card-inner d-flex align-center justify-space-between">
                <div class="d-flex align-center min-w-0">
                  <!-- Skill Icon Badge -->
                  <div class="skill-icon-badge mr-3 ml-3" :style="{ color: skill.color, borderColor: `${skill.color}33`, background: `${skill.color}0a` }">
                    <v-icon :icon="skill.icon" size="22"></v-icon>
                  </div>
                  <!-- Name & Category -->
                  <div class="skill-details min-w-0">
                    <h3 class="skill-name text-white text-truncate">{{ skill.name }}</h3>
                    <span class="skill-cat-tag text-caption">{{ skill.category.toUpperCase() }}</span>
                  </div>
                </div>

                <!-- Skill Circular Level Gauge -->
                <div class="skill-gauge-wrapper flex-shrink-0">
                  <svg class="skill-gauge-svg" viewBox="0 0 36 36">
                    <!-- Background circle -->
                    <circle class="gauge-bg" cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="2.5"></circle>
                    <!-- Animated filled circle -->
                    <circle 
                      class="gauge-fill" 
                      cx="18" 
                      cy="18" 
                      r="15.915" 
                      fill="none" 
                      :stroke="skill.color" 
                      stroke-width="2.5"
                      stroke-dasharray="100 100"
                      :stroke-dashoffset="100 - skill.level"
                      stroke-linecap="round"
                    ></circle>
                  </svg>
                  <!-- Inner text -->
                  <span class="gauge-percent-text" :style="{ color: skill.color }">{{ skill.level }}%</span>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Projects Section (Futuristic Portfolio Showcase) -->
    <section id="projects" class="projects-section">
      <v-container>
        <div class="text-center mb-12">
          <h2 class="section-title">
            <span class="gradient-text">{{ $t('projects.title') }}</span>
          </h2>
          <p class="section-subtitle">{{ $t('projects.subtitle') }}</p>
        </div>

        <!-- Projects Filter Navigation Pills -->
        <div class="projects-filter-nav d-flex flex-wrap justify-center align-center mb-10">
          <button
            v-for="cat in projectCategories"
            :key="cat.id"
            class="filter-pill-btn"
            :class="{ 'active': activeProjectsFilter === cat.id }"
            @click="activeProjectsFilter = cat.id"
          >
            {{ cat.label[locale] }}
          </button>
        </div>

        <v-row class="projects-grid justify-center">
          <v-col
            v-for="project in filteredProjects"
            :key="project.titleKey"
            cols="12"
            md="4"
            class="project-card-col"
          >
            <div class="project-card">
              <!-- Glowing Neon Accent Border / Overlay -->
              <div class="project-card-glow" :style="{ background: `radial-gradient(circle at 50% 100%, ${project.glowColor} 0%, transparent 70%)` }"></div>
              
              <!-- Card Image / Mockup Wrapper -->
              <div class="project-image-wrapper">
                <img :src="project.image" :alt="$t(project.titleKey)" class="project-image" />
                <div class="project-image-overlay"></div>
              </div>

              <!-- Content details -->
              <div class="project-info-wrapper">
                <h3 class="project-card-title text-white mb-2">{{ $t(project.titleKey) }}</h3>
                <p class="project-card-desc text-body-2 mb-4">{{ $t(project.descKey) }}</p>
                
                <!-- Tech tags used in the project -->
                <div class="project-tech-tags d-flex flex-wrap gap-1 mb-6">
                  <span
                    v-for="tech in project.tech"
                    :key="tech"
                    class="project-tech-pill"
                    :style="{ borderColor: `${project.accentColor}25`, color: project.accentColor }"
                  >
                    {{ tech }}
                  </span>
                </div>

                <!-- Action Button Links -->
                <div class="project-actions d-flex justify-space-between align-center">
                  <v-btn
                    :href="project.demoUrl"
                    target="_blank"
                    variant="flat"
                    density="comfortable"
                    class="action-btn-demo px-4 text-none"
                    :style="{ background: `${project.accentColor}15`, border: `1px solid ${project.accentColor}40`, color: project.accentColor }"
                  >
                    <v-icon icon="mdi-open-in-new" size="14" class="mr-1 ml-1"></v-icon>
                    {{ $t('projects.demo') }}
                  </v-btn>

                  <v-btn
                    :href="project.codeUrl"
                    target="_blank"
                    variant="text"
                    density="comfortable"
                    class="action-btn-code px-4 text-none"
                    style="color: #94a3b8; border: 1px solid rgba(255,255,255,0.05);"
                  >
                    <v-icon icon="mdi-github" size="14" class="mr-1 ml-1"></v-icon>
                    {{ $t('projects.code') }}
                  </v-btn>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Experience Section (Futuristic Holographic Dashboard style) -->
    <section id="experience" class="experience-section">
      <v-container>
        <div class="text-center mb-12">
          <h2 class="section-title">
            <span class="gradient-text">{{ $t('experience.title') }}</span>
          </h2>
          <p class="section-subtitle">{{ $t('experience.subtitle') }}</p>
        </div>

        <div class="experience-dashboard-wrapper">
          <v-row class="fill-height">
            <!-- Left Side: Interactive Job Timeline Nodes -->
            <v-col cols="12" md="4" class="pr-md-6 timeline-nodes-col">
              <div class="timeline-container">
                <div
                  v-for="(job, index) in jobs"
                  :key="index"
                  class="timeline-node-card"
                  :class="{ 'active': selectedJobIndex === index }"
                  @click="selectedJobIndex = index"
                >
                  <!-- Glow effect -->
                  <div class="node-glow-overlay"></div>
                  
                  <div class="d-flex align-start timeline-card-inner">
                    <!-- Icon badge / Logo with fallback -->
                    <div 
                      class="node-icon-wrapper"
                      :class="{ 'bg-white': whiteBgCompanies.includes(job.company) }"
                    >
                      <img 
                        v-if="job.logoImg && !failedLogos[job.company]" 
                        :src="job.logoImg" 
                        :alt="job.company"
                        class="company-logo-img" 
                        @error="handleLogoError(job.company)"
                      />
                      <span v-else class="company-logo-fallback">{{ getFallbackLogo(job.company) }}</span>
                    </div>

                    <div class="node-brief-details">
                      <span class="node-period">{{ job.period[locale] }}</span>
                      <h3 class="node-company">{{ job.company }}</h3>
                      <p class="node-role">{{ job.role[locale] }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </v-col>

            <!-- Right Side: Interactive Holographic Detail Screen -->
            <v-col cols="12" md="8" class="pl-md-6 details-hologram-col">
              <div class="hologram-screen-container">
                <div class="screen-frame-glow"></div>
                <div class="screen-scanlines"></div>
                
                <transition name="hologram-fade" mode="out-in">
                  <div :key="selectedJobIndex" class="hologram-content-wrapper">
                    <!-- Screen Header -->
                    <div class="screen-header d-flex flex-wrap align-center justify-space-between mb-6 pb-4">
                      <div>
                        <span class="screen-meta-tag"><v-icon icon="mdi-map-marker" size="12" class="mr-1"></v-icon> {{ jobs[selectedJobIndex].location[locale] }}</span>
                        <h2 class="hologram-job-title text-h5 font-weight-black text-white mt-1">{{ jobs[selectedJobIndex].role[locale] }}</h2>
                        <h3 class="hologram-company-title text-subtitle-1 text-primary font-weight-bold">{{ jobs[selectedJobIndex].company }}</h3>
                      </div>
                      <div class="text-right">
                        <span class="hologram-period-badge">{{ jobs[selectedJobIndex].period[locale] }}</span>
                      </div>
                    </div>

                    <!-- Achievements Bullets -->
                    <div class="screen-body mb-6">
                      <h4 class="details-section-label mb-4"><v-icon icon="mdi-checkbox-marked-circle-outline" size="14" color="primary" class="mr-2"></v-icon>{{ locale === 'ar' ? 'أبرز الإنجازات والمسؤوليات:' : locale === 'tr' ? 'Önemli Başarılar ve Sorumluluklar:' : 'Key Accomplishments & Responsibilities:' }}</h4>
                      <ul class="achievements-list">
                        <li 
                          v-for="(bullet, idx) in jobs[selectedJobIndex].details[locale]" 
                          :key="idx" 
                          class="achievement-item text-body-2"
                        >
                          <span class="bullet-glow-point"></span>
                          <span class="bullet-text" v-html="bullet"></span>
                        </li>
                      </ul>
                    </div>

                    <!-- Technologies Used -->
                    <div class="screen-footer">
                      <h4 class="details-section-label mb-3"><v-icon icon="mdi-cpu" size="14" color="primary" class="mr-2"></v-icon>{{ locale === 'ar' ? 'التقنيات المستخدمة:' : locale === 'tr' ? 'Kullanılan Teknolojiler:' : 'Technologies Leveraged:' }}</h4>
                      <div class="tech-pills-list d-flex flex-wrap gap-2">
                        <span 
                          v-for="(techName, idx) in jobs[selectedJobIndex].tech" 
                          :key="idx" 
                          class="tech-pill-badge"
                        >
                          {{ techName }}
                        </span>
                      </div>
                    </div>
                  </div>
                </transition>
              </div>
            </v-col>
          </v-row>
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

/* ==========================================================================
   Experience Section Styles (Futuristic Interactive Hologram Dashboard)
   ========================================================================== */
.experience-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  background-color: transparent;
  padding: 100px 0;
  z-index: 2;
}

.experience-dashboard-wrapper {
  position: relative;
  width: 100%;
}

.timeline-node-card.active .node-icon-wrapper {
  background: rgba(122, 255, 251, 0.1);
  border-color: rgba(122, 255, 251, 0.3);
  color: #7afffb;
  box-shadow: 0 0 10px rgba(122, 255, 251, 0.25);
}

.company-logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 8px;
}

.company-logo-fallback {
  font-family: 'Outfit', sans-serif;
  font-size: 0.9rem;
  font-weight: 800;
  color: #7afffb;
  text-shadow: 0 0 8px rgba(122, 255, 251, 0.4);
}

.timeline-node-card {
  position: relative;
  background: rgba(11, 15, 25, 0.85); /* Matches premium header glass */
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 18px 22px;
  margin-bottom: 16px;
  cursor: pointer;
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}

.timeline-node-card:last-child {
  margin-bottom: 0;
}

.timeline-node-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: transparent;
  transition: all 0.3s ease;
}

[dir="rtl"] .timeline-node-card::before {
  left: auto;
  right: 0;
}

.timeline-node-card:hover {
  background: rgba(11, 15, 25, 0.75); /* Darker on hover */
  border-color: rgba(122, 255, 251, 0.15);
  transform: translateX(6px);
}

[dir="rtl"] .timeline-node-card:hover {
  transform: translateX(-6px);
}

.timeline-node-card.active {
  background: rgba(122, 255, 251, 0.04);
  /* Fallback overlay in CSS to mix active color with frosted glass */
  background: linear-gradient(rgba(122, 255, 251, 0.05), rgba(122, 255, 251, 0.05)), rgba(11, 15, 25, 0.7);
  border-color: rgba(122, 255, 251, 0.3);
  box-shadow: 0 0 20px rgba(122, 255, 251, 0.06);
}

.timeline-card-inner {
  display: flex;
  gap: 16px;
  width: 100%;
}

.timeline-node-card.active::before {
  background: #7afffb;
  box-shadow: 0 0 12px #7afffb;
}

.node-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(11, 15, 25, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #94A3B8;
  transition: all 0.3s ease;
  flex-shrink: 0;
  overflow: hidden;
  padding: 4px;
}

.node-icon-wrapper.bg-white {
  background-color: #FFFFFF !important;
  border-color: rgba(255, 255, 255, 0.15) !important;
}

.timeline-node-card.active .node-icon-wrapper {
  background: rgba(122, 255, 251, 0.1);
  border-color: rgba(122, 255, 251, 0.3);
  color: #7afffb;
  box-shadow: 0 0 10px rgba(122, 255, 251, 0.25);
}

.node-brief-details {
  display: flex;
  flex-direction: column;
}

.node-period {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #64748B;
  letter-spacing: 0.5px;
}

.timeline-node-card.active .node-period {
  color: #7afffb;
}

.node-company {
  font-size: 1.15rem;
  font-weight: 800;
  color: #FFFFFF;
  margin: 2px 0 4px 0;
}

.node-role {
  font-size: 0.85rem;
  color: #94A3B8;
  font-weight: 500;
  opacity: 0.85;
}

/* Hologram Right Column */
.hologram-screen-container {
  position: relative;
  background: rgba(11, 15, 25, 0.85); /* Matches premium header glass */
  border: 1px solid rgba(122, 255, 251, 0.15);
  border-radius: 24px;
  padding: 36px;
  min-height: 550px;
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  box-shadow: 
    0 25px 60px rgba(0, 0, 0, 0.45),
    inset 0 0 35px rgba(122, 255, 251, 0.02);
  overflow: hidden;
}

.screen-frame-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 24px;
  pointer-events: none;
  box-shadow: inset 0 0 25px rgba(122, 255, 251, 0.12);
  z-index: 2;
  opacity: 0.6;
}

/* scanlines for retro CRT feel */
.screen-scanlines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    rgba(18, 16, 16, 0) 50%, 
    rgba(0, 0, 0, 0.25) 50%
  );
  background-size: 100% 4px;
  pointer-events: none;
  z-index: 1;
  opacity: 0.35;
}

.hologram-content-wrapper {
  position: relative;
  z-index: 3;
}

.screen-header {
  border-bottom: 1px dashed rgba(122, 255, 251, 0.15);
}

.screen-meta-tag {
  display: inline-flex;
  align-items: center;
  background: rgba(122, 255, 251, 0.05);
  border: 1px solid rgba(122, 255, 251, 0.15);
  border-radius: 30px;
  padding: 4px 12px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #7afffb;
}

.hologram-job-title {
  font-size: 1.55rem;
  letter-spacing: 0.3px;
}

.hologram-company-title {
  font-size: 1.05rem !important;
}

.hologram-period-badge {
  display: inline-block;
  background: rgba(122, 255, 251, 0.05);
  border: 1px solid rgba(122, 255, 251, 0.15);
  border-radius: 8px;
  padding: 6px 14px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #7afffb;
  box-shadow: 0 0 10px rgba(122, 255, 251, 0.05);
}

.details-section-label {
  font-size: 0.85rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #6366F1;
  letter-spacing: 0.8px;
}

.achievements-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.achievement-item {
  position: relative;
  padding-left: 24px;
  color: #94A3B8;
  line-height: 1.65;
  font-size: 0.925rem;
}

[dir="rtl"] .achievement-item {
  padding-left: 0;
  padding-right: 24px;
}

.bullet-glow-point {
  position: absolute;
  top: 9px;
  left: 6px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #7afffb;
  box-shadow: 0 0 8px #7afffb;
}

[dir="rtl"] .bullet-glow-point {
  left: auto;
  right: 6px;
}

.tech-pills-list {
  margin-top: 8px;
  gap: 8px;
}

.tech-pill-badge {
  background: rgba(99, 102, 241, 0.07);
  border: 1px solid rgba(99, 102, 241, 0.2);
  color: #a5b4fc;
  border-radius: 30px;
  padding: 5px 14px;
  font-size: 0.75rem;
  font-weight: 700;
  transition: all 0.3s ease;
}

.tech-pill-badge:hover {
  background: rgba(122, 255, 251, 0.1);
  border-color: rgba(122, 255, 251, 0.4);
  color: #7afffb;
  box-shadow: 0 0 12px rgba(122, 255, 251, 0.2);
  transform: translateY(-2px);
}

/* Hologram Transitions */
.hologram-fade-enter-active,
.hologram-fade-leave-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.hologram-fade-enter-from {
  opacity: 0;
  transform: scale(0.98) translateY(12px);
  filter: blur(4px);
}

.hologram-fade-leave-to {
  opacity: 0;
  transform: scale(1.02) translateY(-12px);
  filter: blur(4px);
}

@media (min-width: 960px) {
  .hologram-screen-container {
    position: sticky;
    top: 110px;
    z-index: 10;
  }
}

@media (max-width: 959px) {
  .experience-section {
    padding: 60px 0;
  }
  .timeline-nodes-col {
    margin-bottom: 24px;
  }
  .hologram-screen-container {
    min-height: auto;
    padding: 24px;
  }
  .timeline-node-card:hover {
    transform: none !important;
  }
}

/* ==========================================================================
   Skills Section Styles (Capabilities Hub)
   ========================================================================== */
.skills-section {
  position: relative;
  padding: 100px 0;
  background-color: transparent;
  z-index: 2;
}

.skills-filter-nav,
.projects-filter-nav {
  gap: 12px;
}

.filter-pill-btn {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  color: #94a3b8;
  padding: 8px 22px;
  border-radius: 30px;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  outline: none;
  cursor: pointer;
}

.filter-pill-btn:hover {
  background: rgba(122, 255, 251, 0.04);
  border-color: rgba(122, 255, 251, 0.2);
  color: #7afffb;
}

.filter-pill-btn.active {
  background: rgba(122, 255, 251, 0.08);
  border-color: #7afffb;
  color: #7afffb;
  box-shadow: 0 0 15px rgba(122, 255, 251, 0.15);
}

.skills-grid {
  margin-top: 10px;
}

.skill-card {
  position: relative;
  background: rgba(11, 15, 25, 0.85); /* Matches premium header glass */
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 20px 24px;
  overflow: hidden;
  height: 100%;
  cursor: default;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.skill-card:hover {
  transform: translateY(-5px);
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: 
    0 15px 35px rgba(0, 0, 0, 0.5),
    inset 0 0 15px rgba(255, 255, 255, 0.02);
}

.skill-card-glow {
  position: absolute;
  inset: 0;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.4s ease;
  z-index: 1;
}

.skill-card:hover .skill-card-glow {
  opacity: 0.45;
}

.skill-card-inner {
  position: relative;
  z-index: 2;
  height: 100%;
}

.skill-icon-badge {
  width: 46px;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  border: 1px solid;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.skill-card:hover .skill-icon-badge {
  transform: scale(1.08) rotate(5deg);
}

.skill-name {
  font-family: 'Outfit', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 2px;
  letter-spacing: -0.01em;
}

.skill-cat-tag {
  color: #64748b;
  font-weight: 800;
  letter-spacing: 0.05em;
  font-size: 0.7rem !important;
}

.skill-gauge-wrapper {
  position: relative;
  width: 48px;
  height: 48px;
}

.skill-gauge-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.gauge-fill {
  transition: stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.gauge-percent-text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Outfit', sans-serif;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

@media (max-width: 959px) {
  .skills-section {
    padding: 60px 0;
  }
}

/* ==========================================================================
   Projects Section Styles (Showcase Portfolio)
   ========================================================================== */
.projects-section {
  position: relative;
  padding: 100px 0;
  background-color: transparent;
  z-index: 2;
}

.project-card {
  position: relative;
  background: rgba(11, 15, 25, 0.85); /* Matches premium header glass */
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.45s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: default;
}

.project-card:hover {
  transform: translateY(-8px);
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.55),
    inset 0 0 20px rgba(255, 255, 255, 0.02);
}

.project-card-glow {
  position: absolute;
  inset: 0;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.45s ease;
  z-index: 1;
}

.project-card:hover .project-card-glow {
  opacity: 0.5;
}

.project-image-wrapper {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: #0f172a;
}

.project-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.project-card:hover .project-image {
  transform: scale(1.05) rotate(1deg);
}

.project-image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(11, 15, 25, 0.9) 0%, transparent 100%);
  z-index: 2;
}

.project-info-wrapper {
  padding: 24px;
  position: relative;
  z-index: 2;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.project-card-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 1.25rem;
  letter-spacing: -0.01em;
}

.project-card-desc {
  color: #94a3b8;
  line-height: 1.6;
  flex-grow: 1;
}

.project-tech-tags {
  gap: 6px !important;
}

.project-tech-pill {
  font-family: 'Outfit', sans-serif;
  font-size: 0.72rem;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid;
  padding: 4px 10px;
  border-radius: 12px;
  letter-spacing: 0.02em;
}

.action-btn-demo, .action-btn-code {
  border-radius: 12px !important;
  font-weight: 700 !important;
  font-size: 0.78rem !important;
  transition: all 0.3s ease !important;
}

.action-btn-demo:hover {
  box-shadow: 0 0 15px currentColor;
}

.action-btn-code:hover {
  background: rgba(255, 255, 255, 0.03) !important;
  border-color: rgba(255, 255, 255, 0.15) !important;
  color: #ffffff !important;
}

@media (max-width: 959px) {
  .projects-section {
    padding: 60px 0;
  }
}
</style>