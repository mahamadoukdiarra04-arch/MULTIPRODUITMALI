import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

const immersiveProductFixtures = [
  { slug: "tropicoul-ananas", title: "Tropicoul Ananas", lifestyle: "ananas-lifestyle-with-can-v02" },
  { slug: "tropicoul-mangue", title: "Tropicoul Mangue", lifestyle: "mangue-lifestyle-with-can-v03" },
  { slug: "tropicoul-orange", title: "Tropicoul Orange", lifestyle: "orange-lifestyle-with-can-v02" },
  { slug: "tropicoul-goyave", title: "Tropicoul Goyave", lifestyle: "goyave-lifestyle-with-can-v02" },
  { slug: "tropicoul-cocktail", title: "Tropicoul Cocktail", lifestyle: "cocktail-lifestyle-with-can-v02" },
  { slug: "tropicoul-tamarin", title: "Tropicoul Tamarin", lifestyle: "tamarin-lifestyle-with-can-v02" },
  { slug: "triplex-original", title: "Triplex Energy Drink", lifestyle: "triplex-lifestyle-with-can-v02" },
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
  for (const publishedSlug of publishedSlugs.filter((slug) => slug !== "vimto-sparkling")) {
    assert.match(html, new RegExp(`href="/produits/${publishedSlug}"`), `${label}: ${publishedSlug}`);
  }
  assert.match(html, /href="\/gammes\/vimto"[\s\S]*?<small>Vimto<\/small><strong>Gamme Vimto<\/strong>/, `${label}: Vimto range`);
  assert.doesNotMatch(html, /href="\/produits\/vimto-sparkling"[\s\S]*?<small>Vimto<\/small><strong>Sparkling<\/strong>/, `${label}: no individual Vimto card`);
  const rangeModels = [...html.matchAll(/data-turntable-model="([^"]+\.glb)"/g)].map((match) => match[1]);
  assert.deepEqual(rangeModels, publishedRangeModels, `${label}: range models`);
  assert.equal((html.match(/data-turntable-rotation="180"/g) ?? []).length, 7, `${label}: initial rotations`);
  assert.equal((html.match(/class="product-range__fallback"/g) ?? []).length, 7, `${label}: fallbacks`);
}

test("server-renders the Multiproduit Mali homepage and progressive product experience", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  const homePointerSource = await readFile(new URL("../app/HomePointer.tsx", import.meta.url), "utf8");
  const globalStyles = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(html, /<title>Multiproduit Mali \| Tropicoul, Triplex et Vimto<\/title>/i);
  assert.match(html, /href="#main-content"/);
  assert.match(html, /<main id="main-content">/);
  assert.match(html, /packshot\.webp/);
  assert.doesNotMatch(html, /type="image\/avif"/);
  assert.match(html, /\/media\/mpm\/brand\/multiproduit-mali-logo-512\.webp/);
  assert.match(html, /data-loader-phase="loading"/);
  assert.match(html, /data-turntable-phase="0"/);
  assert.match(html, /<img(?=[^>]*multiproduit-mali-logo-512\.webp)(?=[^>]*loading="eager")(?=[^>]*fetchpriority="high")[^>]*>/i);
  assert.match(html, /data-turntable-model="\/models\/mpm\/tropicoul-ananas\.glb"/);
  assert.match(html, /href="\/produits\/tropicoul-cocktail"/);
  assert.match(html, /data-turntable-model="\/models\/mpm\/tropicoul-cocktail\.glb"/);
  assert.match(html, /<a(?=[^>]*href="\/gammes\/vimto")(?=[^>]*aria-label="Découvrir toute la gamme Vimto")(?=[^>]*data-product-link="vimto-range")[^>]*>/);
  assert.doesNotMatch(html, /<a(?=[^>]*class="product-loop__item")(?=[^>]*href="\/produits\/vimto-sparkling")[^>]*>/);
  assert.match(html, /data-turntable-model="\/models\/mpm\/vimto-sparkling-v2\.glb"/);
  assert.match(homePointerSource, /home-pointer__arrow[\s\S]*?<path[\s\S]*?<path/);
  assert.doesNotMatch(homePointerSource, /↶/);
  assert.match(globalStyles, /left: calc\(var\(--home-pointer-inline-start\) \+ var\(--home-pointer-logo-size\) - \.1rem\)/);
  assert.match(globalStyles, /\.product-range ul \{[^}]*display: grid;[^}]*grid-template-columns: repeat\(4, minmax\(0, 1fr\)\)/);
  assert.match(globalStyles, /\.product-range li:nth-child\(n \+ 5\) \{[^}]*border-top:/);
  assert.match(globalStyles, /counter\(range-product, decimal-leading-zero\)/);
  assert.match(globalStyles, /\.product-range__turntable \{[^}]*z-index: 3;/);
  assert.match(globalStyles, /\.product-range a > span \{[^}]*z-index: 4;/);
  for (const [storyId, position] of [["02", "92%"], ["04", "80%"], ["06", "70%"], ["09", "8%"]]) {
    assert.match(
      globalStyles,
      new RegExp(`data-gallery-id="triplex-original-${storyId}"\\] picture img \\{ object-position: ${position.replace("%", "\\%")} center; \\}`),
      `triplex-original-${storyId}: desktop can framing`,
    );
  }
  assert.match(globalStyles, /data-product-slug="vimto-sparkling"\] \.product-page-hero__poster::after \{[^}]*rgba\(253,224,2,0\.46\)[^}]*rgba\(255,255,255,0\.62\)[^}]*rgba\(177,23,45,0\.48\)/);
  assert.match(globalStyles, /data-product-slug="vimto-sparkling"\] \.product-page-hero__veil \{[^}]*rgba\(101,11,26,0\.42\)[^}]*rgba\(177,23,45,0\.14\)/);
  assert.match(html, /data-status="waiting"/);
  assert.doesNotMatch(html, /<canvas[^>]+product-marquee__turntable/);
  assert.doesNotMatch(html, /Your site is taking shape/i);

  const heroStageSource = await readFile(new URL("../app/HeroProductStage.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(heroStageSource, /DecorLayer universe=\{activeUniverse\} depth="(?:front|atmosphere)"/);

  const heroUniverseSource = await readFile(new URL("../app/hero-universes.ts", import.meta.url), "utf8");
  assert.match(heroUniverseSource, /const goyaveModel = \{[\s\S]*?rotationSpan: Math\.PI \* 2,[\s\S]*?printedFaceInterval: Math\.PI \* 2,[\s\S]*?\} as const;/);
  assert.match(heroUniverseSource, /id: "tropicoul-goyave"[\s\S]*?model: goyaveModel,/);

  const heroSceneSource = await readFile(new URL("../app/HeroScene3D.tsx", import.meta.url), "utf8");
  assert.match(heroSceneSource, /MODEL_TRAVEL_DISTANCE/);
  assert.match(heroSceneSource, /MODEL_FACE_SETTLE_MS/);
  assert.match(heroSceneSource, /incomingFaceRotation/);
  assert.match(heroSceneSource, /Hold the logo face/);
  assert.match(heroSceneSource, /outgoingFaceTo/);
  assert.match(heroSceneSource, /mpm:hero-3d-ready/);
  const catalogueSource = await readFile(new URL("../app/CatalogueTurntable.tsx", import.meta.url), "utf8");
  assert.match(catalogueSource, /dataset\.turntablePhase/);
  assert.match(catalogueSource, /rootMargin: "480px 0px"/);
  assert.match(catalogueSource, /frameIntervalMs/);
  assert.match(catalogueSource, /renderer\.autoClear = false/);
  assert.match(catalogueSource, /activeRenderer\.clearDepth\(\)/);

  const heroSource = await readFile(new URL("../app/hero-universes.ts", import.meta.url), "utf8");
  assert.doesNotMatch(heroSource, /palmAsset/);
  assert.match(heroSource, /createHeroUniverse\("tropicoul-ananas", "ananas"/);
  assert.match(heroSource, /id: "tropicoul-cocktail"/);
  assert.match(heroSource, /vimto-background-hero-desktop-v02/);
  assert.match(heroSource, /vimto-sparkling-v2\.glb/);
  assert.match(heroSource, /id: "vimto-fruit-cluster-hero-v01"[\s\S]*?depth: "mid"/);
  assert.doesNotMatch(heroSource, /vimto-(?:ruby|gold-particle)|\/models\/mpm\/vimto\.glb/i);

  const logo = await readFile(new URL("../public/media/mpm/brand/multiproduit-mali-logo.png", import.meta.url));
  assert.equal(createHash("sha256").update(logo).digest("hex"), "22c6fff0773dc8cf1c9620c7cdf54a4419b26eb64f7540e80fe8b4fea7d0e959");
});

test("server-renders responsive immersive product pages and guards unpublished routes", async () => {
  for (const fixture of immersiveProductFixtures) {
    const response = await render(`/produits/${fixture.slug}`);
    assert.equal(response.status, 200, fixture.slug);

    const html = await response.text();
    assert.match(html, new RegExp(`<title>${fixture.title} 330 ml \\| Multiproduit Mali<\\/title>`, "i"), fixture.slug);
    assert.match(normalizeRenderedText(html), new RegExp(`<h1 id="product-page-title">[\\s\\S]*?${fixture.title}[\\s\\S]*?<\\/h1>`), fixture.slug);
    assert.match(html, new RegExp(`data-publication-status="${fixture.status ?? "published"}"`), fixture.slug);
    assert.match(html, /data-product-motion-factor="0\.79"/, fixture.slug);
    assert.match(html, /\/media\/mpm\/brand\/multiproduit-mali-logo-512\.webp/, fixture.slug);
    assert.match(html, /<img(?=[^>]*multiproduit-mali-logo-512\.webp)(?=[^>]*loading="eager")(?=[^>]*fetchpriority="high")[^>]*>/i, fixture.slug);
    assert.match(html, new RegExp(`rel="canonical" href="http://localhost:3000/produits/${fixture.slug}"`), fixture.slug);
    assert.match(html, new RegExp(`${fixture.slug}__hero-desktop__1920w\\.webp`), fixture.slug);
    assert.match(html, new RegExp(`${fixture.slug}__hero-mobile__1440w\\.webp`), fixture.slug);
    assert.match(html, new RegExp(`href="/produits/${fixture.slug}/univers"`), `${fixture.slug}: universe CTA`);
    assert.doesNotMatch(html, new RegExp(`product-pages/${fixture.slug}/(?:source/)?hero-(?:desktop|mobile)\\.png`), fixture.slug);
    assert.equal((html.match(/loading="eager"/g) ?? []).length, 2, `${fixture.slug}: hero and logo eager`);
    assert.equal((html.match(/fetchPriority="high"/g) ?? []).length, 2, `${fixture.slug}: hero and logo priority`);
    assert.doesNotMatch(html, /<canvas\b/, fixture.slug);
    assert.doesNotMatch(html, /class="product-page-hero__layers"/, `${fixture.slug}: hero foreground layers`);

    for (const section of ["facts", "signature", "product", "macro", "lifestyle", "range", "cta"]) {
      assert.match(html, new RegExp(`data-product-section="${section}"`), `${fixture.slug}: ${section}`);
    }
    assert.doesNotMatch(html, /class="product-decor-layer product-decor-layer--(?:front|atmosphere)"/, `${fixture.slug}: foreground decor`);
    assertPublishedRange(html, fixture.slug);

    if (fixture.lifestyle) {
      assert.match(html, new RegExp(`${fixture.lifestyle}\\.webp`), fixture.slug);
      assert.match(html, /name="robots" content="index, follow"/i, fixture.slug);
    }

    if (fixture.slug === "tropicoul-orange" || fixture.slug === "triplex-original") {
      assert.match(html, /product-lifestyle__media--right-subject/, `${fixture.slug}: keeps the can in frame`);
    }

    const universeResponse = await render(`/produits/${fixture.slug}/univers`);
    assert.equal(universeResponse.status, 200, `${fixture.slug}: universe`);
    const universeHtml = await universeResponse.text();
    assert.match(universeHtml, /<h1 id="universe-page-title">L’univers de/i, `${fixture.slug}: universe title`);
    assert.match(universeHtml, /universe-gallery__item--scene/, `${fixture.slug}: universe scene`);
    assert.match(universeHtml, /universe-gallery__item--packshot/, `${fixture.slug}: universe packshot`);
    assert.match(universeHtml, /universe-gallery__item--story/, `${fixture.slug}: universe editorial stories`);
    if (fixture.slug === "triplex-original") {
      for (const storyId of ["02", "04", "06", "09"]) {
        assert.match(universeHtml, new RegExp(`data-gallery-id="triplex-original-${storyId}"`), `triplex-original-${storyId}: mobile focal point`);
      }
    }
  }

  const vimtoResponse = await render("/produits/vimto-sparkling");
  assert.equal(vimtoResponse.status, 200);
  const vimtoHtml = await vimtoResponse.text();
  assert.match(vimtoHtml, /data-publication-status="published"/);
  assert.match(vimtoHtml, /name="robots" content="index, follow"/i);
  assert.match(vimtoHtml, /rel="canonical" href="http:\/\/localhost:3000\/produits\/vimto-sparkling"/i);
  assert.match(vimtoHtml, /property="og:image" content="http:\/\/localhost:3000\/media\/mpm\/product-pages\/vimto-sparkling\/v2\/hero-desktop\.webp"/i);
  assert.match(vimtoHtml, /universes\/vimto-sparkling\/vimto-background-hero-desktop-v02\.webp/);
  assert.match(vimtoHtml, /universes\/vimto-sparkling\/vimto-background-hero-mobile-v02\.webp/);
  assert.match(vimtoHtml, /vimto-can-cutout-clean-v003\.webp/);
  assert.match(vimtoHtml, /vimto-can-cutout-clean-v003\.png/);
  assert.match(vimtoHtml, /vimto-wordmark-header-v03\.png/);
  assert.doesNotMatch(vimtoHtml, /vimto-editorial-macro-v02\.(?:avif|webp)/);
  assert.match(vimtoHtml, /vimto-editorial-lifestyle-v07\.webp/);
  assert.doesNotMatch(vimtoHtml, /vimto-editorial-lifestyle-v04\.(?:avif|webp)/);
  assert.match(vimtoHtml, /data-product-section="formats"/);
  assert.match(vimtoHtml, /Vimto Sirop/);
  assert.match(vimtoHtml, /Vimto Malt/);
  assert.match(vimtoHtml, /href="\/produits\/vimto-sirop"/);
  assert.match(vimtoHtml, /href="\/produits\/vimto-malt"/);
  assert.match(vimtoHtml, /href="\/gammes\/vimto"/);
  assert.match(vimtoHtml, /alt="Logo Vimto"/);
  assert.match(vimtoHtml, /alt="Repas partagé avec une canette Vimto Sparkling ouverte devant chaque convive, des verres servis et un bac à glaçons\."/);
  assert.match(normalizeRenderedText(vimtoHtml), /<dt>Format<\/dt><dd>Canette (?:<span[^>]*>)?330 ml(?:<\/span>)?<\/dd>/);
  assert.match(vimtoHtml, /data-product-motion-factor="0\.79"/);
  assert.match(vimtoHtml, /href="\/produits\/vimto-sparkling\/univers"/, "vimto-sparkling: universe CTA");
  assert.match(vimtoHtml, /vimto-fruit-cluster-mid-v01\.(?:avif|webp)/);
  assert.match(vimtoHtml, /class="product-page-hero__vimto-fruit"/);
  assert.match(vimtoHtml, /class="product-page-hero__vimto-can"/);
  assert.match(vimtoHtml, /vimto-background-hero-desktop-v02\.(?:avif|webp)/);
  assert.doesNotMatch(vimtoHtml, /vimto-(?:ruby|gold-particle)|\/models\/mpm\/vimto\.glb/i);
  assertPublishedRange(vimtoHtml, "vimto-sparkling");

  const vimtoRangeResponse = await render("/gammes/vimto");
  assert.equal(vimtoRangeResponse.status, 200);
  const vimtoRangeHtml = await vimtoRangeResponse.text();
  assert.match(normalizeRenderedText(vimtoRangeHtml), /Toute la gamme Vimto/);
  assert.match(vimtoRangeHtml, /href="\/produits\/vimto-sparkling"/);
  assert.match(vimtoRangeHtml, /href="\/produits\/vimto-sirop"/);
  assert.match(vimtoRangeHtml, /href="\/produits\/vimto-malt"/);
  assert.match(vimtoRangeHtml, /Bouteille en verre · Sirop/);
  assert.match(vimtoRangeHtml, /Canette 330 ml/);
  assert.match(vimtoRangeHtml, /range-page__card--vimto-sirop/);
  assert.match(vimtoRangeHtml, /range-page__card--vimto-malt/);
  const globalStyles = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(globalStyles, /data-product-slug="vimto-malt"\] \.product-macro__media img \{ object-fit: cover; \}/);
  assert.match(globalStyles, /product-page-hero__vimto-syrup-wordmark \{ color: #b11c1d;/);
  assert.match(globalStyles, /product-page-hero__actions \{ display: grid; grid-template-columns: repeat\(2, minmax\(0, 1fr\)\); width: 100%; gap: \.5rem; \}/);

  for (const variant of [
    { slug: "vimto-sirop", title: "Vimto Sirop", format: "Bouteille en verre · Sirop" },
    { slug: "vimto-malt", title: "Vimto Malt", format: "Canette 330 ml" },
  ]) {
    const variantResponse = await render(`/produits/${variant.slug}`);
    assert.equal(variantResponse.status, 200, variant.slug);
    const variantHtml = await variantResponse.text();
    assert.match(variantHtml, new RegExp(`<title>${variant.title} \\| Multiproduit Mali<\\/title>`, "i"), variant.slug);
    assert.match(normalizeRenderedText(variantHtml), new RegExp(`<h1 id="product-page-title">[\\s\\S]*?${variant.title}[\\s\\S]*?<\\/h1>`), variant.slug);
    const formatPattern = variant.slug === "vimto-malt"
      ? /Canette\s*(?:<[^>]+>)?330 ml/
      : new RegExp(variant.format.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    assert.match(variantHtml, formatPattern, variant.slug);
    assert.doesNotMatch(variantHtml, /data-turntable-model=""/);
    assert.match(variantHtml, /data-product-section="formats"/, `${variant.slug}: Vimto formats section`);
    assert.match(variantHtml, /href="\/produits\/vimto-sparkling"/, `${variant.slug}: Sparkling format`);
    assert.match(variantHtml, /href="\/produits\/vimto-sirop"/, `${variant.slug}: Sirop format`);
    assert.match(variantHtml, /href="\/produits\/vimto-malt"/, `${variant.slug}: Malt format`);
    assert.match(variantHtml, /href="\/gammes\/vimto"/, `${variant.slug}: Vimto range`);
    if (variant.slug === "vimto-sirop") {
      assert.match(variantHtml, /product-page-hero__vimto-syrup-wordmark/, "vimto-sirop: bottle-matched wordmark");
      assert.match(variantHtml, /فيمتو/, "vimto-sirop: Arabic brand line");
      assert.match(variantHtml, /vimto-bottle-lantern-v02\.(?:avif|webp)/);
      assert.match(variantHtml, /vimto-bottle-original-v02\.(?:avif|webp)/);
      assert.match(variantHtml, /vimto-sparkling-univers-07-vimto-sparkling-univers-07-serve-v02\.(?:avif|webp)/);
      assert.doesNotMatch(variantHtml, /vimto-bottle-serve\.(?:avif|webp)/);
      assert.doesNotMatch(variantHtml, /vimto-sparkling-univers-09-/);
    } else {
      assert.match(variantHtml, /vimto-malt-hero-blend-v04\.(?:avif|webp)/);
      assert.match(variantHtml, /vimto-malt-lifestyle-v07\.(?:avif|webp)/);
      assert.doesNotMatch(variantHtml, /vimto-sparkling-univers-04-vimto-sparkling-univers-04-lifestyle\.(?:avif|webp)/);
      assert.match(variantHtml, /vimto-sparkling-univers-09-vimto-sparkling-univers-09-detail-v02\.(?:avif|webp)/);
    }
  }

  const vimtoUniverseResponse = await render("/produits/vimto-sparkling/univers");
  assert.equal(vimtoUniverseResponse.status, 200);
  const vimtoUniverseHtml = await vimtoUniverseResponse.text();
  assert.match(vimtoUniverseHtml, /vimto-sparkling-univers-01-/);
  assert.match(vimtoUniverseHtml, /vimto-can-cutout-clean-v003\.webp/);
  assert.match(vimtoUniverseHtml, /vimto-bottle-lantern-v02\.webp/);
  assert.match(vimtoUniverseHtml, /vimto-sparkling-univers-04-vimto-sparkling-univers-04-lifestyle-v03\.(?:avif|webp)/);
  assert.doesNotMatch(vimtoUniverseHtml, /vimto-sparkling-univers-04-vimto-sparkling-univers-04-lifestyle\.(?:avif|webp)/);
  assert.match(vimtoUniverseHtml, /vimto-sparkling-univers-06-vimto-sparkling-univers-06-provenance-v04\.(?:avif|webp)/);
  assert.doesNotMatch(vimtoUniverseHtml, /vimto-sparkling-univers-06-vimto-sparkling-univers-06-provenance-v02\.(?:avif|webp)/);
  assert.match(vimtoUniverseHtml, /vimto-sparkling-univers-08-vimto-sparkling-univers-08-culture-v03\.(?:avif|webp)/);
  assert.match(vimtoUniverseHtml, /vimto-sparkling-univers-09-vimto-sparkling-univers-09-detail-v02\.(?:avif|webp)/);
  assert.match(vimtoUniverseHtml, /vimto-sparkling-univers-10-vimto-sparkling-univers-10-finale-v02\.(?:avif|webp)/);

  const vimtoSyrupUniverseResponse = await render("/produits/vimto-sirop/univers");
  assert.equal(vimtoSyrupUniverseResponse.status, 200);
  const vimtoSyrupUniverseHtml = await vimtoSyrupUniverseResponse.text();
  assert.equal((vimtoSyrupUniverseHtml.match(/data-gallery-id="vimto-sirop-0[1-6]"/g) ?? []).length, 6);
  for (const slug of ["signature", "verse", "table", "fraicheur", "plateau", "nuit"]) {
    assert.match(vimtoSyrupUniverseHtml, new RegExp(`vimto-sirop-univers-0[1-6]-${slug}-v01\\.(?:avif|webp)`));
  }
  assert.doesNotMatch(vimtoSyrupUniverseHtml, /vimto-bottle-lantern-v02|vimto-bottle-original-v02/);

  const vimtoMaltUniverseResponse = await render("/produits/vimto-malt/univers");
  assert.equal(vimtoMaltUniverseResponse.status, 200);
  const vimtoMaltUniverseHtml = await vimtoMaltUniverseResponse.text();
  assert.equal((vimtoMaltUniverseHtml.match(/data-gallery-id="vimto-malt-0[1-6]"/g) ?? []).length, 6);
  for (const slug of ["signature", "verse", "table", "fraicheur", "plateau", "grains"]) {
    assert.match(vimtoMaltUniverseHtml, new RegExp(`vimto-malt-univers-0[1-6]-${slug}-v01\\.(?:avif|webp)`));
  }
  assert.doesNotMatch(vimtoMaltUniverseHtml, /vimto-malt-hero-blend-v04|vimto-malt-lifestyle-v05/);

  const revisedAssets = [
    ["../public/media/mpm/product-pages/vimto-sparkling/v2/hero-desktop.avif", "d7546952bbd6fb50ba5429aea873d6cd252a089b5a324d809ecaab26c527be96"],
    ["../public/media/mpm/universes/vimto-sparkling/vimto-can-cutout-clean-v003.avif", "955c4fcd80f43fe7e70d64ae1eaf01c55f8ead095e86cb21227d040e7d438977"],
    ["../public/media/mpm/universes/vimto-sparkling/vimto-editorial-macro-v02.avif", "8f6f59080906564f87f69ba72486695747406c4149e2c304976c99e99601b355"],
    ["../public/media/mpm/universes/vimto-sparkling/vimto-editorial-lifestyle-v07.avif", "d1f25516446c609af203e6e5821c6f84bd48b42c15be3ebe3f2d86fc074c4a0c"],
  ];
  for (const [path, expectedHash] of revisedAssets) {
    const asset = await readFile(new URL(path, import.meta.url));
    assert.equal(createHash("sha256").update(asset).digest("hex"), expectedHash, path);
  }

  const productSource = await readFile(new URL("../app/products.ts", import.meta.url), "utf8");
  assert.doesNotMatch(productSource, /vimto-(?:ruby|gold-particle)|\/models\/mpm\/vimto\.glb/i);
  const rangeSource = await readFile(new URL("../app/ProductRangeTurntable.tsx", import.meta.url), "utf8");
  assert.match(rangeSource, /matchMedia\("\(prefers-reduced-motion: reduce\)"\)\.matches/);
  assert.match(rangeSource, /if \(reducedMotion \|\| saveData\)/);
  assert.match(rangeSource, /setStatus\("fallback"\)/);
  assert.match(rangeSource, /SINGLE_PRESENTATION_FACE_MODELS[\s\S]*?tropicoul-goyave\.glb[\s\S]*?vimto-sparkling-v2\.glb/);
  assert.match(rangeSource, /pointerActive \|\| keyboardActive \? item\.rotationSpan : 0/);
  assert.match(rangeSource, /rotationEndsOnFront\(item, item\.targetRotation\) \? "front" : "back"/);
  const productHeroSource = await readFile(new URL("../app/ProductPageHero.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(productHeroSource, /product-page-hero__layers|DecorativePicture|heroAssets\(/);
  const motionSource = await readFile(new URL("../app/product-page-motion-config.ts", import.meta.url), "utf8");
  assert.match(motionSource, /PRODUCT_PAGE_MOTION_FACTOR = 0\.79/);
  const modelManifest = JSON.parse(await readFile(new URL("../public/models/mpm/manifest.json", import.meta.url), "utf8"));
  assert.equal(modelManifest.products.length, 8);
  for (const productModel of modelManifest.products) {
    assert.equal(productModel.source.label.width, 4096);
    assert.equal(productModel.source.label.height, 2048);
    assert.match(productModel.source.label.path, /360_BaseColor_4096x2048\.png$/);
    assert.equal(productModel.web.validation.errors, 0);
    assert.equal(productModel.web.validation.warnings, 0);
  }
  const vimtoModel = modelManifest.products.find((product) => product.id === "vimto");
  assert.equal(
    vimtoModel.source.path,
    "3D/VIMTO/Vimto_Sparkling_Product_Page_Pack/Vimto_Sparkling_Product_Page_Pack/assets/product/vimto-330ml-premium-v002.glb",
  );
  assert.equal(vimtoModel.web.frontYawDegrees, 0);
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
  assert.match(html, /triplex-original__hero-desktop__1920w\.webp/);
  assert.match(html, /triplex-carbon-pattern-back-v01\.webp/);
  assert.match(html, /triplex-lifestyle-with-can-v02\.webp/);
  assert.doesNotMatch(withoutScripts(html), /prochain défi|poursuivre l’effort|performance/i);
  assert.doesNotMatch(html, /triplex-energy-v1\.png/);
});

test("server-renders the single partnership contact journey and contextual product selections", async () => {
  const response = await render("/contact?brand=tropicoul&flavour=tropicoul-mangue&source=product-tropicoul-mangue");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Construisons une présence qui a du goût/i);
  assert.match(html, /1 sur 3/i);
  assert.match(html, /Vous et votre marché/i);
  assert.match(html, /Tropicoul/i);
  assert.match(html, /Tropicoul-Mangue|Mangue/i);
  assert.doesNotMatch(html, /contact-choice|CONTACT GÉNÉRAL/i);

  const contactSource = await readFile(new URL("../app/ContactExperience.tsx", import.meta.url), "utf8");
  const countriesSource = await readFile(new URL("../app/countries.ts", import.meta.url), "utf8");
  const contactRoute = await readFile(new URL("../app/api/contact/route.ts", import.meta.url), "utf8");
  const contactDelivery = await readFile(new URL("../db/contact.ts", import.meta.url), "utf8");
  const footerStyles = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.doesNotMatch(contactSource, /ContactMode|GeneralData|contact-choice|contact-general/);
  assert.match(contactSource, /Mode de réponse préféré/);
  assert.match(contactSource, /Envoyer plutôt par e-mail/);
  assert.match(contactSource, /Comment souhaitez-vous collaborer \? <strong>obligatoire<\/strong>/);
  assert.match(contactSource, /type="radio" name="collaborationType"[\s\S]*?required/);
  assert.match(contactSource, /Sélectionnez d’abord un type de partenariat pour afficher les produits éligibles/);
  assert.match(contactSource, /<select[\s\S]*?countryOptions\.map[\s\S]*?countryFlag\(option\.code\)/);
  assert.doesNotMatch(contactSource, /contact-country-options|<datalist/);
  assert.equal((countriesSource.match(/^ {2}\{ code:/gm) ?? []).length, 250);
  assert.match(countriesSource, /countryNameFromLocale/);
  assert.doesNotMatch(contactSource, /Comment souhaitez-vous collaborer \? <em>facultatif<\/em>/);
  assert.match(contactRoute, /createWhatsAppMessage/);
  assert.match(contactRoute, /Seule la gamme Tropicoul est éligible à la représentation/);
  assert.match(contactRoute, /Choisissez un type de partenariat/);
  assert.match(html, /Facebook Triplex ↗/);
  assert.match(html, /TikTok Triplex ↗/);
  assert.match(html, /Facebook Tropicoul ↗/);
  assert.match(html, /TikTok Tropicoul — à venir/);
  assert.match(html, /facebook\.com\/share\/1BkVFeKfJ9/);
  assert.match(html, /facebook\.com\/share\/p\/19nAASMHVk/);
  assert.match(html, /Écrire sur WhatsApp ↗/);
  assert.match(html, /multiproduitmali@gmail\.com/);
  assert.ok((html.match(/site-footer__social-icon/g) ?? []).length >= 6);
  assert.match(footerStyles, /site-footer__social-icon--facebook \{ color: #1877f2; \}/);
  assert.match(footerStyles, /site-footer__social-icon--whatsapp \{ color: #25d366; \}/);
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
