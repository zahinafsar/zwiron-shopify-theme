/* ZWIRON GSAP animations */
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

  function splitWords(el) {
    if (!el || el.dataset.zwSplit) return;
    var html = el.innerHTML;
    var lines = el.querySelectorAll('.zw-line');
    if (lines.length) {
      lines.forEach(function (line) {
        var inner = line.innerHTML;
        line.innerHTML = '<span>' + inner + '</span>';
      });
    }
    el.dataset.zwSplit = '1';
  }

  function initNav() {
    var nav = document.querySelector('.zw-nav');
    if (!nav) return;
    gsap.from(nav, { y: -80, opacity: 0, duration: 0.9, ease: 'power3.out', delay: 0.1, clearProps: 'transform,opacity' });
    var lastY = 0;
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      if (y > 80 && y > lastY) nav.classList.add('zw-nav--hidden');
      else nav.classList.remove('zw-nav--hidden');
      lastY = y;
    }, { passive: true });
  }

  function initHero() {
    var hero = document.querySelector('.zw-hero');
    if (!hero) return;
    var title = hero.querySelector('.zw-hero__title');
    if (title) splitWords(title);
    var lines = hero.querySelectorAll('.zw-hero__title .zw-line > span');
    var tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.from(hero.querySelector('.zw-hero__eyebrow'), { y: 30, opacity: 0, duration: 0.7 }, 0.1)
      .from(lines, { yPercent: 110, duration: 1, stagger: 0.08 }, 0.2)
      .from(hero.querySelector('.zw-hero__copy'), { y: 30, opacity: 0, duration: 0.7 }, 0.5)
      .from(hero.querySelectorAll('.zw-hero__actions > *'), { y: 20, opacity: 0, duration: 0.6, stagger: 0.08 }, 0.7)
      .from(hero.querySelector('.zw-hero__visual'), { y: 60, scale: 0.94, opacity: 0, duration: 1.1 }, 0.3)
      .from(hero.querySelector('.zw-hero__badge'), { y: 20, opacity: 0, duration: 0.6 }, 0.9);

    var visual = hero.querySelector('.zw-hero__visual');
    if (visual) {
      gsap.to(visual, {
        y: -80,
        ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1 }
      });
    }
  }

  function initSectionHeads() {
    document.querySelectorAll('.zw-section__title, .zw-faq__intro h2').forEach(function (el) {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 85%' },
        y: 60, opacity: 0, duration: 1, ease: 'power3.out'
      });
    });
    document.querySelectorAll('.zw-section__eyebrow, .zw-section__link').forEach(function (el) {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 90%' },
        y: 20, opacity: 0, duration: 0.6, ease: 'power2.out'
      });
    });
  }

  function initProducts() {
    document.querySelectorAll('.zw-products').forEach(function (root) {
      var cards = root.querySelectorAll('.zw-product');
      gsap.from(cards, {
        scrollTrigger: { trigger: root, start: 'top 75%' },
        y: 80, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08
      });
    });
  }

  function initSocial() {
    document.querySelectorAll('.zw-social').forEach(function (root) {
      var track = root.querySelector('.zw-social__track');
      if (!track) return;
      var st;
      function build() {
        if (st) { st.kill(); }
        gsap.set(track, { x: 0 });
        var totalWidth = track.scrollWidth;
        var viewport = root.offsetWidth;
        var distance = totalWidth - viewport + 64;
        if (distance < 100) return;
        var tween = gsap.to(track, {
          x: -distance,
          ease: 'none',
          scrollTrigger: {
            trigger: root,
            start: 'top top',
            end: '+=' + distance,
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true
          }
        });
        st = tween.scrollTrigger;
      }
      build();
      var resizeTimer;
      window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(build, 200);
      });
    });
  }

  function refreshOnLoad() {
    if (!window.ScrollTrigger) return;
    var imgs = document.querySelectorAll('img');
    var pending = 0;
    imgs.forEach(function (img) {
      if (!img.complete) {
        pending++;
        img.addEventListener('load', done, { once: true });
        img.addEventListener('error', done, { once: true });
      }
    });
    function done() {
      pending--;
      if (pending <= 0) ScrollTrigger.refresh();
    }
    if (pending === 0) ScrollTrigger.refresh();
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }

  function initFaq() {
    document.querySelectorAll('.zw-faq__item').forEach(function (item, i) {
      var btn = item.querySelector('.zw-faq__q');
      var panel = item.querySelector('.zw-faq__a');
      var inner = panel ? panel.firstElementChild : null;
      if (!btn || !panel || !inner) return;

      gsap.from(item, {
        scrollTrigger: { trigger: item, start: 'top 90%' },
        y: 30, opacity: 0, duration: 0.6, delay: i * 0.04, ease: 'power2.out'
      });

      // initial open state
      if (item.classList.contains('is-open')) {
        gsap.set(panel, { height: 'auto' });
      } else {
        gsap.set(panel, { height: 0 });
      }

      btn.addEventListener('click', function () {
        var isOpen = item.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', String(isOpen));
        if (isOpen) {
          gsap.fromTo(panel, { height: 0 }, {
            height: inner.offsetHeight,
            duration: 0.5, ease: 'power3.out',
            onComplete: function () { gsap.set(panel, { height: 'auto' }); }
          });
        } else {
          gsap.fromTo(panel, { height: panel.offsetHeight }, {
            height: 0, duration: 0.4, ease: 'power3.in'
          });
        }
      });
    });
  }

  function initFooter() {
    var footer = document.querySelector('.zw-footer');
    if (!footer) return;
    gsap.from(footer.querySelectorAll('.zw-footer__brand h3, .zw-footer__brand p, .zw-footer__col, .zw-footer__bottom > *'), {
      scrollTrigger: { trigger: footer, start: 'top 80%' },
      y: 40, opacity: 0, duration: 0.8, stagger: 0.06, ease: 'power3.out'
    });
    var big = footer.querySelector('.zw-footer__big');
    if (big) {
      gsap.to(big, {
        y: -60,
        ease: 'none',
        scrollTrigger: { trigger: footer, start: 'top bottom', end: 'bottom top', scrub: 1 }
      });
    }
  }

  function initMagneticButtons() {
    document.querySelectorAll('[data-zw-magnet]').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        gsap.to(btn, { x: x * 0.2, y: y * 0.2, duration: 0.4, ease: 'power3.out' });
      });
      btn.addEventListener('mouseleave', function () {
        gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1,0.4)' });
      });
    });
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
          var parser = new DOMParser();
          var doc = parser.parseFromString(html, 'text/html');
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
          btn.firstChild && (btn.firstChild.nodeValue = match.available ? 'Add to bag ' : 'Sold out ');
        }
        var priceEl = document.querySelector('.zw-pp__price > span');
        if (priceEl) {
          priceEl.textContent = formatMoney(match.price);
        }
      }
      form.addEventListener('change', function (e) {
        if (e.target.matches('[data-zw-option-input]')) update();
      });
    });
  }

  function formatMoney(cents) {
    var amt = (cents / 100).toFixed(2);
    return '$' + amt;
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
          .catch(function (err) {
            alert(err.message);
          })
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
    var targets = main.querySelectorAll('h1, h2, .card, [class*="product-card"], [class*="collection-card"], .shopify-section > .section');
    targets.forEach(function (el) {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 88%' },
        y: 40, opacity: 0, duration: 0.8, ease: 'power3.out'
      });
    });
  }

  ready(function () {
    waitForGsap(function () {
      initNav();
      initHero();
      initSectionHeads();
      initProducts();
      initSocial();
      initFaq();
      initFooter();
      initMagneticButtons();
      initVariantPicker();
      initCart();
      initNativeReveal();
      refreshOnLoad();
    });
  });
})();
