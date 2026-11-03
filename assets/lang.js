/* Language switch (English / Tamil). Runs early so the page does not flash in the wrong language. */
(function () {
  /* Load web fonts in the background so a slow font server never keeps the page blank. */
  try {
    var fl = document.createElement('link');
    fl.rel = 'stylesheet';
    fl.href = 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&family=Noto+Sans+Tamil:wght@500;700&display=swap';
    document.head.appendChild(fl);
  } catch (e) { }
  var KEY = 'seva-lang';
  function get() { try { var v = localStorage.getItem(KEY); if (v === 'ta' || v === 'en') return v; } catch (e) { } return 'en'; }
  function apply(l) {
    var root = document.documentElement;
    root.setAttribute('data-lang', l);
    root.setAttribute('lang', l === 'ta' ? 'ta' : 'en');
    document.querySelectorAll('[data-en][data-ta]').forEach(function (el) { el.textContent = el.getAttribute('data-' + l); });
    document.querySelectorAll('[data-ph-en]').forEach(function (el) { el.setAttribute('placeholder', el.getAttribute('data-ph-' + l)); });
    document.querySelectorAll('[data-set-lang]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-set-lang') === l ? 'true' : 'false'); });
    document.dispatchEvent(new Event('langchange'));
  }
  document.documentElement.setAttribute('data-lang', get());
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-set-lang]').forEach(function (b) {
      b.addEventListener('click', function () { var l = b.getAttribute('data-set-lang'); try { localStorage.setItem(KEY, l); } catch (e) { } apply(l); });
    });
    apply(get());
  });
})();
