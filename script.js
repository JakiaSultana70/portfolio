(function () {
  var root = document.documentElement;

  var img = document.getElementById('profileImg');
  var fallback = document.getElementById('profileFallback');
  function showFallback() { img.hidden = true; fallback.hidden = false; }
  if (img.complete && img.naturalWidth === 0) showFallback();
  img.addEventListener('error', showFallback);

  var btn = document.getElementById('menuBtn');
  var list = document.getElementById('navList');
  function setMenu(open) {
    list.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
  }
  btn.addEventListener('click', function () { setMenu(!list.classList.contains('open')); });
  list.addEventListener('click', function (e) { if (e.target.tagName === 'A') setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  var themeBtn = document.getElementById('themeBtn');
  function isDark() {
    var t = root.getAttribute('data-theme');
    return t ? t === 'dark' : !matchMedia('(prefers-color-scheme: light)').matches;
  }
  function syncThemeBtn() {
    var dark = isDark();
    themeBtn.setAttribute('aria-pressed', String(dark));
    themeBtn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  }
  themeBtn.addEventListener('click', function () {
    var next = isDark() ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    syncThemeBtn();
  });
  syncThemeBtn();

  var copyBtn = document.getElementById('copyBtn');
  var copyStatus = document.getElementById('copyStatus');
  copyBtn.addEventListener('click', function () {
    var email = copyBtn.getAttribute('data-email');
    var done = function (ok) {
      copyBtn.textContent = ok ? 'Copied' : 'Copy failed';
      copyStatus.textContent = ok ? 'Email address copied' : 'Could not copy. Select the address above.';
      setTimeout(function () { copyBtn.textContent = 'Copy address'; }, 2000);
    };
    var settled = false;
    function finish(ok) { if (!settled) { settled = true; done(ok); } }
    function legacyCopy() {
      var ta = document.createElement('textarea');
      ta.value = email;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
      return ok;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(function () { finish(true); }, function () { finish(legacyCopy()); });
      setTimeout(function () { if (!settled) finish(legacyCopy()); }, 1500);
    } else { finish(legacyCopy()); }
  });

  document.getElementById('year').textContent = new Date().getFullYear();

  if ('IntersectionObserver' in window) {
    var links = Array.prototype.slice.call(list.querySelectorAll('a'));
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (a) {
            a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id);
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    document.querySelectorAll('main section[id]').forEach(function (s) { spy.observe(s); });

    window.addEventListener('scroll', function () {
      if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) {
        links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#contact'); });
      }
    }, { passive: true });

    var reveal = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); reveal.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.card, .project, .skill-group, .timeline li, .training').forEach(function (el) { reveal.observe(el); });
  } else {
    root.classList.remove('js');
  }
})();
