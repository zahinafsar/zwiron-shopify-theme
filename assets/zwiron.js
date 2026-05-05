/* ZWIRON — simple, smooth animations */
(function () {
  'use strict';
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  function waitForGsap(cb, tries) {
    tries = tries || 0;
    if (window.gsap && window.ScrollTrigger) {
      window.gsap.registerPlugin(window.ScrollTrigger);
      cb();
    } else if (tries < 80) {
      setTimeout(function () { waitForGsap(cb, tries + 1); }, 50);
    }
  }

  function reveal(elements, options) {
    if (!elements || !elements.length) return;
    options = options || {};
    var y = options.y == null ? 24 : options.y;
    var stagger = options.stagger || 0;
    var duration = options.duration || 0.7;
    var ease = options.ease || 'power2.out';
    gsap.set(elements, { y: y, opacity: 0 });
    var seen = false;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !seen) {
          seen = true;
          gsap.to(elements, {
            y: 0, opacity: 1, duration: duration, ease: ease, stagger: stagger,
            clearProps: 'transform,opacity'
          });
          io.disconnect();
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });
    Array.prototype.forEach.call(elements, function (el) { io.observe(el); });
  }

  function initNav() {
    var nav = document.querySelector('.zw-nav');
    if (!nav) return;
    gsap.from(nav, { y: -20, opacity: 0, duration: 0.6, ease: 'power2.out', clearProps: 'all' });
  }

  function initHero() {
    var hero = document.querySelector('.zw-hero');
    if (!hero) return;
    var els = hero.querySelectorAll('.zw-hero__eyebrow, .zw-hero__title, .zw-hero__copy, .zw-hero__actions, .zw-hero__visual, .zw-hero__badge');
    if (!els.length) return;
    gsap.set(els, { y: 24, opacity: 0 });
    gsap.to(els, {
      y: 0, opacity: 1, duration: 0.8, ease: 'power2.out', stagger: 0.08,
      clearProps: 'transform,opacity'
    });
  }

  function initSectionHeads() {
    document.querySelectorAll('.zw-section__title, .zw-faq__intro h2').forEach(function (el) {
      reveal([el], { y: 24, duration: 0.7 });
    });
    document.querySelectorAll('.zw-section__eyebrow, .zw-section__link').forEach(function (el) {
      reveal([el], { y: 14, duration: 0.5 });
    });
  }

  function initProducts() {
    document.querySelectorAll('.zw-products').forEach(function (root) {
      var cards = root.querySelectorAll('.zw-product');
      reveal(cards, { y: 24, stagger: 0.06, duration: 0.7 });
    });
  }

  function initCollectionSearch() {
    var form = document.querySelector('[data-zw-search-form]');
    if (!form) return;
    var input = form.querySelector('[data-zw-search-input]');
    var grid = document.querySelector('[data-zw-search-grid]');
    var empty = document.querySelector('[data-zw-search-empty]');
    var pagination = document.querySelector('[data-zw-pagination]');
    if (!input || !grid) return;
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    var cards = grid.querySelectorAll('.zw-product');
    function apply() {
      var q = input.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var name = (card.querySelector('.zw-product__name') || {}).textContent || '';
        var cat = (card.querySelector('.zw-product__cat') || {}).textContent || '';
        var match = q === '' || name.toLowerCase().indexOf(q) !== -1 || cat.toLowerCase().indexOf(q) !== -1;
        card.style.display = match ? '' : 'none';
        if (match) visible++;
      });
      if (empty) empty.hidden = visible !== 0;
      if (pagination) pagination.style.display = q === '' ? '' : 'none';
    }
    var t;
    input.addEventListener('input', function () {
      clearTimeout(t);
      t = setTimeout(apply, 80);
    });
  }

  function initCollectionList() {
    document.querySelectorAll('.zw-clist-grid').forEach(function (grid) {
      var cards = grid.querySelectorAll('.zw-clist-card');
      reveal(cards, { y: 24, stagger: 0.06, duration: 0.7 });
    });
  }

  function initSocial() {
    if (!window.ScrollTrigger) return;
    document.querySelectorAll('.zw-social').forEach(function (root) {
      var track = root.querySelector('.zw-social__track');
      if (!track) return;
      var trigger;
      function build() {
        if (trigger) { trigger.kill(); trigger = null; }
        gsap.set(track, { x: 0, clearProps: 'transform' });
        var distance = track.scrollWidth - root.offsetWidth + 64;
        if (distance < 100) return;
        var tween = gsap.to(track, {
          x: function () { return -(track.scrollWidth - root.offsetWidth + 64); },
          ease: 'none',
          scrollTrigger: {
            trigger: root,
            start: 'top top',
            end: function () { return '+=' + (track.scrollWidth - root.offsetWidth + 64); },
            scrub: 1,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true
          }
        });
        trigger = tween.scrollTrigger;
      }
      build();
      window.addEventListener('load', function () {
        ScrollTrigger.refresh();
      });
      root.querySelectorAll('img').forEach(function (img) {
        if (!img.complete) {
          img.addEventListener('load', function () { ScrollTrigger.refresh(); }, { once: true });
        }
      });
      var t;
      window.addEventListener('resize', function () {
        clearTimeout(t);
        t = setTimeout(function () { ScrollTrigger.refresh(); }, 200);
      });
    });
  }

  function initLayoutRefresh() {
    if (!window.ScrollTrigger) return;
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }

  function initFaq() {
    var items = document.querySelectorAll('.zw-faq__item');
    if (items.length) reveal(items, { y: 16, stagger: 0.04, duration: 0.5 });
    items.forEach(function (item) {
      var btn = item.querySelector('.zw-faq__q');
      var panel = item.querySelector('.zw-faq__a');
      var inner = panel ? panel.firstElementChild : null;
      if (!btn || !panel || !inner) return;
      if (item.classList.contains('is-open')) gsap.set(panel, { height: 'auto' });
      else gsap.set(panel, { height: 0 });
      btn.addEventListener('click', function () {
        var isOpen = item.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', String(isOpen));
        if (isOpen) {
          gsap.fromTo(panel, { height: 0 }, {
            height: inner.offsetHeight,
            duration: 0.4, ease: 'power2.out',
            onComplete: function () { gsap.set(panel, { height: 'auto' }); }
          });
        } else {
          gsap.fromTo(panel, { height: panel.offsetHeight }, { height: 0, duration: 0.3, ease: 'power2.in' });
        }
      });
    });
  }

  function initFooter() {
    var footer = document.querySelector('.zw-footer');
    if (!footer) return;
    var els = footer.querySelectorAll('.zw-footer__brand h3, .zw-footer__brand p, .zw-footer__col, .zw-footer__bottom > *');
    reveal(els, { y: 24, duration: 0.7, stagger: 0.05 });
  }

  var Cart = {
    drawer: null,
    open: function () {
      if (!this.drawer) return;
      this.drawer.classList.add('is-open');
      this.drawer.setAttribute('aria-hidden', 'false');
      document.body.classList.add('zw-cart-open');
    },
    close: function () {
      if (!this.drawer) return;
      this.drawer.classList.remove('is-open');
      this.drawer.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('zw-cart-open');
    },
    refresh: function () {
      var self = this;
      return fetch('/?sections=zwiron-cart-drawer', { headers: { Accept: 'application/json' } })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          var html = data && data['zwiron-cart-drawer'];
          if (!html) return;
          var doc = new DOMParser().parseFromString(html, 'text/html');
          var fresh = doc.querySelector('#zwiron-cart');
          if (!fresh || !self.drawer) return;
          var wasOpen = self.drawer.classList.contains('is-open');
          self.drawer.innerHTML = fresh.innerHTML;
          if (wasOpen) self.drawer.classList.add('is-open');
          self.bindLines();
          self.updateCount();
        });
    },
    updateCount: function () {
      fetch('/cart.js', { headers: { Accept: 'application/json' } })
        .then(function (r) { return r.json(); })
        .then(function (cart) {
          document.querySelectorAll('[data-zw-cart-count]').forEach(function (el) {
            el.textContent = cart.item_count;
          });
        });
    },
    bindLines: function () {
      var self = this;
      this.drawer.querySelectorAll('[data-zw-cart-qty]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var line = btn.closest('.zw-cart-line');
          var key = btn.getAttribute('data-zw-cart-qty');
          var dir = parseInt(btn.getAttribute('data-dir'), 10);
          var valEl = line.querySelector('[data-zw-cart-qty-value]');
          var current = parseInt(valEl.textContent, 10) || 0;
          var next = Math.max(0, current + dir);
          self.change(key, next);
        });
      });
      this.drawer.querySelectorAll('[data-zw-cart-remove]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          self.change(btn.getAttribute('data-zw-cart-remove'), 0);
        });
      });
    },
    change: function (key, quantity) {
      var self = this;
      fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ id: key, quantity: quantity })
      })
        .then(function (r) { return r.json(); })
        .then(function () { self.refresh(); });
    },
    add: function (formData) {
      var self = this;
      return fetch('/cart/add.js', {
        method: 'POST',
        headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body: formData
      })
        .then(function (r) { return r.json().then(function (data) { return { ok: r.ok, data: data }; }); })
        .then(function (res) {
          if (!res.ok) throw new Error(res.data && res.data.description || 'Add to cart failed');
          return self.refresh().then(function () { self.open(); });
        });
    }
  };

  function initProductGallery() {
    var gallery = document.querySelector('[data-zw-gallery]');
    if (!gallery) return;
    var main = gallery.querySelector('[data-zw-gallery-main]');
    var img = gallery.querySelector('[data-zw-gallery-image]');
    var thumbs = gallery.querySelectorAll('[data-zw-thumb]');
    if (!main || !img) return;

    thumbs.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var src = btn.getAttribute('data-src');
        var zoom = btn.getAttribute('data-zoom');
        if (!src) return;
        img.style.opacity = '0';
        var swap = new Image();
        swap.onload = function () {
          img.src = src;
          img.setAttribute('data-zoom', zoom || src);
          img.style.opacity = '1';
        };
        swap.src = src;
        thumbs.forEach(function (t) { t.classList.remove('is-active'); });
        btn.classList.add('is-active');
      });
    });

    var zoomImg = new Image();
    var zoomLoaded = false;
    function preload() {
      var z = img.getAttribute('data-zoom');
      if (!z) return;
      zoomLoaded = false;
      zoomImg = new Image();
      zoomImg.onload = function () { zoomLoaded = true; };
      zoomImg.src = z;
    }
    preload();

    main.addEventListener('mouseenter', function () {
      preload();
      main.classList.add('is-zooming');
    });
    main.addEventListener('mousemove', function (e) {
      var rect = main.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width) * 100;
      var y = ((e.clientY - rect.top) / rect.height) * 100;
      x = Math.max(0, Math.min(100, x));
      y = Math.max(0, Math.min(100, y));
      img.style.transformOrigin = x + '% ' + y + '%';
      if (zoomLoaded && img.src !== zoomImg.src) img.src = zoomImg.src;
    });
    main.addEventListener('mouseleave', function () {
      main.classList.remove('is-zooming');
      img.style.transformOrigin = '50% 50%';
    });

    img.style.transition = 'opacity 0.2s var(--zw-ease)';
  }

  function initVariantPicker() {
    document.querySelectorAll('[data-zw-product-form]').forEach(function (form) {
      var jsonEl = form.querySelector('[data-zw-product-json]');
      var idEl = form.querySelector('[data-zw-variant-id]');
      if (!jsonEl || !idEl) return;
      var variants;
      try { variants = JSON.parse(jsonEl.textContent); } catch (e) { return; }
      function update() {
        var selected = [];
        form.querySelectorAll('[data-zw-option-input]:checked').forEach(function (input) {
          selected.push(input.value);
        });
        var match = variants.find(function (v) {
          return v.options.every(function (opt, i) { return opt === selected[i]; });
        });
        if (!match) return;
        idEl.value = match.id;
        var btn = form.querySelector('[type="submit"]');
        if (btn) {
          btn.disabled = !match.available;
          if (btn.firstChild) btn.firstChild.nodeValue = match.available ? 'Add to bag ' : 'Sold out ';
        }
        var priceEl = document.querySelector('.zw-pp__price > span');
        if (priceEl) priceEl.textContent = '$' + (match.price / 100).toFixed(2);
      }
      form.addEventListener('change', function (e) {
        if (e.target.matches('[data-zw-option-input]')) update();
      });
    });
  }

  function initCart() {
    Cart.drawer = document.getElementById('zwiron-cart');
    if (!Cart.drawer) return;
    Cart.bindLines();
    try {
      if (sessionStorage.getItem('zwOpenCart') === '1') {
        sessionStorage.removeItem('zwOpenCart');
        setTimeout(function () { Cart.open(); }, 200);
      }
    } catch (e) {}
    document.addEventListener('click', function (e) {
      var openBtn = e.target.closest('[data-zw-cart-open]');
      if (openBtn) { e.preventDefault(); Cart.open(); }
      var closeBtn = e.target.closest('[data-zw-cart-close]');
      if (closeBtn) { e.preventDefault(); Cart.close(); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && Cart.drawer.classList.contains('is-open')) Cart.close();
    });
    document.querySelectorAll('form[action*="/cart/add"]').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var btn = form.querySelector('[type="submit"]');
        var originalHTML;
        if (btn) { btn.disabled = true; originalHTML = btn.innerHTML; btn.textContent = 'Adding…'; }
        Cart.add(new FormData(form))
          .catch(function (err) { alert(err.message); })
          .finally(function () {
            if (btn) { btn.disabled = false; if (originalHTML !== undefined) btn.innerHTML = originalHTML; }
          });
      });
    });
  }

  function initNativeReveal() {
    var main = document.querySelector('main');
    if (!main) return;
    var template = main.getAttribute('data-template');
    if (template === 'index') return;
    var targets = main.querySelectorAll('h1, h2, .card, [class*="product-card"], [class*="collection-card"]');
    targets.forEach(function (el) { reveal([el], { y: 24, duration: 0.6 }); });
  }

  ready(function () {
    waitForGsap(function () {
      initNav();
      initHero();
      initSectionHeads();
      initProducts();
      initCollectionList();
      initCollectionSearch();
      initSocial();
      initFaq();
      initFooter();
      initProductGallery();
      initVariantPicker();
      initCart();
      initNativeReveal();
      initLayoutRefresh();
    });
  });
})();
