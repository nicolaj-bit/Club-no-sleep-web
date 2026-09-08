/* Club No Sleep — knappen «Hent appen».

   Valget af butik sker i browseren ved klik, ikke i Liquid. Shopify cacher
   HTML'en på sit CDN, så en genkendelse på serveren ville sende det samme
   svar til alle besøgende — den første besøgendes telefon ville afgøre,
   hvor alle andre blev sendt hen. Af samme grund skiftes knapteksten også
   først her, efter siden er indlæst. */
(function () {
  'use strict';

  /* Flere sektioner indlæser den samme fil. Kør kun én gang. */
  if (window.CNSStore) return;

  /* Genkendelsen. Linjen med /Mac/ og maxTouchPoints fanger iPad: siden
     iPadOS 13 udgiver en iPad sig for at være en Mac, og uden den ville
     iPad-brugere blive sendt det forkerte sted hen.

     Adresserne kommer udefra i stedet for at stå her, så de kan rettes i
     temaindstillingerne uden en ny runde. */
  function cnsStoreUrl(iosUrl, androidUrl) {
    var ua = navigator.userAgent || '';
    var iOS =
      /iPad|iPhone|iPod/.test(ua) || (/Mac/.test(ua) && navigator.maxTouchPoints > 1);
    var android = /Android/.test(ua);
    if (iOS) return iosUrl || null;
    if (android) return androidUrl || null;
    return null;
  }

  window.cnsStoreUrl = cnsStoreUrl;

  function bloedtRul() {
    return !(
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  function bind(root) {
    var nodes = (root || document).querySelectorAll('[data-cns-store-link]');

    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.dataset.cnsStoreBound === '1') continue;
      el.dataset.cnsStoreBound = '1';

      /* Kender vi telefonen, skifter teksten med. Gør vi ikke — altså på
         computer — bliver den stående, som den står i skemaet. */
      var url = cnsStoreUrl(el.dataset.cnsIos, el.dataset.cnsAndroid);
      if (url) {
        var tekst =
          url === el.dataset.cnsIos ? el.dataset.cnsLabelIos : el.dataset.cnsLabelAndroid;
        if (tekst) el.textContent = tekst;
      }

      el.addEventListener('click', function (e) {
        var maal = cnsStoreUrl(this.dataset.cnsIos, this.dataset.cnsAndroid);

        /* Adressen skiftes lige før browseren følger linket. Fejler
           JavaScript, står App Store-adressen der stadig i markup'en. */
        if (maal) {
          this.href = maal;
          return;
        }

        /* På computer er der ingen butik at sende hende til. Rul i stedet
           derhen, hvor begge muligheder står. */
        var id = this.dataset.cnsScrollTo;
        var sted = id ? document.getElementById(id) : null;
        if (!sted) return;
        e.preventDefault();
        sted.scrollIntoView({ behavior: bloedtRul() ? 'smooth' : 'auto', block: 'start' });
      });
    }
  }

  window.CNSStore = { bind: bind, url: cnsStoreUrl };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      bind(document);
    });
  } else {
    bind(document);
  }

  /* Temaeditoren sætter sektioner ind igen uden at genindlæse siden. */
  document.addEventListener('shopify:section:load', function (e) {
    bind(e.target);
  });
})();
