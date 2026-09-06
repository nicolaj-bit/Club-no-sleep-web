/* Club No Sleep — de to canvas-animationer.
   Ingen afhængigheder. Startes og stoppes af sig selv, også i temaeditoren.

   Brug: sæt data-cns-canvas="stars" eller "denmark" på et <canvas>.
   Ekstra: data-cns-count, data-cns-spread.

   Animationen står stille ved prefers-reduced-motion: der tegnes ét
   billede, og der bliver ikke bedt om flere. */
(function () {
  'use strict';

  var mql = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

  function reduced() {
    return !!(mql && mql.matches);
  }

  /* Alle levende canvas'er, så de kan stoppes igen ved section:unload */
  var live = [];

  /* ── Fælles motor ─────────────────────────────────────────
     Holder styr på størrelse, animationsløkke og synlighed. */
  function engine(canvas, spec) {
    var ctx = canvas.getContext && canvas.getContext('2d');
    if (!ctx) return null;

    var w = 0;
    var h = 0;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var raf = null;
    var alive = true;
    var onScreen = true;
    var ro = null;
    var io = null;

    function measure() {
      var r = canvas.getBoundingClientRect();
      var nw = Math.max(1, Math.round(r.width));
      var nh = Math.max(1, Math.round(r.height));
      if (nw === w && nh === h) return false;
      w = nw;
      h = nh;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (spec.layout) spec.layout(w, h);
      return true;
    }

    function paint(t) {
      ctx.clearRect(0, 0, w, h);
      spec.draw(ctx, w, h, t, reduced());
    }

    function frame(t) {
      if (!alive) return;
      paint(t);
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (!alive || raf !== null || reduced() || !onScreen) return;
      raf = requestAnimationFrame(frame);
    }

    function stop() {
      if (raf !== null) cancelAnimationFrame(raf);
      raf = null;
    }

    function resized() {
      if (measure() || reduced()) paint(0);
    }

    measure();
    paint(0);

    if (window.ResizeObserver) {
      ro = new ResizeObserver(resized);
      ro.observe(canvas);
    } else {
      window.addEventListener('resize', resized);
    }

    /* Uden for skærmen behøver den ikke tegne */
    if (window.IntersectionObserver) {
      io = new IntersectionObserver(function (entries) {
        onScreen = entries[0].isIntersecting;
        if (onScreen) start();
        else stop();
      });
      io.observe(canvas);
    }

    if (mql) {
      var motionChanged = function () {
        stop();
        if (reduced()) paint(0);
        else start();
      };
      if (mql.addEventListener) mql.addEventListener('change', motionChanged);
      else if (mql.addListener) mql.addListener(motionChanged);
    }

    start();

    return {
      canvas: canvas,
      destroy: function () {
        alive = false;
        stop();
        if (ro) ro.disconnect();
        else window.removeEventListener('resize', resized);
        if (io) io.disconnect();
      }
    };
  }

  /* ── Lysene bag hero ──────────────────────────────────────
     Små stjerner, der ånder i utakt. */
  function stars(canvas) {
    var count = parseInt(canvas.getAttribute('data-cns-count'), 10);
    if (isNaN(count)) count = 46;
    var spread = parseFloat(canvas.getAttribute('data-cns-spread'));
    if (isNaN(spread)) spread = 1;

    var pts = [];

    return engine(canvas, {
      layout: function (w, h) {
        pts = [];
        for (var i = 0; i < count; i++) {
          pts.push({
            x: Math.random() * w,
            y: Math.random() * h * spread,
            r: 0.7 + Math.random() * 1.7,
            a: 0.18 + Math.random() * 0.5,
            s: 0.4 + Math.random() * 1.1,
            p: Math.random() * Math.PI * 2
          });
        }
      },
      draw: function (ctx, w, h, t, still) {
        for (var i = 0; i < pts.length; i++) {
          var d = pts[i];
          var pulse = still ? 1 : 0.62 + 0.38 * Math.sin((t / 1400) * d.s + d.p);
          var a = d.a * pulse;
          var g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r * 7);
          g.addColorStop(0, 'rgba(244,220,174,' + a + ')');
          g.addColorStop(0.35, 'rgba(226,192,138,' + a * 0.3 + ')');
          g.addColorStop(1, 'rgba(226,192,138,0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.r * 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'rgba(255,246,228,' + Math.min(1, a * 1.5) + ')';
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.r * 0.62, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });
  }

  /* ── Danmark, tegnet som lys ──────────────────────────────
     Grove omrids: Jylland, Fyn, Sjælland. Nok til at formen kendes. */
  var LAND = [
    [
      [0.3, 0.06], [0.4, 0.05], [0.46, 0.12], [0.45, 0.22], [0.5, 0.3], [0.48, 0.42],
      [0.52, 0.52], [0.47, 0.66], [0.4, 0.78], [0.33, 0.86], [0.26, 0.8], [0.24, 0.66],
      [0.2, 0.52], [0.22, 0.36], [0.2, 0.24], [0.25, 0.12]
    ],
    [[0.56, 0.52], [0.65, 0.5], [0.7, 0.58], [0.67, 0.7], [0.59, 0.72], [0.55, 0.63]],
    [[0.74, 0.46], [0.86, 0.44], [0.92, 0.53], [0.9, 0.66], [0.8, 0.72], [0.73, 0.66], [0.71, 0.55]]
  ];

  /* Lysene — omtrent hvor folk bor */
  var LIGHTS = [
    [0.86, 0.55], [0.84, 0.6], [0.88, 0.5], [0.36, 0.3], [0.31, 0.55], [0.4, 0.7],
    [0.63, 0.6], [0.27, 0.2], [0.44, 0.47], [0.79, 0.64], [0.35, 0.82], [0.67, 0.55]
  ];

  function denmark(canvas) {
    return engine(canvas, {
      draw: function (ctx, w, h, t, still) {
        var i;
        var j;

        /* Landet, svagt */
        ctx.lineWidth = 1;
        for (i = 0; i < LAND.length; i++) {
          var poly = LAND[i];
          ctx.beginPath();
          for (j = 0; j < poly.length; j++) {
            var x = poly[j][0] * w;
            var y = poly[j][1] * h;
            if (j === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.fillStyle = 'rgba(200,168,130,0.055)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(200,168,130,0.20)';
          ctx.stroke();
        }

        /* Lysene */
        for (var k = 0; k < LIGHTS.length; k++) {
          var lx = LIGHTS[k][0] * w;
          var ly = LIGHTS[k][1] * h;
          var pulse = still ? 1 : 0.55 + 0.45 * Math.sin(t / 1500 + k * 1.1);
          var g = ctx.createRadialGradient(lx, ly, 0, lx, ly, 15);
          g.addColorStop(0, 'rgba(244,220,174,' + 0.55 * pulse + ')');
          g.addColorStop(1, 'rgba(244,220,174,0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(lx, ly, 15, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'rgba(255,247,230,' + 0.85 * pulse + ')';
          ctx.beginPath();
          ctx.arc(lx, ly, 2.1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });
  }

  var KINDS = { stars: stars, denmark: denmark };

  function mount(root) {
    var nodes = (root || document).querySelectorAll('[data-cns-canvas]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.dataset.cnsStarted === '1') continue;
      var make = KINDS[el.getAttribute('data-cns-canvas')];
      if (!make) continue;
      var handle = make(el);
      if (!handle) continue;
      el.dataset.cnsStarted = '1';
      live.push(handle);
    }
  }

  function unmount(root) {
    var scope = root || document;
    for (var i = live.length - 1; i >= 0; i--) {
      if (scope === document || scope.contains(live[i].canvas)) {
        live[i].canvas.dataset.cnsStarted = '';
        live[i].destroy();
        live.splice(i, 1);
      }
    }
  }

  window.CNSLights = { mount: mount, unmount: unmount };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      mount(document);
    });
  } else {
    mount(document);
  }

  /* Temaeditoren river sektioner ud og sætter dem ind igen.
     Uden det her ville canvasserne gå i sort under redigering. */
  document.addEventListener('shopify:section:load', function (e) {
    mount(e.target);
  });

  document.addEventListener('shopify:section:unload', function (e) {
    unmount(e.target);
  });

  document.addEventListener('shopify:section:select', function (e) {
    mount(e.target);
  });
})();
