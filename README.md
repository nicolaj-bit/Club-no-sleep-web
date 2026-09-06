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
