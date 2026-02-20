// ==============================
// MathLinguistic - Core Logic Only
// (Clean Version for PWA Debugging)
// ==============================

// 1. تعريف العناصر الأساسية
const mainContent = document.getElementById('main-content');
const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.getElementById('sidebar-menu');
const themeToggle = document.getElementById('theme-toggle');
const backToTopBtn = document.getElementById('back-to-top');
const installBtn = document.getElementById('install-pwa-btn');

let deferredPrompt = null;
let isOnHomePage = false;

// ==============================
// 2. إدارة الثيم (ليلي / نهاري)
// ==============================
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.body.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.body.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.body.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  if (!themeToggle) return;
  const icon = themeToggle.querySelector('i');
  if (icon) {
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }
}

// ==============================
// 3. إدارة القائمة الجانبية
// ==============================
function toggleSidebar() {
  if (!sidebar) return;
  sidebar.classList.toggle('open');
  const isOpen = sidebar.classList.contains('open');
  sidebar.setAttribute('aria-hidden', !isOpen);
}
// إغلاق القائمة عند النقر خارجها
document.addEventListener('click', (e) => {
  if (sidebar && sidebar.classList.contains('open') && 
      !sidebar.contains(e.target) && 
      e.target !== menuToggle) {
    sidebar.classList.remove('open');
    sidebar.setAttribute('aria-hidden', 'true');
  }
});

// ==============================
// 4. التنقل بين الصفحات (تبسيط شديد)
// ==============================

// دالة تنظيف المحتوى الحالي
function cleanupCurrentPage() {
  if (mainContent) {
    mainContent.innerHTML = '';
  }
  // إزالة أي مستمعات أحداث قديمة متعلقة بالألعاب إن وجدت
  window.destroyGame = null; 
}

// تحميل الصفحة الرئيسية
function loadHomePage() {
  isOnHomePage = true;
  cleanupCurrentPage();
  history.pushState({ page: 'home' }, '', location.pathname);
  
  // محاولة تحميل محتوى الصفحة الرئيسية من ملف خارجي إذا وجد
  fetch('home-content.html')
    .then(res => res.ok ? res.text() : Promise.reject())
    .then(html => {
      mainContent.innerHTML = html;
      attachStaticListeners();
      scrollToTopSmooth();
    })
    .catch(() => {
      // محتوى احتياطي في حال عدم وجود الملف
      mainContent.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
          <h1>مرحباً بك في MathLinguistic</h1>
          <p>النسخة التجريبية النظيفة.</p>
        </div>`;
      scrollToTopSmooth();
    });
}

// تحميل الصفحات الثابتة (من نحن، اتصل بنا...)function loadStaticPage(pageName) {
  isOnHomePage = false;
  cleanupCurrentPage();
  history.pushState({ page: pageName, type: 'static' }, '', `#${pageName}`);
  
  fetch(`const-page/${pageName}.html`)
    .then(response => {
      if (!response.ok) throw new Error('Page not found');
      return response.text();
    })
    .then(html => {
      mainContent.innerHTML = html;
      scrollToTopSmooth();
      attachStaticListeners();
    })
    .catch(err => {
      mainContent.innerHTML = `<p style="text-align:center; padding:20px;">عذرًا، لم نتمكن من تحميل الصفحة: ${pageName}</p>`;
      scrollToTopSmooth();
    });
}

function scrollToTopSmooth() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ربط الأحداث للعناصر الثابتة فقط
function attachStaticListeners() {
  // أزرار الصفحات الثابتة في الفوتر
  document.querySelectorAll('[data-static-page]').forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      const page = btn.dataset.staticPage;
      loadStaticPage(page);
      if (sidebar && sidebar.classList.contains('open')) toggleSidebar();
    };
  });

  // عناصر القائمة الجانبية
  document.querySelectorAll('.menu-item').forEach(item => {
    item.onclick = (e) => {
      e.preventDefault();
      const target = item.dataset.target;
      if (target === 'home') {
        loadHomePage();
      } else {
        // للمستويات الأخرى، نظهر رسالة مؤقتة لأننا حذفنا ملفات الألعاب
        isOnHomePage = false;
        cleanupCurrentPage();
        mainContent.innerHTML = `<div style="text-align:center; padding:40px;">
          <h2>${item.innerText}</h2>          <p>تم تعطيل هذا القسم مؤقتاً لأغراض الاختبار.</p>
          <button onclick="loadHomePage()" style="margin-top:20px; padding:10px 20px; cursor:pointer;">عودة للرئيسية</button>
        </div>`;
      }
      if (sidebar && sidebar.classList.contains('open')) toggleSidebar();
    };
  });
}

// زر العودة للأعلى
function handleScroll() {
  if (backToTopBtn) {
    backToTopBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
  }
}

// ==============================
// 5. إدارة Service Worker (PWA)
// ==============================
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('✅ Service Worker مسجل بنجاح:', registration.scope);
      })
      .catch(error => {
        console.error('❌ فشل تسجيل Service Worker:', error);
      });
  }
}

// ==============================
// 6. منطق تثبيت التطبيق (PWA Install)
// ==============================
function setupInstallListener() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('✅ حدث التثبيت جاهز');
    
    if (installBtn) {
      installBtn.style.display = 'flex'; // إظهار الزر
    }
  });

  window.addEventListener('appinstalled', () => {
    console.log('🎉 تم تثبيت التطبيق');
    if (installBtn) installBtn.style.display = 'none';
    deferredPrompt = null;
  });}

// دالة التثبيت عند ضغط الزر
window.installPWA = async function() {
  if (!deferredPrompt) {
    alert('عذراً، خيار التثبيت غير متاح حالياً. تأكد من استخدام HTTPS وأن المتصفح يدعم التثبيت.');
    return;
  }

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  
  if (outcome === 'accepted') {
    console.log('تم قبول التثبيت');
    if (installBtn) installBtn.style.display = 'none';
  }
  deferredPrompt = null;
};

// ==============================
// 7. التهيئة عند بدء التشغيل
// ==============================
document.addEventListener('DOMContentLoaded', () => {
  // تهيئة الثيم
  initTheme();

  // إعداد الأزرار الأساسية
  if (menuToggle) menuToggle.addEventListener('click', toggleSidebar);
  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
  if (backToTopBtn) backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  
  // الاستماع للتمرير
  window.addEventListener('scroll', handleScroll);
  handleScroll();

  // تسجيل Service Worker
  registerServiceWorker();

  // إعداد زر التثبيت
  setupInstallListener();

  // تحميل الصفحة الأولى
  loadHomePage();

  // التعامل مع زر الرجوع في المتصفح
  window.addEventListener('popstate', (event) => {
    if (event.state && event.state.page === 'home') {
      loadHomePage();
    } else if (event.state && event.state.type === 'static') {
      // نعود للصفحة الثابتة دون إضافة سجل جديد      const originalPushState = history.pushState;
      history.pushState = () => {};
      loadStaticPage(event.state.page);
      setTimeout(() => { history.pushState = originalPushState; }, 100);
    } else {
      loadHomePage();
    }
  });
});