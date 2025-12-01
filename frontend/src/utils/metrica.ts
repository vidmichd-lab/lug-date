/**
 * Yandex Metrica integration
 * Analytics and event tracking
 */

declare global {
  interface Window {
    ym?: (counterId: number, method: string, target: string, params?: any) => void;
  }
}

// Yandex AppMetrica ID
// Set in .env file as VITE_YANDEX_METRICA_ID=4809916
const METRICA_ID = import.meta.env.VITE_YANDEX_METRICA_ID;

/**
 * Initialize Yandex Metrica
 */
export function initMetrica() {
  if (!METRICA_ID || typeof window === 'undefined') {
    return;
  }

  // Load Yandex Metrica script
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.innerHTML = `
    (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
    m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
    (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
    ym(${METRICA_ID}, "init", {
      clickmap:true,
      trackLinks:true,
      accurateTrackBounce:true,
      webvisor:true
    });
  `;
  document.head.appendChild(script);

  // Add noscript fallback
  const noscript = document.createElement('noscript');
  noscript.innerHTML = `<div><img src="https://mc.yandex.ru/watch/${METRICA_ID}" style="position:absolute; left:-9999px;" alt="" /></div>`;
  document.body.appendChild(noscript);

  console.log('✅ Yandex Metrica initialized');
}

/**
 * Track page view
 */
export function trackPageView(url: string, title?: string) {
  if (!METRICA_ID || !window.ym) return;
  
  window.ym(Number(METRICA_ID), 'hit', url, {
    title: title || document.title,
  });
}

/**
 * Track event
 */
export function trackEvent(category: string, action: string, label?: string, value?: number) {
  if (!METRICA_ID || !window.ym) return;
  
  window.ym(Number(METRICA_ID), 'reachGoal', `${category}_${action}`, {
    label,
    value,
  });
}

/**
 * Track user action
 */
export function trackUserAction(action: string, params?: Record<string, any>) {
  if (!METRICA_ID || !window.ym) return;
  
  window.ym(Number(METRICA_ID), 'reachGoal', action, params);
}

/**
 * Track match creation
 */
export function trackMatch(matchId: string, eventId?: string) {
  trackEvent('match', 'created', matchId, eventId ? 1 : 0);
}

/**
 * Track like
 */
export function trackLike(targetUserId: string, eventId?: string) {
  trackEvent('like', 'given', targetUserId, eventId ? 1 : 0);
}

/**
 * Track photo upload
 */
export function trackPhotoUpload(success: boolean) {
  trackEvent('photo', success ? 'upload_success' : 'upload_failed');
}

/**
 * Track profile view
 */
export function trackProfileView(userId: string) {
  trackEvent('profile', 'viewed', userId);
}

