import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

const immersiveProductFixtures = [
  { slug: "tropicoul-ananas", title: "Tropicoul Ananas", lifestyle: "ananas-lifestyle-mid-v01" },
  { slug: "tropicoul-mangue", title: "Tropicoul Mangue", lifestyle: "mangue-lifestyle-mid-v01" },
  { slug: "tropicoul-orange", title: "Tropicoul Orange", lifestyle: "orange-lifestyle-mid-v01" },
  { slug: "tropicoul-goyave", title: "Tropicoul Goyave", lifestyle: "goyave-lifestyle-mid-v01" },
  { slug: "tropicoul-cocktail", title: "Tropicoul Cocktail", lifestyle: "cocktail-lifestyle-mid-v01" },
  { slug: "tropicoul-tamarin", title: "Tropicoul Tamarin", lifestyle: "tamarin-lifestyle-mid-v01" },
  { slug: "triplex-original", title: "Triplex Original", lifestyle: "triplex-lifestyle-mid-v01" },
];

const publishedSlugs = [
  "tropicoul-ananas",
  "tropicoul-mangue",
  "tropicoul-orange",
  "tropicoul-goyave",
  "tropicoul-cocktail",
  "tropicoul-tamarin",
  "triplex-original",
  "vimto-sparkling",
];

const publishedRangeModels = [
  "/models/mpm/tropicoul-ananas.glb",
  "/models/mpm/tropicoul-mangue.glb",
  "/models/mpm/tropicoul-orange.glb",
  "/models/mpm/tropicoul-goyave.glb",
  "/models/mpm/tropicoul-cocktail.glb",
  "/models/mpm/tropicoul-tamarin.glb",
  "/models/mpm/triplex-energy-drink.glb",
  "/models/mpm/vimto-sparkling-v2.glb",
];

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    {
      ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

function normalizeRenderedText(html) {
  return html.replaceAll("<!-- -->", "");
}

function withoutScripts(html) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
}

function assertPublishedRange(html, label) {
  for (const publishedSlug of publishedSlugs) {
    assert.match(html, new RegExp(`href="/produits/${publishedSlug}"`), `${label}: ${publishedSlug}`);
  }
  const rangeModels = [...html.matchAll(/data-turntable-model="([^"]+\.glb)"/g)].map((match) => match[1]);
  assert.deepEqual(rangeModels, publishedRangeModels, `${label}: range models`);
  assert.equal((html.match(/data-turntable-rotation="180"/g) ?? []).length, 8, `${label}: initial rotations`);
  assert.equal((html.match(/class="product-range__fallback"/g) ?? []).length, 8, `${label}: fallbacks`);
}

test("server-renders the Multiproduit Mali homepage and progressive product experience", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Multiproduit Mali \| Tropicoul, Triplex et Vimto<\/title>/i);
  assert.match(html, /href="#main-content"/);
  assert.match(html, /<main id="main-content">/);
  assert.match(html, /packshot\.avif/);
  assert.match(html, /packshot\.webp/);
  assert.match(html, /goyave-background-hero-desktop-v01\.avif/);
  assert.match(html, /\/media\/mpm\/brand\/multiproduit-mali-logo-512\.webp/);
  assert.match(html, /data-loader-phase="loading"/);
  assert.match(html, /data-turntable-phase="0"/);
  assert.match(html, /<img(?=[^>]*multiproduit-mali-logo-512\.webp)(?=[^>]*loading="eager")(?=[^>]*fetchpriority="high")[^>]*>/i);
  assert.match(html, /data-turntable-model="\/models\/mpm\/tropicoul-ananas\.glb"/);
  assert.match(html, /href="\/produits\/tropicoul-cocktail"/);
  assert.match(html, /data-turntable-model="\/models\/mpm\/tropicoul-cocktail\.glb"/);
  assert.match(html, /href="\/produits\/vimto-sparkling"/);
  assert.match(html, /data-turntable-model="\/models\/mpm\/vimto-sparkling-v2\.glb"/);
  assert.match(html, /data-status="waiting"/);
  assert.doesNotMatch(html, /<canvas[^>]+product-marquee__turntable/);
  assert.doesNotMatch(html, /Your site is taking shape/i);

  const heroSceneSource = await readFile(new URL("../app/HeroScene3D.tsx", import.meta.url), "utf8");
  assert.match(heroSceneSource, /MODEL_TRAVEL_DISTANCE/);
  assert.match(heroSceneSource, /mpm:hero-3d-ready/);
  const catalogueSource = await readFile(new URL("../app/CatalogueTurntable.tsx", import.meta.url), "utf8");
  assert.match(catalogueSource, /dataset\.turntablePhase/);
  assert.match(catalogueSource, /rootMargin: "480px 0px"/);
  assert.match(catalogueSource, /frameIntervalMs/);

  const heroSource = await readFile(new URL("../app/hero-universes.ts", import.meta.url), "utf8");
  assert.doesNotMatch(heroSource, /palmAsset/);
  assert.match(heroSource, /createHeroUniverse\("tropicoul-ananas", "ananas"/);
  assert.match(heroSource, /id: "tropicoul-cocktail"/);
  assert.match(heroSource, /vimto-background-hero-desktop-v02/);
  assert.match(heroSource, /vimto-sparkling-v2\.glb/);
  assert.doesNotMatch(heroSource, /vimto-(?:ruby|fruit-cluster|gold-particle)|\/models\/mpm\/vimto\.glb/i);

  const logo = await readFile(new URL("../public/media/mpm/brand/multiproduit-mali-logo.png", import.meta.url));
  assert.equal(createHash("sha256").update(logo).digest("hex"), "22c6fff0773dc8cf1c9620c7cdf54a4419b26eb64f7540e80fe8b4fea7d0e959");
});

test("server-renders responsive immersive product pages and guards unpublished routes", async () => {
  for (const fixture of immersiveProductFixtures) {
    const response = await render(`/produits/${fixture.slug}`);
    assert.equal(response.status, 200, fixture.slug);

    const html = await response.text();
    assert.match(html, new RegExp(`<title>${fixture.title} 330 ml \\| Multiproduit Mali<\\/title>`, "i"), fixture.slug);
    assert.match(normalizeRenderedText(html), new RegExp(`<h1 id="product-page-title">${fixture.title}<\\/h1>`), fixture.slug);
    assert.match(html, new RegExp(`data-publication-status="${fixture.status ?? "published"}"`), fixture.slug);
    assert.match(html, /data-product-motion-factor="0\.79"/, fixture.slug);
    assert.match(html, /\/media\/mpm\/brand\/multiproduit-mali-logo-512\.webp/, fixture.slug);
    assert.match(html, /<img(?=[^>]*multiproduit-mali-logo-512\.webp)(?=[^>]*loading="eager")(?=[^>]*fetchpriority="high")[^>]*>/i, fixture.slug);
    assert.match(html, new RegExp(`rel="canonical" href="http://localhost:3000/produits/${fixture.slug}"`), fixture.slug);
    assert.match(html, new RegExp(`${fixture.slug}__hero-desktop__1920w\\.avif`), fixture.slug);
    assert.match(html, new RegExp(`${fixture.slug}__hero-desktop__1920w\\.webp`), fixture.slug);
    assert.match(html, new RegExp(`${fixture.slug}__hero-mobile__1440w\\.avif`), fixture.slug);
    assert.match(html, new RegExp(`${fixture.slug}__hero-mobile__1440w\\.webp`), fixture.slug);
    assert.doesNotMatch(html, new RegExp(`product-pages/${fixture.slug}/(?:source/)?hero-(?:desktop|mobile)\\.png`), fixture.slug);
    assert.equal((html.match(/loading="eager"/g) ?? []).length, 2, `${fixture.slug}: hero and logo eager`);
    assert.equal((html.match(/fetchPriority="high"/g) ?? []).length, 2, `${fixture.slug}: hero and logo priority`);
    assert.doesNotMatch(html, /<canvas\b/, fixture.slug);

    for (const section of ["facts", "signature", "product", "macro", "lifestyle", "range", "cta"]) {
      assert.match(html, new RegExp(`data-product-section="${section}"`), `${fixture.slug}: ${section}`);
    }
    assertPublishedRange(html, fixture.slug);

    if (fixture.lifestyle) {
      assert.match(html, new RegExp(`${fixture.lifestyle}\\.avif`), fixture.slug);
      assert.match(html, new RegExp(`${fixture.lifestyle}\\.webp`), fixture.slug);
      assert.match(html, /name="robots" content="index, follow"/i, fixture.slug);
    }
  }

  const vimtoResponse = await render("/produits/vimto-sparkling");
  assert.equal(vimtoResponse.status, 200);
  const vimtoHtml = await vimtoResponse.text();
  assert.match(vimtoHtml, /data-publication-status="published"/);
  assert.match(vimtoHtml, /name="robots" content="index, follow"/i);
  assert.match(vimtoHtml, /rel="canonical" href="http:\/\/localhost:3000\/produits\/vimto-sparkling"/i);
  assert.match(vimtoHtml, /property="og:image" content="http:\/\/localhost:3000\/media\/mpm\/product-pages\/vimto-sparkling\/v2\/hero-desktop\.webp"/i);
  assert.match(vimtoHtml, /product-pages\/vimto-sparkling\/v2\/hero-desktop\.avif/);
  assert.match(vimtoHtml, /product-pages\/vimto-sparkling\/v2\/hero-desktop\.webp/);
  assert.match(vimtoHtml, /product-pages\/vimto-sparkling\/v2\/hero-mobile\.avif/);
  assert.match(vimtoHtml, /product-pages\/vimto-sparkling\/v2\/hero-mobile\.webp/);
  assert.match(vimtoHtml, /vimto-can-cutout-approved-v002\.avif/);
  assert.match(vimtoHtml, /vimto-can-cutout-approved-v002\.webp/);
  assert.match(vimtoHtml, /vimto-can-cutout-approved-v002\.png/);
  assert.match(vimtoHtml, /vimto-editorial-macro-v02\.avif/);
  assert.match(vimtoHtml, /vimto-editorial-lifestyle-v03\.avif/);
  assert.match(vimtoHtml, /alt="Gros plan du lettrage Vimto rouge entouré de jaune sur le panneau blanc de la canette\."/);
  assert.match(vimtoHtml, /alt="Canette Vimto Sparkling rouge au premier plan d’un repas partagé par quatre adultes en extérieur\."/);
  assert.match(normalizeRenderedText(vimtoHtml), /<dt>Format<\/dt><dd>Canette 330 ml<\/dd>/);
  assert.match(vimtoHtml, /data-product-motion-factor="0\.79"/);
  assert.doesNotMatch(vimtoHtml, /vimto-(?:ruby|fruit-cluster|gold-particle)|grape|blackcurrant|raspberry|\/models\/mpm\/vimto\.glb/i);
  assertPublishedRange(vimtoHtml, "vimto-sparkling");

  const revisedAssets = [
    ["../public/media/mpm/product-pages/vimto-sparkling/v2/hero-desktop.avif", "d7546952bbd6fb50ba5429aea873d6cd252a089b5a324d809ecaab26c527be96"],
    ["../public/media/mpm/universes/vimto-sparkling/vimto-can-cutout-approved-v002.avif", "972aa71d5544b75ffe340f769cd7146deb897628e29f34986372656e58e36fb6"],
    ["../public/media/mpm/universes/vimto-sparkling/vimto-editorial-macro-v02.avif", "8f6f59080906564f87f69ba72486695747406c4149e2c304976c99e99601b355"],
    ["../public/media/mpm/universes/vimto-sparkling/vimto-editorial-lifestyle-v03.avif", "6d26a935c41ba04d459bcb4f4144fad625ce4bc2db0f262685d021c8a6b17d26"],
  ];
  for (const [path, expectedHash] of revisedAssets) {
    const asset = await readFile(new URL(path, import.meta.url));
    assert.equal(createHash("sha256").update(asset).digest("hex"), expectedHash, path);
  }

  const productSource = await readFile(new URL("../app/products.ts", import.meta.url), "utf8");
  assert.doesNotMatch(productSource, /vimto-(?:ruby|fruit-cluster|gold-particle)|\/models\/mpm\/vimto\.glb/i);
  const rangeSource = await readFile(new URL("../app/ProductRangeTurntable.tsx", import.meta.url), "utf8");
  assert.match(rangeSource, /matchMedia\("\(prefers-reduced-motion: reduce\)"\)\.matches/);
  assert.match(rangeSource, /if \(reducedMotion \|\| saveData\)/);
  assert.match(rangeSource, /setStatus\("fallback"\)/);
  const motionSource = await readFile(new URL("../app/product-page-motion-config.ts", import.meta.url), "utf8");
  assert.match(motionSource, /PRODUCT_PAGE_MOTION_FACTOR = 0\.79/);
  const modelManifest = JSON.parse(await readFile(new URL("../public/models/mpm/manifest.json", import.meta.url), "utf8"));
  const vimtoModel = modelManifest.products.find((product) => product.id === "vimto");
  assert.equal(vimtoModel.source.path, "3D/VIMTO/Vimto_Sparkling_Product_Page_Pack/Vimto_Sparkling_Product_Page_Pack/assets/product/vimto-330ml-premium-v002.glb");
  assert.equal(vimtoModel.web.sourceFrontCorrectionDegrees, 30);
  assert.equal(vimtoModel.web.validation.errors, 0);
  assert.equal(vimtoModel.web.validation.warnings, 0);
});

test("server-renders Triplex as a deep black editorial universe without performance claims", async () => {
  const response = await render("/produits/triplex-original");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /--product-surface:#080808/);
  assert.match(html, /--product-heading:#ffffff/);
  assert.match(html, /triplex-original__hero-desktop__1920w\.avif/);
  assert.match(html, /triplex-carbon-pattern-back-v01\.avif/);
  assert.match(html, /triplex-lifestyle-mid-v01\.avif/);
  assert.doesNotMatch(withoutScripts(html), /prochain défi|poursuivre l’effort|performance/i);
  assert.doesNotMatch(html, /triplex-energy-v1\.png/);
});

test("server-renders the two contact journeys and contextual product selections", async () => {
  const response = await render("/contact?mode=partnership&brand=tropicoul&flavour=tropicoul-mangue&source=product-tropicoul-mangue");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Construisons une présence qui a du goût/i);
  assert.match(html, /1 sur 3/i);
  assert.match(html, /Vous et votre marché/i);
  assert.match(html, /Tropicoul/i);
  assert.match(html, /Tropicoul-Mangue|Mangue/i);

  const contactSource = await readFile(new URL("../app/ContactExperience.tsx", import.meta.url), "utf8");
  const contactRoute = await readFile(new URL("../app/api/contact/route.ts", import.meta.url), "utf8");
  const contactDelivery = await readFile(new URL("../db/contact.ts", import.meta.url), "utf8");
  assert.match(contactSource, /Changer de demande/);
  assert.match(contactSource, /Mode de réponse préféré/);
  assert.match(contactRoute, /createWhatsAppMessage/);
  assert.match(contactDelivery, /PARTENARIAT/);
  assert.match(contactDelivery, /CONTACT SITE/);
});

test("server-renders the news hub, a publication detail and anonymous discussion controls", async () => {
  const hub = await render("/actualites");
  assert.equal(hub.status, 200);
  const hubHtml = await hub.text();
  assert.match(hubHtml, /Actualités &amp; événements \| Multiproduit Mali/i);
  assert.match(hubHtml, /Rendez-vous Saveurs de Bamako/i);
  assert.match(hubHtml, /Filtrer par catégorie/i);
  assert.match(hubHtml, /href="\/actualites\/tropicoul-au-marche-de-bamako"/);

  const detail = await render("/actualites/tropicoul-au-marche-de-bamako");
  assert.equal(detail.status, 200);
  const detailHtml = await detail.text();
  assert.match(detailHtml, /Tropicoul apporte une note fruitée au marché de Bamako/i);
  assert.match(detailHtml, /Nom ou pseudonyme/i);
  assert.match(detailHtml, /Votre commentaire/i);
  assert.match(detailHtml, /Ajouter un commentaire/i);
});
