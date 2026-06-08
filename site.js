/* ============================================================
   Joshua Scott / site behavior
   ============================================================ */
(function () {
  // year
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // nav border on scroll
  var nav = document.getElementById('nav');
  function onScroll() {
    if (window.scrollY > 8) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // reveal on scroll
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(function (el, i) {
    // stagger a touch within groups
    el.style.transitionDelay = (Math.min(i % 4, 3) * 60) + 'ms';
    io.observe(el);
  });

  function revealize(el, i) {
    el.classList.add('reveal');
    el.style.transitionDelay = (Math.min(i % 4, 3) * 60) + 'ms';
    io.observe(el);
  }

  // ---------- experience ----------
  // Content lives in experience.json. Each entry is one company/era:
  //   { "years", "org", "place", "role", "summary", "highlights": [...] }
  // For a company with several stacked titles, use "roles" instead of "role":
  //   "roles": [ { "title": "...", "years": "2017–2020" }, ... ]
  // For a grouped "earlier roles" block, use "roles_grid":
  //   "roles_grid": [ { "role": "...", "org": "...", "context": "..." }, ... ]
  var ARROW_SM = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M17 7H8M17 7v9" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function buildXpRow(d) {
    var row = el('div', 'xp__row');

    var meta = el('div', 'xp__meta');
    meta.appendChild(el('span', 'xp__years', d.years || ''));
    meta.appendChild(el('span', 'xp__org', d.org || ''));
    if (d.place) meta.appendChild(el('span', 'xp__place', d.place));
    row.appendChild(meta);

    var body = el('div', 'xp__body');

    // stacked titles
    if (Array.isArray(d.roles) && d.roles.length) {
      var rl = el('ul', 'xp__roles');
      d.roles.forEach(function (r) {
        var li = el('li', null, (r.title || '') + ' ');
        if (r.years) li.appendChild(el('span', null, r.years));
        rl.appendChild(li);
      });
      body.appendChild(rl);
    } else if (d.role) {
      body.appendChild(el('div', 'role', d.role));
    }

    if (d.summary) body.appendChild(el('p', null, d.summary));

    if (Array.isArray(d.highlights) && d.highlights.length) {
      var wins = el('ul', 'xp__wins');
      d.highlights.forEach(function (h) { wins.appendChild(el('li', null, h)); });
      body.appendChild(wins);
    }

    if (Array.isArray(d.roles_grid) && d.roles_grid.length) {
      var grid = el('div', 'prior');
      d.roles_grid.forEach(function (p) {
        var item = el('div', 'prior__item');
        item.appendChild(el('div', 'r', p.role || ''));
        item.appendChild(el('div', 'c', p.org || ''));
        if (p.context) item.appendChild(el('div', 'ctx', p.context));
        grid.appendChild(item);
      });
      body.appendChild(grid);
    }

    row.appendChild(body);
    return row;
  }

  var xpList = document.getElementById('xpList');
  if (xpList) {
    fetch('experience.json', { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (items) {
        if (!Array.isArray(items)) throw new Error('experience.json should be an array');
        xpList.innerHTML = '';
        items.forEach(function (d, i) {
          var row = buildXpRow(d);
          xpList.appendChild(row);
          revealize(row, i);
        });
      })
      .catch(function (err) {
        console.warn('Could not load experience.json:', err.message);
        xpList.innerHTML = '<p style="color:var(--ink-3);font-size:15px;">Experience is loading from experience.json. If you are opening this file directly, view it through a local web server or your live site.</p>';
      });
  }

  // ---------- projects ----------
  // Content lives in projects.json. Each item:
  //   { "name": "...", "tag": "...", "description": "...", "url": "..." }
  // "tag" is an optional short label. Items render in file order.
  function initials(name) {
    return (name || '').trim().split(/\s+/).slice(0, 2)
      .map(function (w) { return w.charAt(0); }).join('').toUpperCase();
  }

  function buildProjectCard(p) {
    var a = el('a', 'project-card');
    a.href = p.url || '#';
    a.target = '_blank';
    a.rel = 'noopener';

    a.appendChild(el('span', 'project-card__mark', initials(p.name)));

    var body = el('div', 'project-card__body');
    var top = el('div', 'project-card__top');
    top.appendChild(el('h3', null, p.name || ''));
    if (p.tag) top.appendChild(el('span', 'project-card__tag', p.tag));
    body.appendChild(top);
    if (p.description) body.appendChild(el('p', null, p.description));
    a.appendChild(body);

    var arrow = el('span', 'project-card__arrow');
    arrow.innerHTML = ARROW_SM;
    a.appendChild(arrow);
    return a;
  }

  var projectsList = document.getElementById('projectsList');
  if (projectsList) {
    fetch('projects.json', { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (items) {
        if (!Array.isArray(items)) throw new Error('projects.json should be an array');
        projectsList.innerHTML = '';
        items.forEach(function (p, i) {
          var card = buildProjectCard(p);
          projectsList.appendChild(card);
          revealize(card, i);
        });
      })
      .catch(function (err) {
        console.warn('Could not load projects.json:', err.message);
        projectsList.innerHTML = '<p style="color:var(--ink-3);font-size:15px;">Projects are loading from projects.json. If you are opening this file directly, view it through a local web server or your live site.</p>';
      });
  }

  // ---------- media ----------
  // Content lives in media.json. To add an appearance, add an object there.
  // Each item: { "type": "podcast" | "article" | "video", "title": "...", "outlet": "...", "url": "..." }
  // Items render in the order they appear in the file (newest first is a good habit).
  var LABEL = { podcast: 'Podcast', article: 'Article', video: 'Video' };
  var ARROW = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M17 7H8M17 7v9" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var grid = document.getElementById('mediaGrid');
  var filters = document.getElementById('mediaFilters');

  function buildCard(m) {
    var a = document.createElement('a');
    a.className = 'media-card';
    a.setAttribute('data-k', m.type);
    a.href = m.url || '#';
    a.target = '_blank';
    a.rel = 'noopener';

    var top = document.createElement('div');
    top.className = 'media-card__top';
    var type = document.createElement('span');
    type.className = 'media-card__type';
    type.textContent = LABEL[m.type] || m.type || '';
    var arrow = document.createElement('span');
    arrow.className = 'media-card__arrow';
    arrow.innerHTML = ARROW;
    top.appendChild(type);
    top.appendChild(arrow);

    var body = document.createElement('div');
    var h3 = document.createElement('h3');
    h3.textContent = m.title || '';
    var outlet = document.createElement('div');
    outlet.className = 'media-card__outlet';
    outlet.style.marginTop = '8px';
    outlet.textContent = m.outlet || '';
    body.appendChild(h3);
    body.appendChild(outlet);

    a.appendChild(top);
    a.appendChild(body);
    return a;
  }

  function renderMedia(items) {
    if (!grid) return;
    grid.innerHTML = '';
    items.forEach(function (m) { grid.appendChild(buildCard(m)); });
  }

  function setupFilters() {
    if (!filters || !grid) return;
    filters.addEventListener('click', function (e) {
      var btn = e.target.closest('.chip');
      if (!btn) return;
      filters.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('active'); });
      btn.classList.add('active');
      var f = btn.getAttribute('data-filter');
      grid.querySelectorAll('.media-card').forEach(function (card) {
        var show = (f === 'all') || (card.getAttribute('data-k') === f);
        card.classList.toggle('hide', !show);
      });
    });
  }

  fetch('media.json', { cache: 'no-cache' })
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function (items) {
      if (!Array.isArray(items)) throw new Error('media.json should be an array');
      renderMedia(items);
      setupFilters();
    })
    .catch(function (err) {
      console.warn('Could not load media.json:', err.message);
      if (grid) {
        grid.innerHTML = '<p style="color:var(--ink-3);font-size:15px;">Media list is loading from media.json. If you are opening this file directly, view it through a local web server (e.g. <code>python3 -m http.server</code>) or your live site.</p>';
      }
    });
})();
