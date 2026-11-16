(function () {
  'use strict';

  var main = document.querySelector('main');
  if (!main) return;

  var headings = Array.prototype.slice.call(main.querySelectorAll('h1, h2'))
    .filter(function (heading) {
      return heading.textContent.trim();
    });
  var footer = document.querySelector('footer.site-footer');

  if (footer) {
    headings.push(footer);
  }

  if (!headings.length) return;

  var widget = document.createElement('div');
  widget.className = 'floating-index';
  widget.innerHTML =
    '<button class="floating-index__toggle" type="button" aria-expanded="false">' +
      '<span class="floating-index__icon" aria-hidden="true">≡</span>' +
      '<span>ÍNDICE</span>' +
      '<span class="floating-index__count"></span>' +
    '</button>' +
    '<section class="floating-index__panel" id="floating-index-panel" aria-label="Índice da página" hidden>' +
      '<div class="floating-index__header">' +
        '<span>NAVEGAÇÃO // TÓPICOS</span>' +
        '<button class="floating-index__close" type="button" aria-label="Fechar índice">×</button>' +
      '</div>' +
      '<nav class="floating-index__nav" aria-label="Tópicos desta página"></nav>' +
    '</section>';
  document.body.appendChild(widget);

  var toggle = widget.querySelector('.floating-index__toggle');
  var panel = widget.querySelector('.floating-index__panel');
  var closeButton = widget.querySelector('.floating-index__close');
  var nav = widget.querySelector('.floating-index__nav');
  var count = widget.querySelector('.floating-index__count');
  var links = [];
  var usedIds = {};

  function makeId(text, index) {
    var base = text.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'topico';
    var id = base;
    var suffix = 2;

    while (usedIds[id] || (document.getElementById(id) && document.getElementById(id) !== headings[index])) {
      id = base + '-' + suffix;
      suffix += 1;
    }

    usedIds[id] = true;
    return id;
  }

  headings.forEach(function (heading, index) {
    var label;
    var target = heading;

    if (heading === footer) {
      label = 'Contato';
      target = footer;
    } else if (heading.classList.contains('hero-title')) {
      label = 'Início';
    } else {
      label = heading.textContent.replace(/\s+/g, ' ').trim();
      if (!heading.id) heading.id = makeId(label, index);
      usedIds[heading.id] = true;
    }

    var link = document.createElement('a');
    link.className = 'floating-index__link';
    link.href = '#' + target.id;

    var number = document.createElement('span');
    number.className = 'floating-index__number';
    number.setAttribute('aria-hidden', 'true');
    number.textContent = String(index + 1).padStart(2, '0');

    var text = document.createElement('span');
    text.textContent = label;

    link.appendChild(number);
    link.appendChild(text);
    nav.appendChild(link);
    links.push({ heading: target, link: link });

    link.addEventListener('click', closePanel);
  });

  count.textContent = String(headings.length).padStart(2, '0');
  toggle.setAttribute('aria-controls', panel.id);

  if (!links.length) {
    nav.innerHTML = '<p class="floating-index__empty">Nenhum tópico disponível.</p>';
  }

  function openPanel() {
    panel.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Fechar índice de tópicos');
  }

  function closePanel() {
    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir índice de tópicos');
  }

  toggle.setAttribute('aria-label', 'Abrir índice de tópicos');
  toggle.addEventListener('click', function () {
    if (panel.hidden) {
      openPanel();
    } else {
      closePanel();
    }
  });
  closeButton.addEventListener('click', closePanel);

  document.addEventListener('click', function (event) {
    if (!panel.hidden && !widget.contains(event.target)) closePanel();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !panel.hidden) {
      closePanel();
      toggle.focus();
    }
  });

  function setCurrent(heading) {
    links.forEach(function (item) {
      if (item.heading === heading) {
        item.link.setAttribute('aria-current', 'location');
      } else {
        item.link.removeAttribute('aria-current');
      }
    });
  }

  setCurrent(links[0].heading);

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      var visible = entries.filter(function (entry) {
        return entry.isIntersecting;
      }).sort(function (a, b) {
        return a.boundingClientRect.top - b.boundingClientRect.top;
      });

      if (visible.length) setCurrent(visible[0].target);
    }, { rootMargin: '-12% 0px -72% 0px', threshold: 0 });

    links.forEach(function (item) {
      observer.observe(item.heading);
    });
  }

  if (footer && 'IntersectionObserver' in window) {
    var footerObserver = new IntersectionObserver(function (entries) {
      widget.classList.toggle('is-footer-visible', entries[0].isIntersecting);
      if (entries[0].isIntersecting && !panel.hidden) closePanel();
    }, { threshold: 0 });

    footerObserver.observe(footer);
  }
})();
