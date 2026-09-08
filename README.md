# Club No Sleep — Shopify-tema

Dette repo er temaet til webshoppen på **clubnosleep.com**.

Udgangspunktet er Shopifys officielle tema **Dawn version 16.0.0**, uden Dawns
egen git-historik.

## Sådan hænger det sammen

Repoet er forbundet til Shopify-butikken gennem Shopifys GitHub-integration.
Det betyder:

- **Ændringer på grenen `main` går direkte i butikken.** Der er ingen manuel
  udgivelse imellem — så snart noget er skubbet til `main`, er det live.
- Redigerer man temaet inde i Shopifys temaeditor, skriver Shopify ændringen
  tilbage til `main` her i repoet.
- Temaets mapper (`layout/`, `sections/`, `snippets/`, `templates/`,
  `assets/`, `config/`, `locales/`) skal ligge i roden af repoet. Shopify
  afviser forbindelsen, hvis de ligger i en undermappe.

## Arbejd i en gren, ikke direkte i main

Fordi `main` er live, laves større ændringer i en separat gren og lægges først
over i `main`, når de er afprøvet.

## Se temaet lokalt

Shopify CLI kan servere temaet fra din egen maskine og går uden om
butikkens adgangskode:

```bash
export SHOPIFY_CLI_THEME_TOKEN=<nøgle fra Apps → Theme access>
shopify theme dev --store club-no-sleep.myshopify.com
```

Nøglen hører ikke hjemme i repoet. Læg den i miljøet, ikke i en fil.

## Hvis en ændring ikke slår igennem i butikken

Shopify validerer hver enkelt fil, når den henter den fra GitHub. Bliver
én fil afvist, bliver den gamle udgave liggende — mens alle de andre
filer opdateres som normalt. Der kommer ingen fejl at se på forsiden, kun
en sektion der opfører sig, som om ændringen aldrig blev lavet.

Den fælde, vi allerede er gået i: **et `range`-felt i et `{% schema %}`
må højst have én decimal i `step`.** `"step": 0.05` bliver afvist med

```
Invalid schema: setting with id="..." step må højst have ét eller færre decimaltal
```

Derfor står styrke og spredning i hele procent og deles med hundrede,
når de bruges.

Er du i tvivl om, hvorvidt butikken kører den nyeste kode, så sammenlign
filstørrelserne. Temaet hedder `Club-no-sleep-web/main`, og filerne kan
læses gennem Shopifys Admin-API. Er en fils størrelse i butikken ikke den
samme som i repoet, er den ikke kommet igennem.
