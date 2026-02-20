
// =============== //
// متغيرات عامة
// =============== //

const mainContent = document.getElementById('main-content');
const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.getElementById('sidebar-menu');
const themeToggle = document.getElementById('theme-toggle');
const backToTopBtn = document.getElementById('back-to-top');

// متغير لتتبع هل نحن في الصفحة الرئيسية أم لا
let isOnHomePage = false;

// =============== //
// 0. وظيفة المنظف (Cleanup) - النسخة الآمنة
// =============== //
function cleanupCurrentPage() {
  console.log("🧹 جاري تنظيف الصفحة...");

  if (mainContent) {
    mainContent.innerHTML = '';
  }

  if (typeof window.destroyGame === 'function') {
    window.destroyGame();
    window.destroyGame = null;
  }
  
  window.speedTestData = null;
  window.mentalMathData = null;
  window.mixedOpsData = null;
  
  console.log("✅ تم التنظيف بنجاح.");
}

// =============== //
// 1. تبديل الوضع الليلي/النهاري
// =============== //

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
  const icon = themeToggle?.querySelector('i');
  if (icon) {
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }
}

// =============== //
// 2. التحكم في القائمة الجانبية
// =============== //

function toggleSidebar() {
  if(!sidebar) return;  
  sidebar.classList.toggle('open');
  const isHidden = !sidebar.classList.contains('open');
  sidebar.setAttribute('aria-hidden', isHidden);
}

document.addEventListener('click', (e) => {
  if (sidebar && sidebar.classList.contains('open') && 
      !sidebar.contains(e.target) && 
      e.target !== menuToggle) {
    sidebar.classList.remove('open');
    sidebar.setAttribute('aria-hidden', 'true');
  }
});

// =============== //
// 3. تحميل المحتوى الديناميكي (مع تحديث المتغير)
// =============== //

function loadHomePage() {
  isOnHomePage = true; // نحن الآن في الرئيسية
  cleanupCurrentPage();
  
  // نضيف حالة الرئيسية في history
  history.pushState({ page: 'home' }, '', location.pathname);
  
  fetch('home-content.html')
    .then(res => res.text())
    .then(html => {
      mainContent.innerHTML = html;
      attachEventListeners();
      scrollToTopSmooth();
    })
    .catch(() => {
      mainContent.innerHTML = '<p>مرحباً بك في MathLinguistic! جاهز للتحدي؟</p>';
      scrollToTopSmooth();
    });
}

function loadStaticPage(pageName) {
  isOnHomePage = false; // لسنا في الرئيسية
  cleanupCurrentPage();
  
  // نضيف حالة جديدة في history قبل تحميل الصفحة
  history.pushState({ page: pageName, type: 'static' }, '', `#${pageName}`);
  
  try {
    fetch(`const-page/${pageName}.html`)
      .then(response => {
        if (!response.ok) throw new Error('Page not found');
        return response.text();
      })
      .then(html => {
        mainContent.innerHTML = html;
        scrollToTopSmooth();
        attachEventListeners();
      })
      .catch(err => {
        mainContent.innerHTML = `<p>عذرًا، لم نتمكن من تحميل الصفحة: ${pageName}</p>`;
        scrollToTopSmooth();
      });
  } catch (err) {
    mainContent.innerHTML = `<p>عذرًا، لم نتمكن من تحميل الصفحة: ${pageName}</p>`;
    scrollToTopSmooth();
  }
}

function scrollToTopSmooth() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =============== //
// 4. زر العودة إلى الأعلى
// =============== //

function handleScroll() {
  if (backToTopBtn) {
    backToTopBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
  }
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =============== //
// 5. ربط جميع الأحداث
// =============== //

function attachEventListeners() {
  document.querySelectorAll('[data-action]').forEach(btn => {
    btn.removeEventListener('click', actionHandler);
    btn.addEventListener('click', actionHandler);
  });

  document.querySelectorAll('[data-target]').forEach(card => {
    card.removeEventListener('click', targetHandler);
    card.addEventListener('click', targetHandler);
  });
  
  document.querySelectorAll('[data-static-page]').forEach(btn => {
    btn.removeEventListener('click', staticPageHandler);
    btn.addEventListener('click', staticPageHandler);
  });

  document.querySelectorAll('.menu-item').forEach(item => {
    item.removeEventListener('click', menuHandler);
    item.addEventListener('click', menuHandler);
  });
}

// =============== //
// 6. معالجات الأحداث (مع تحديث المتغير)
// =============== //

function actionHandler(e) {
  e.preventDefault();  
  const action = e.currentTarget.dataset.action;
  isOnHomePage = false; // خرجنا من الرئيسية
  cleanupCurrentPage();

  // نضيف حالة جديدة في history
  history.pushState({ page: action, type: 'dynamic' }, '', `#${action}`);

  if (action === 'speed-test') {
    if (typeof window.loadSpeedTestPage === 'function') {
      window.loadSpeedTestPage();
    } else {
      mainContent.innerHTML = '<p style="text-align:center; padding:40px;">جارٍ تحميل لعبة "اختبار السرعة"...</p>';
      setTimeout(() => {
        if (typeof window.loadSpeedTestPage === 'function') {
          window.loadSpeedTestPage();
        } else {
          mainContent.innerHTML = '<p style="text-align:center; color:#e74c3c; padding:40px;">❌ فشل تحميل اللعبة.</p>';
        }
        scrollToTopSmooth();
      }, 300);
    }
  }
  else if (action === 'mental-math') {
    if (typeof window.loadMentalMathPage === 'function') {
      window.loadMentalMathPage();
    } else {
      mainContent.innerHTML = '<p style="text-align:center; padding:40px;">جارٍ تحميل لعبة "الحساب الذهني"...</p>';
      setTimeout(() => {
        if (typeof window.loadMentalMathPage === 'function') {
          window.loadMentalMathPage();
        } else {
          mainContent.innerHTML = '<p style="text-align:center; color:#e74c3c; padding:40px;">❌ فشل تحميل لعبة الحساب الذهني.</p>';
        }
        scrollToTopSmooth();
      }, 300);
    }
  }
  else if (action === 'mixed-ops') {
    if (typeof window.loadMixedOpsPage === 'function') {
      window.loadMixedOpsPage();
    } else {
      mainContent.innerHTML = '<p style="text-align:center; padding:40px;">جارٍ تحميل لعبة "العمليات المختلطة"...</p>';
      setTimeout(() => {
        if (typeof window.loadMixedOpsPage === 'function') {
          window.loadMixedOpsPage();
        } else {
          mainContent.innerHTML = '<p style="text-align:center; color:#e74c3c; padding:40px;">❌ فشل تحميل اللعبة.</p>';
        }
        scrollToTopSmooth();
      }, 300);
    }
  } else {
    handleInteraction(action, 'dynamic');  
  }

  if (sidebar && sidebar.classList.contains('open')) sidebar.classList.remove('open');
  scrollToTopSmooth();
}

function targetHandler(e) {
  const target = e.currentTarget.dataset.target;
  handleInteraction(target, 'dynamic');
}

function staticPageHandler(e) {
  const page = e.currentTarget.dataset.staticPage;
  handleInteraction(page, 'static');
}

function menuHandler(e) {
  const target = e.currentTarget.dataset.target;
  handleInteraction(target, 'dynamic');
}

function handleInteraction(target, type = 'dynamic') {
  isOnHomePage = false; // خرجنا من الرئيسية
  cleanupCurrentPage();

  // نضيف حالة جديدة في history
  history.pushState({ page: target, type: type }, '', `#${target}`);

  if (typeof window.checkAndUnlockAchievements === 'function') {
      window.checkAndUnlockAchievements();
  }

  if (type === 'static') {
    loadStaticPage(target);
  } else {
    const functionName = 'load' + target
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('') + 'Page';
    
    if (typeof window[functionName] === 'function') {
      window[functionName]();
    } else {
      mainContent.innerHTML = `<p style="text-align:center; padding:40px;">جارٍ تحميل "${target}"... (الدالة ${functionName} غير موجودة)</p>`;
    }
  }

  if (sidebar && sidebar.classList.contains('open')) {
    sidebar.classList.remove('open');
    sidebar.setAttribute('aria-hidden', 'true');
  }
  scrollToTopSmooth();
}

// =============== //
// 7. التهيئة وزر الرجوع (الحل الجذري هنا)
// =============== //

document.addEventListener('DOMContentLoaded', () => {
  initTheme();

  if (menuToggle) menuToggle.addEventListener('click', toggleSidebar);
  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
  if (backToTopBtn) backToTopBtn.addEventListener('click', scrollToTop);

  window.addEventListener('scroll', handleScroll);
  handleScroll();

  // نضيف حالة أولية في history عند تحميل الصفحة
  history.replaceState({ page: 'home' }, '', location.pathname);
  
  loadHomePage();

  // === كود زر الرجوع المعدل ===
  window.addEventListener('popstate', function(event) {
    console.log("⬅️ زر الرجوع: تم الضغط", event.state);
    
    // التحقق من الحالة المرتبطة بالصفحة الحالية
    if (event.state) {
      if (event.state.page === 'home') {
        console.log("🏠 العودة للصفحة الرئيسية");
        // نتأكد أننا لسنا في الرئيسية قبل التحميل
        if (!isOnHomePage) {
          loadHomePage();
        }
      } else if (event.state.page) {
        console.log(`📄 العودة للصفحة: ${event.state.page}`);
        // إذا كانت الصفحة مخزنة في الحالة، نقوم بتحميلها
        if (event.state.type === 'static') {
          // نمنع إضافة history جديدة عند العودة
          const originalPushState = history.pushState;
          history.pushState = function() {};
          
          loadStaticPage(event.state.page);
          
          // نعيد الدالة الأصلية بعد التحميل
          setTimeout(() => {
            history.pushState = originalPushState;
          }, 100);
        } else {
          // للصفحات الديناميكية، نستخدم الدالة المناسبة
          const functionName = 'load' + event.state.page
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('') + 'Page';
          
          if (typeof window[functionName] === 'function') {
            // نمنع إضافة history جديدة عند العودة
            const originalPushState = history.pushState;
            history.pushState = function() {};
            
            window[functionName]();
            
            // نعيد الدالة الأصلية بعد التحميل
            setTimeout(() => {
              history.pushState = originalPushState;
            }, 100);
          }
        }
      }
    } else {
      // إذا لم تكن هناك حالة (عند العودة من خارج التطبيق)
      // نتأكد أننا في الصفحة الرئيسية
      if (!isOnHomePage) {
        console.log("🏠 لا توجد حالة، العودة للرئيسية");
        loadHomePage();
      }
    }
  });
});

// =============== //
// 8. دعم PWA والعمل بدون إنترنت
// =============== //

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        registerServiceWorker();
        checkForUpdates();
    });
}

async function registerServiceWorker() {
    try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('✅ Service Worker مسجل:', registration.scope);

        registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            console.log('🔄 تحديث جديد متاح');
            
            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    showUpdateNotification();
                }
            });
        });

        setInterval(() => {
            registration.update();
        }, 60 * 60 * 1000);

    } catch (error) {
        console.error('❌ فشل تسجيل Service Worker:', error);
    }
}

function showUpdateNotification() {
    const oldNotification = document.querySelector('.update-notification');
    if (oldNotification) oldNotification.remove();

    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
        <div style="position: fixed; bottom: 20px; left: 20px; background: #3498db; color: white; padding: 15px 25px; border-radius: 50px; box-shadow: 0 5px 20px rgba(0,0,0,0.2); z-index: 9999; animation: slideInLeft 0.3s; display: flex; align-items: center; gap: 15px;">
            <span>🔄 يتوفر تحديث جديد للتطبيق</span>
            <button onclick="window.updateApp()" style="background: white; color: #3498db; border: none; padding: 8px 20px; border-radius: 50px; cursor: pointer; font-weight: bold; font-size: 14px;">تحديث الآن</button>
        </div>
    `;
    document.body.appendChild(notification);

    if (!document.querySelector('#update-animation')) {
        const style = document.createElement('style');
        style.id = 'update-animation';
        style.textContent = `
            @keyframes slideInLeft {
                from { transform: translateX(-100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    setTimeout(() => {
        if (notification.parentNode) notification.remove();
    }, 10000);
}

window.updateApp = function() {
    if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
        const loadingMsg = document.createElement('div');
        loadingMsg.style.cssText = 'position:fixed; top:0; left:0; right:0; background:#27ae60; color:white; text-align:center; padding:15px; z-index:10000; font-weight:bold;';
        loadingMsg.textContent = 'جاري تحديث التطبيق وإعادة التحميل...';
        document.body.appendChild(loadingMsg);
        
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }
};

window.addEventListener('online', updateConnectionStatus);
window.addEventListener('offline', updateConnectionStatus);

function updateConnectionStatus() {
    const isOnline = navigator.onLine;
    if(document.body) document.body.classList.toggle('offline-mode', !isOnline);
    
    if (!isOnline) {
        showOfflineToast();
        loadOfflineExercises();
    } else {
        syncOfflineData();
        hideOfflineIndicators();
    }
}

function showOfflineToast() {
    const oldToast = document.querySelector('.offline-toast');
    if (oldToast) oldToast.remove();

    const toast = document.createElement('div');
    toast.className = 'offline-toast';
    toast.innerHTML = `
        <div style="position: fixed; top: 70px; left: 50%; transform: translateX(-50%); background: #f39c12; color: white; padding: 10px 25px; border-radius: 50px; z-index: 9998; box-shadow: 0 5px 15px rgba(0,0,0,0.2); font-weight: bold; animation: fadeInDown 0.3s;">
            ⚠️ وضع عدم الاتصال - التغييرات ستحفظ محلياً
        </div>
    `;
    document.body.appendChild(toast);

    if (!document.querySelector('#toast-animation')) {
        const style = document.createElement('style');
        style.id = 'toast-animation';
        style.textContent = `
            @keyframes fadeInDown {
                from { transform: translate(-50%, -100%); opacity: 0; }
                to { transform: translate(-50%, 0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    setTimeout(() => {
        if (toast.parentNode) toast.remove();
    }, 5000);
}

function hideOfflineIndicators() {
    document.querySelectorAll('.offline-toast').forEach(toast => toast.remove());
}

window.saveAchievement = function(achievement) {
    if (typeof window.originalSaveAchievement === 'function') {
        window.originalSaveAchievement(achievement);
    }
    
    const achievements = JSON.parse(localStorage.getItem('offlineAchievements') || '[]');
    achievements.push({ ...achievement, timestamp: Date.now() });
    localStorage.setItem('offlineAchievements', JSON.stringify(achievements));
    
    if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
            type: 'SAVE_ACHIEVEMENT',
            achievement: achievement
        });
    }
};

async function syncOfflineData() {
    const offlineAchievements = JSON.parse(localStorage.getItem('offlineAchievements') || '[]');
    
    if (offlineAchievements.length > 0 && navigator.onLine) {
        console.log('🔄 مزامنة الإنجازات:', offlineAchievements.length);
        try {
            await fetch('/api/sync-achievements', { method: 'POST', body: JSON.stringify(offlineAchievements) });
            localStorage.removeItem('offlineAchievements');
            
            if ('serviceWorker' in navigator && 'SyncManager' in window) {
                const registration = await navigator.serviceWorker.ready;
                await registration.sync.register('sync-achievements');
            }
            showSyncSuccessMessage(offlineAchievements.length);
        } catch (e) {
            console.error("فشلت المزامنة", e);
        }
    }
}

function showSyncSuccessMessage(count) {
    const msg = document.createElement('div');
    msg.style.cssText = 'position:fixed; bottom:20px; right:20px; background:#27ae60; color:white; padding:15px 25px; border-radius:50px; z-index:9999; box-shadow:0 5px 15px rgba(0,0,0,0.2); animation:slideIn 0.3s;';
    msg.textContent = `✅ تمت مزامنة ${count} إنجاز بنجاح`;
    document.body.appendChild(msg);
    
    setTimeout(() => { if (msg.parentNode) msg.remove(); }, 3000);
}

function loadOfflineExercises() {
    const levels = [
        { name: 'beginner', display: 'المبتدئ' },
        { name: 'intermediate', display: 'المتوسط' },
        { name: 'advanced', display: 'المتقدم' },
        { name: 'complex', display: 'المعقد' }
    ];
    levels.forEach(level => {
        if (localStorage.getItem(`exercises_${level.name}`)) {
            console.log(`📚 تم تحميل تمارين ${level.display} من الذاكرة المحلية`);
        }
    });
}

function checkForUpdates() {
    if (navigator.onLine) {
        fetch('/version.json')
            .then(response => response.json())
            .then(data => {
                const currentVersion = localStorage.getItem('appVersion');
                if (currentVersion !== data.version) {
                    console.log('🔄 إصدار جديد متاح:', data.version);
                    localStorage.setItem('appVersion', data.version);
                    if (currentVersion && shouldShowUpdateNotification(currentVersion, data.version)) {
                        showUpdateNotification();
                    }
                }
            })
            .catch(() => console.log('لا يمكن التحقق من التحديثات'));
    }
}

function shouldShowUpdateNotification(oldVersion, newVersion) {
    const oldMajor = oldVersion.split('.')[0];
    const newMajor = newVersion.split('.')[0];
    return oldMajor !== newMajor;
}

let installPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    installPrompt = e;
    showInstallButton();
});

function showInstallButton() {
    let installButton = document.getElementById('install-app');
    
    if (!installButton) {
        installButton = document.createElement('button');
        installButton.id = 'install-app';
        installButton.innerHTML = '📱 تثبيت التطبيق';
        installButton.style.cssText = 'position:fixed; bottom:20px; right:20px; background:#3498db; color:white; border:none; padding:12px 24px; border-radius:50px; cursor:pointer; box-shadow:0 5px 15px rgba(0,0,0,0.2); z-index:9999; font-weight:bold; border:2px solid white; display:none;';
        document.body.appendChild(installButton);
    }
    
    installButton.style.display = 'block';
    installButton.onclick = async () => {
        if (!installPrompt) return;
        
        installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('✅ تم تثبيت التطبيق');
            installButton.style.display = 'none';
        }
        installPrompt = null;
    };
}

function saveVisitedLevel(levelName) {
    const visitedLevels = JSON.parse(localStorage.getItem('visitedLevels') || '[]');
    if (!visitedLevels.includes(levelName)) {
        visitedLevels.push(levelName);
        localStorage.setItem('visitedLevels', JSON.stringify(visitedLevels));
    }
}

function getVisitedLevels() {
    return JSON.parse(localStorage.getItem('visitedLevels') || '[]');
}

// =============== //
// 9. تثبيت التطبيق (PWA)
// =============== //

// =============== //
// نظام تثبيت PWA المحسن - يعمل على localhost
// =============== //

let deferredPrompt;
const installBtn = document.getElementById('install-pwa-btn');

// التحقق من البيئة
const isLocalhost = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1';
const isHttps = window.location.protocol === 'https:';

console.log('📱 بيئة التشغيل:', { isLocalhost, isHttps });

// 1. الاستماع لحدث التثبيت الحقيقي
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log('✅ beforeinstallprompt: تم التقاط حدث التثبيت');
  
  if (installBtn) {
    installBtn.style.display = 'flex';
    installBtn.title = 'انقر لتثبيت التطبيق';
  }
});

// 2. دالة التثبيت الرئيسية
window.installPWA = async function() {
  console.log('🔄 محاولة التثبيت...');
  
  // الحالة 1: لدينا حدث تثبيت حقيقي
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('✅ تم التثبيت بنجاح');
      if (installBtn) installBtn.style.display = 'none';
    }
    deferredPrompt = null;
    return;
  }
  
  // الحالة 2: نحن على localhost - نشرح للمستخدم كيفية التثبيت الفعلي
  if (isLocalhost) {
    alert('📱 **وضع التطوير المحلي**\n\n' +
          'للتثبيت الفعلي:\n\n' +
          '1️⃣ استخدم متصفح **Microsoft Edge** - يدعم التثبيت على localhost\n' +
          '2️⃣ أو استخدم **ngrok** لإنشاء رابط HTTPS مؤقت:\n' +
          '   npx ngrok http 7700\n' +
          '3️⃣ أو ارفع الموقع على **GitHub Pages**:\n' +
          '   https://abdmou191.github.io/MathLinguistic/\n\n' +
          '👉 في Edge، اضغط على النقاط الثلاث واختر "تثبيت"');
    return;
  }
  
  // الحالة 3: مشكلة أخرى
  alert('❌ التثبيت غير متاح حالياً\n' +
        'تأكد من:\n' +
        '- استخدام HTTPS\n' +
        '- تحديث الصفحة (F5)\n' +
        '- استخدام Chrome أو Edge');
};

// 3. عند اكتمال التثبيت
window.addEventListener('appinstalled', () => {
  console.log('🎉 تم تثبيت التطبيق!');
  if (installBtn) installBtn.style.display = 'none';
  localStorage.setItem('appInstalled', 'true');
});

// 4. فحص الحالة عند التحميل
window.addEventListener('load', () => {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  
  if (isStandalone) {
    console.log('📱 التطبيق يعمل في وضع مستقل');
    if (installBtn) installBtn.style.display = 'none';
  } else {
    // على localhost، نظهر الزر مع رسالة توضيحية
    if (isLocalhost) {
      setTimeout(() => {
        if (installBtn) {
          installBtn.style.display = 'flex';
          installBtn.title = 'التثبيت متاح على Edge أو HTTPS';
          
          // نغير لون الزر للتنبيه
          installBtn.style.background = '#f39c12';
          installBtn.style.animation = 'pulse 2s infinite';
        }
      }, 2000);
    }
  }
});

// 5. للاختبار - فحص manifest
fetch('manifest.json')
  .then(r => r.json())
  .then(data => console.log('✅ manifest.json محمل:', data.short_name))
  .catch(err => console.error('❌ manifest.json خطأ:', err));
