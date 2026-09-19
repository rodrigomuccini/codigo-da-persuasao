/* =========================================================
   O CÓDIGO DA PERSUASÃO — interações
   ========================================================= */
(function () {
  'use strict';

  // -------------------------------------------------------
  // CONFIGURAÇÃO — a preencher pelo Rodrigo
  // -------------------------------------------------------
  var CONFIG = {
    // Número de WhatsApp com indicativo, apenas dígitos. Ex.: '351912345678'
    whatsapp: '',
    // Mensagem pré-preenchida do WhatsApp
    whatsappMsg: 'Olá Rodrigo. Vi a página do Código da Persuasão e gostava de marcar a sessão de diagnóstico para a minha equipa.',
    // Endpoint do serviço de formulários (ex.: https://formspree.io/f/XXXXXXX)
    formEndpoint: ''
  };

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // -------------------------------------------------------
  // Ano no rodapé
  // -------------------------------------------------------
  var ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();

  // -------------------------------------------------------
  // Navegação: estado ao scroll + barra de progresso
  // -------------------------------------------------------
  var nav = document.getElementById('nav');
  var bar = document.querySelector('.scroll-progress i');
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (nav) nav.classList.toggle('is-stuck', y > 40);
    if (bar) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  // -------------------------------------------------------
  // Menu mobile
  // -------------------------------------------------------
  var burger = document.getElementById('burger');
  var menu = document.getElementById('mobile-menu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      burger.setAttribute('aria-label', open ? 'Abrir menu' : 'Fechar menu');
      menu.hidden = open;
    });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        burger.setAttribute('aria-expanded', 'false');
        burger.setAttribute('aria-label', 'Abrir menu');
        menu.hidden = true;
      }
    });
  }

  // -------------------------------------------------------
  // Reveal ao entrar no ecrã
  // -------------------------------------------------------
  var items = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }

  // -------------------------------------------------------
  // Depoimento em vídeo 2: reproduzir a 1,5x
  // -------------------------------------------------------
  var video2 = document.getElementById('video-depoimento-2');
  if (video2) {
    var setRate = function () { video2.playbackRate = 1.5; };
    video2.defaultPlaybackRate = 1.5;
    video2.addEventListener('loadedmetadata', setRate);
    video2.addEventListener('play', setRate);
  }

  // -------------------------------------------------------
  // WhatsApp
  // -------------------------------------------------------
  var wa = document.getElementById('whatsapp-link');
  if (wa) {
    if (CONFIG.whatsapp) {
      wa.href = 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(CONFIG.whatsappMsg);
      wa.target = '_blank';
      wa.rel = 'noopener';
      wa.removeAttribute('data-needs-number');
    } else {
      wa.addEventListener('click', function (e) {
        e.preventDefault();
        var f = document.getElementById('form-diagnostico');
        if (f) f.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
      });
    }
  }

  // -------------------------------------------------------
  // Formulário
  // -------------------------------------------------------
  var form = document.getElementById('form-diagnostico');
  var status = document.getElementById('form-status');

  function setStatus(msg, kind) {
    if (!status) return;
    status.textContent = msg;
    status.className = 'form__status' + (kind ? ' ' + kind : '');
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // validação
      var invalid = null;
      form.querySelectorAll('[required]').forEach(function (f) {
        var bad = f.type === 'checkbox' ? !f.checked : !String(f.value).trim();
        if (!bad && f.type === 'email') bad = !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.value);
        f.classList.toggle('is-invalid', bad);
        if (bad && !invalid) invalid = f;
      });

      if (invalid) {
        setStatus('Preencha os campos obrigatórios para continuarmos.', 'err');
        invalid.focus();
        return;
      }

      if (!CONFIG.formEndpoint) {
        setStatus('Formulário validado. Falta ligar o destino de envio — configure "formEndpoint" em script.js.', 'ok');
        return;
      }

      var btn = form.querySelector('button[type="submit"]');
      var label = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = 'A enviar…'; }
      setStatus('');

      fetch(CONFIG.formEndpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form)
      })
        .then(function (r) {
          if (!r.ok) throw new Error('falha');
          form.reset();
          setStatus('Pedido enviado. Recebe resposta em menos de 24 horas úteis.', 'ok');
        })
        .catch(function () {
          setStatus('Não foi possível enviar. Tente novamente ou fale connosco por WhatsApp.', 'err');
        })
        .finally(function () {
          if (btn) { btn.disabled = false; btn.textContent = label; }
        });
    });

    form.addEventListener('input', function (e) {
      if (e.target.classList.contains('is-invalid')) e.target.classList.remove('is-invalid');
    });
  }

  // -------------------------------------------------------
  // Rede neural do hero
  // -------------------------------------------------------
  var canvas = document.getElementById('neural');
  if (canvas && !reduced) {
    var ctx = canvas.getContext('2d');
    var nodes = [];
    var w = 0, h = 0, dpr = 1, raf = null;
    var pointer = { x: -9999, y: -9999 };

    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }

    function build() {
      var target = Math.round(Math.min(110, Math.max(38, (w * h) / 15000)));
      nodes = [];
      for (var i = 0; i < target; i++) {
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.17,
          vy: (Math.random() - 0.5) * 0.17,
          r: Math.random() * 1.5 + 0.7,
          p: Math.random() * Math.PI * 2
        });
      }
    }

    function frame(t) {
      ctx.clearRect(0, 0, w, h);
      var link = Math.min(170, Math.max(105, w / 9));

      // ligações
      for (var i = 0; i < nodes.length; i++) {
        for (var j = i + 1; j < nodes.length; j++) {
          var dx = nodes[i].x - nodes[j].x;
          var dy = nodes[i].y - nodes[j].y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < link) {
            var a = (1 - d / link) * 0.3;
            ctx.strokeStyle = 'rgba(217,180,81,' + a.toFixed(3) + ')';
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // nós
      for (var k = 0; k < nodes.length; k++) {
        var n = nodes[k];

        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -20) n.x = w + 20; else if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20; else if (n.y > h + 20) n.y = -20;

        // atração suave ao cursor
        var mx = pointer.x - n.x, my = pointer.y - n.y;
        var md = Math.sqrt(mx * mx + my * my);
        if (md < 190 && md > 0.5) {
          n.x += (mx / md) * 0.34;
          n.y += (my / md) * 0.34;
        }

        var pulse = 0.55 + 0.45 * Math.sin(t / 1100 + n.p);
        ctx.fillStyle = 'rgba(240,214,140,' + (0.2 + pulse * 0.5).toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();

        if (n.r > 1.7) {
          ctx.fillStyle = 'rgba(217,180,81,' + (0.05 + pulse * 0.07).toFixed(3) + ')';
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r * 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      raf = window.requestAnimationFrame(frame);
    }

    var hero = document.querySelector('.hero');
    if (hero) {
      hero.addEventListener('pointermove', function (e) {
        var r = canvas.getBoundingClientRect();
        pointer.x = e.clientX - r.left;
        pointer.y = e.clientY - r.top;
      });
      hero.addEventListener('pointerleave', function () {
        pointer.x = -9999; pointer.y = -9999;
      });
    }

    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(size, 180);
    });

    // pausa a animação quando o hero sai do ecrã
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (en) {
          if (en.isIntersecting) {
            if (!raf) raf = window.requestAnimationFrame(frame);
          } else if (raf) {
            window.cancelAnimationFrame(raf); raf = null;
          }
        });
      }, { threshold: 0 }).observe(canvas);
    }

    size();
    raf = window.requestAnimationFrame(frame);
  }
})();
