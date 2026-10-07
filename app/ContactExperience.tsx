/* eslint-disable @next/next/no-img-element -- product packshots are lightweight visual selections inside client-side controls. */
"use client";

import { useMemo, useState, useSyncExternalStore, type FormEvent } from "react";
import { countryFlag, countryNameFromLocale, countryOptions } from "./countries";
import Link from "./PlainLink";

type PartnerBrand = "tropicoul" | "triplex" | "vimto";
type ContactChannel = "email" | "whatsapp";
type CollaborationType = "Représentation" | "Distribution" | "Événement" | "Autre";

type ContactExperienceProps = {
  initialBrand?: PartnerBrand;
  initialFlavour?: string;
  source?: string;
};

type PartnershipData = {
  name: string;
  company: string;
  role: string;
  country: string;
  city: string;
  brands: PartnerBrand[];
  tropicoulAll: boolean;
  flavours: string[];
  collaborationType: CollaborationType | "";
  message: string;
  preferredChannel: ContactChannel;
  email: string;
  phone: string;
};

type Receipt = {
  channel: ContactChannel;
  whatsappUrl: string | null;
  delivery: "sent" | "pending" | "failed";
};

const tropicoulFlavours = [
  { slug: "tropicoul-ananas", name: "Ananas", image: "/media/mpm/products/tropicoul-ananas/packshot.webp" },
  { slug: "tropicoul-mangue", name: "Mangue", image: "/media/mpm/products/tropicoul-mangue/packshot.webp" },
  { slug: "tropicoul-orange", name: "Orange", image: "/media/mpm/products/tropicoul-orange/packshot.webp" },
  { slug: "tropicoul-goyave", name: "Goyave", image: "/media/mpm/products/tropicoul-goyave/packshot.webp" },
  { slug: "tropicoul-cocktail", name: "Cocktail", image: "/media/mpm/products/tropicoul-cocktail/packshot.webp" },
  { slug: "tropicoul-tamarin", name: "Tamarin", image: "/media/mpm/products/tropicoul-tamarin/packshot.webp" },
] as const;

const collaborationChoices = ["Représentation", "Distribution", "Événement", "Autre"] as const satisfies readonly CollaborationType[];

function partnershipInitialData(initialBrand?: PartnerBrand, initialFlavour?: string): PartnershipData {
  const matchedFlavour = tropicoulFlavours.find((flavour) => flavour.slug === initialFlavour)?.name;
  return {
    name: "",
    company: "",
    role: "",
    country: "",
    city: "",
    brands: initialBrand ? [initialBrand] : [],
    tropicoulAll: false,
    flavours: matchedFlavour ? [matchedFlavour] : [],
    collaborationType: "",
    message: "",
    preferredChannel: "email",
    email: "",
    phone: "",
  };
}

function labelForBrand(brand: PartnerBrand) {
  if (brand === "tropicoul") return "Tropicoul";
  if (brand === "triplex") return "Triplex Energy Drink";
  return "Vimto Sparkling";
}

function getEstimatedCountry() {
  if (typeof navigator === "undefined") return "Mali";
  return countryNameFromLocale(navigator.languages?.[0] ?? navigator.language);
}

const subscribeToLocale = () => () => {};
const getServerCountry = () => "Mali";

export function ContactExperience({ initialBrand, initialFlavour, source = "contact" }: ContactExperienceProps) {
  const [mode, setMode] = useState<"partnership" | "success">("partnership");
  const [step, setStep] = useState(1);
  const [partnership, setPartnership] = useState<PartnershipData>(() => partnershipInitialData(initialBrand, initialFlavour));
  const estimatedCountry = useSyncExternalStore(subscribeToLocale, getEstimatedCountry, getServerCountry);
  const [countryOverride, setCountryOverride] = useState<string | null>(null);
  const country = countryOverride ?? estimatedCountry;
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  const selectedFlavourNames = useMemo(
    () => partnership.tropicoulAll ? ["Toute la gamme"] : partnership.flavours,
    [partnership.flavours, partnership.tropicoulAll],
  );

  const resetRequest = () => {
    setPartnership(partnershipInitialData(initialBrand, initialFlavour));
    setCountryOverride(null);
    setMode("partnership");
    setStep(1);
    setError("");
    setReceipt(null);
  };

  const continueByEmail = () => {
    setPartnership((current) => ({ ...current, preferredChannel: "email" }));
    setMode("partnership");
    setStep(3);
    setError("");
  };

  const updatePartnership = <K extends keyof PartnershipData>(key: K, value: PartnershipData[K]) => {
    setPartnership((current) => ({ ...current, [key]: value }));
  };

  const selectBrand = (brand: PartnerBrand) => {
    setPartnership((current) => {
      if (current.collaborationType === "Représentation" && brand !== "tropicoul") return current;
      if (current.collaborationType === "Représentation" && brand === "tropicoul") {
        return { ...current, brands: ["tropicoul"] };
      }
      const hasBrand = current.brands.includes(brand);
      const brands = hasBrand ? current.brands.filter((item) => item !== brand) : [...current.brands, brand];
      return {
        ...current,
        brands,
        ...(brand === "tropicoul" && hasBrand ? { flavours: [], tropicoulAll: false } : {}),
      };
    });
  };

  const selectCollaborationType = (choice: CollaborationType) => {
    setPartnership((current) => ({
      ...current,
      collaborationType: choice,
      ...(choice === "Représentation"
        ? { brands: ["tropicoul"], flavours: current.flavours, tropicoulAll: current.tropicoulAll }
        : {}),
    }));
  };

  const toggleFlavour = (name: string) => {
    setPartnership((current) => ({
      ...current,
      tropicoulAll: false,
      flavours: current.flavours.includes(name)
        ? current.flavours.filter((flavour) => flavour !== name)
        : [...current.flavours, name],
    }));
  };

  const nextStep = () => {
    if (step === 1 && (!partnership.name || !partnership.company || !country)) {
      setError("Indiquez votre nom, votre entreprise et votre pays pour continuer.");
      return;
    }
    if (step === 2 && !partnership.collaborationType) {
      setError("Choisissez d’abord un type de partenariat.");
      return;
    }
    if (step === 2 && !partnership.brands.length) {
      setError("Choisissez au moins une marque.");
      return;
    }
    setError("");
    setStep((current) => Math.min(3, current + 1));
  };

  const previousStep = () => {
    setError("");
    setStep((current) => Math.max(1, current - 1));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!partnership.collaborationType || !partnership.brands.length) {
      setStep(2);
      setError(!partnership.collaborationType
        ? "Choisissez d’abord un type de partenariat."
        : "Choisissez au moins une marque.");
      return;
    }

    setSubmitting(true);

    const data = {
      kind: "partnership" as const,
      name: partnership.name,
      company: partnership.company,
      role: partnership.role,
      country,
      city: partnership.city,
      brands: partnership.brands.map(labelForBrand),
      flavours: selectedFlavourNames,
      collaborationType: partnership.collaborationType,
      preferredChannel: partnership.preferredChannel,
      email: partnership.email,
      phone: partnership.phone,
      message: partnership.message,
      source,
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json() as { error?: string; whatsappUrl?: string | null; delivery?: Receipt["delivery"] };
      if (!response.ok) throw new Error(result.error || "Votre demande n’a pas pu être transmise.");

      setReceipt({
        channel: partnership.preferredChannel,
        whatsappUrl: typeof result.whatsappUrl === "string" ? result.whatsappUrl : null,
        delivery: result.delivery ?? "pending",
      });
      setMode("success");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Votre demande n’a pas pu être transmise.");
    } finally {
      setSubmitting(false);
    }
  };

  if (mode === "success") {
    return (
    <section className="contact-success" aria-live="polite">
        <p className="section-kicker">MULTIPRODUIT MALI</p>
        <h1>Merci, votre demande a bien été transmise.</h1>
        <p>L’équipe Multiproduit Mali dispose maintenant des informations nécessaires pour vous répondre.</p>
        {receipt?.whatsappUrl ? <a className="contact-primary-action" href={receipt.whatsappUrl} target="_blank" rel="noreferrer">Continuer sur WhatsApp <span aria-hidden="true">↗</span></a> : null}
        {!receipt?.whatsappUrl && receipt?.channel === "whatsapp" ? <>
          <p className="contact-success__note">WhatsApp n’est pas disponible pour le moment. Vous pouvez poursuivre par e-mail.</p>
          <button className="contact-secondary-action" type="button" onClick={continueByEmail}>Envoyer plutôt par e-mail</button>
        </> : null}
        <div className="contact-success__links">
          <Link href="/#marques">Retourner aux produits</Link>
          <Link href="/">Retour à l’accueil</Link>
          <button type="button" onClick={resetRequest}>Faire une autre demande</button>
        </div>
      </section>
    );
  }

  return (
    <section className={"contact-partnership contact-partnership--step-" + step} aria-labelledby="partnership-contact-title">
      <div className="contact-partnership__intro">
        <p className="section-kicker">PARTENARIAT</p>
        <h1 id="partnership-contact-title">Construisons une présence qui a du goût.</h1>
        <p>Quelques informations suffisent pour préparer le bon échange avec l’équipe Multiproduit Mali.</p>
      </div>

      <form className="contact-form contact-form--partnership" onSubmit={submit}>
        <div className="contact-progress" aria-label={"Étape " + step + " sur 3"}>
          <strong>{step} sur 3</strong>
          <span><i className={step >= 1 ? "is-active" : ""} /><i className={step >= 2 ? "is-active" : ""} /><i className={step >= 3 ? "is-active" : ""} /></span>
        </div>

        {step === 1 ? (
          <div className="contact-step">
            <div className="contact-step__heading"><p>ÉTAPE 1</p><h2>Vous et votre marché</h2></div>
            <div className="contact-fields-grid">
              <label className="contact-field"><span>Nom et prénom</span><input value={partnership.name} onChange={(event) => updatePartnership("name", event.target.value)} autoComplete="name" required /></label>
              <label className="contact-field"><span>Entreprise</span><input value={partnership.company} onChange={(event) => updatePartnership("company", event.target.value)} autoComplete="organization" required /></label>
              <label className="contact-field"><span>Fonction <em>facultatif</em></span><input value={partnership.role} onChange={(event) => updatePartnership("role", event.target.value)} autoComplete="organization-title" /></label>
              <label className="contact-field"><span>Pays</span><select value={country} onChange={(event) => { setCountryOverride(event.target.value); updatePartnership("country", event.target.value); }} autoComplete="country-name" required>{countryOptions.map((option) => <option key={option.code} value={option.name}>{countryFlag(option.code)} {option.name}</option>)}</select></label>
              <label className="contact-field"><span>Ville <em>facultatif</em></span><input value={partnership.city} onChange={(event) => updatePartnership("city", event.target.value)} autoComplete="address-level2" /></label>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="contact-step">
            <div className="contact-step__heading"><p>ÉTAPE 2</p><h2>Votre type de partenariat</h2></div>
            <fieldset className="contact-collaboration contact-collaboration--first">
              <legend>Comment souhaitez-vous collaborer ? <strong>obligatoire</strong></legend>
              <div>{collaborationChoices.map((choice) => (
                <label className={partnership.collaborationType === choice ? "is-selected" : ""} key={choice}>
                  <input type="radio" name="collaborationType" value={choice} checked={partnership.collaborationType === choice} onChange={() => selectCollaborationType(choice)} required />
                  <span>{choice}</span>
                </label>
              ))}</div>
            </fieldset>
            {partnership.collaborationType ? (
              <div className="contact-product-selection">
                <div className="contact-product-selection__heading">
                  <p>PRODUITS ÉLIGIBLES</p>
                  <h3>Les produits qui vous intéressent</h3>
                  <span>{partnership.collaborationType === "Représentation" ? "La représentation est réservée à Tropicoul." : "Tous les produits sont disponibles pour ce partenariat."}</span>
                </div>
                <div className="contact-brand-options">
                  <button className={"contact-brand-card contact-brand-card--tropicoul" + (partnership.brands.includes("tropicoul") ? " is-selected" : "")} type="button" aria-pressed={partnership.brands.includes("tropicoul")} onClick={() => selectBrand("tropicoul")}>
                    <span><small>TROPICOUL</small><strong>Une gamme fruitée, colorée et généreuse.</strong></span>
                    <div aria-hidden="true"><img src="/media/mpm/products/tropicoul-ananas/packshot.webp" alt="" /><img src="/media/mpm/products/tropicoul-mangue/packshot.webp" alt="" /><img src="/media/mpm/products/tropicoul-goyave/packshot.webp" alt="" /></div>
                    <i aria-hidden="true">{partnership.brands.includes("tropicoul") ? "✓" : "+"}</i>
                  </button>
                  {partnership.collaborationType !== "Représentation" ? <button className={"contact-brand-card contact-brand-card--triplex" + (partnership.brands.includes("triplex") ? " is-selected" : "")} type="button" aria-pressed={partnership.brands.includes("triplex")} onClick={() => selectBrand("triplex")}>
                    <span><small>TRIPLEX ENERGY DRINK</small><strong>L’énergie intense prête à garder le rythme.</strong></span>
                    <img src="/media/mpm/products/triplex/packshot.webp" alt="" aria-hidden="true" />
                    <i aria-hidden="true">{partnership.brands.includes("triplex") ? "✓" : "+"}</i>
                  </button> : null}
                  {partnership.collaborationType !== "Représentation" ? <button className={"contact-brand-card contact-brand-card--vimto" + (partnership.brands.includes("vimto") ? " is-selected" : "")} type="button" aria-pressed={partnership.brands.includes("vimto")} onClick={() => selectBrand("vimto")}>
                    <span><small>VIMTO SPARKLING</small><strong>Le goût fruité et pétillant à partager.</strong></span>
                    <img src="/media/mpm/universes/vimto-sparkling/vimto-can-cutout-clean-v003.webp" alt="" aria-hidden="true" />
                    <i aria-hidden="true">{partnership.brands.includes("vimto") ? "✓" : "+"}</i>
                  </button> : null}
                </div>
                {partnership.brands.includes("tropicoul") ? (
                  <div className="contact-flavour-picker">
                    <div><p>PARFUMS TROPICOUL</p><span>Sélection multiple possible</span></div>
                    <button type="button" className={partnership.tropicoulAll ? "is-selected" : ""} aria-pressed={partnership.tropicoulAll} onClick={() => updatePartnership("tropicoulAll", !partnership.tropicoulAll)}>Toute la gamme</button>
                    <div className="contact-flavour-picker__list">
                      {tropicoulFlavours.map((flavour) => <button type="button" key={flavour.slug} className={partnership.flavours.includes(flavour.name) && !partnership.tropicoulAll ? "is-selected" : ""} aria-pressed={partnership.flavours.includes(flavour.name) && !partnership.tropicoulAll} onClick={() => toggleFlavour(flavour.name)}><img src={flavour.image} alt="" /><span>{flavour.name}</span></button>)}
                    </div>
                  </div>
                ) : null}
                {partnership.brands.includes("triplex") ? <p className="contact-triplex-choice">✓ Triplex Energy Drink sélectionné</p> : null}
              </div>
            ) : <p className="contact-product-gate">Sélectionnez d’abord un type de partenariat pour afficher les produits éligibles.</p>}
          </div>
        ) : null}

        {step === 3 ? (
          <div className="contact-step">
            <div className="contact-step__heading"><p>ÉTAPE 3</p><h2>Restons en contact</h2></div>
            <label className="contact-field contact-field--wide"><span>Message ou présentation courte <em>facultatif</em></span><textarea rows={6} value={partnership.message} onChange={(event) => updatePartnership("message", event.target.value)} /></label>
            <ChannelChoice channel={partnership.preferredChannel} onChange={(channel) => updatePartnership("preferredChannel", channel)} />
            {partnership.preferredChannel === "email" ? (
              <label className="contact-field"><span>Adresse e-mail</span><input type="email" value={partnership.email} onChange={(event) => updatePartnership("email", event.target.value)} autoComplete="email" required /></label>
            ) : (
              <label className="contact-field"><span>Numéro WhatsApp</span><input type="tel" value={partnership.phone} onChange={(event) => updatePartnership("phone", event.target.value)} autoComplete="tel" required /></label>
            )}
          </div>
        ) : null}

        <FormNotice error={error} />
        <div className="contact-form__actions">
          {step > 1 ? <button className="contact-secondary-action" type="button" onClick={previousStep}>← Retour</button> : <span />}
          {step < 3 ? <button className="contact-primary-action" type="button" onClick={nextStep} disabled={step === 2 && !partnership.collaborationType}>Continuer <span aria-hidden="true">→</span></button> : <button className="contact-primary-action" type="submit" disabled={submitting}>{submitting ? "Transmission…" : partnership.preferredChannel === "whatsapp" ? "Continuer sur WhatsApp" : "Envoyer la demande"} <span aria-hidden="true">↗</span></button>}
        </div>
      </form>
    </section>
  );
}

function ChannelChoice({ channel, onChange }: { channel: ContactChannel; onChange: (channel: ContactChannel) => void }) {
  return (
    <fieldset className="contact-channel">
      <legend>Mode de réponse préféré</legend>
      <div>
        <button type="button" className={channel === "whatsapp" ? "is-selected" : ""} aria-pressed={channel === "whatsapp"} onClick={() => onChange("whatsapp")}>WhatsApp</button>
        <button type="button" className={channel === "email" ? "is-selected" : ""} aria-pressed={channel === "email"} onClick={() => onChange("email")}>E-mail</button>
      </div>
    </fieldset>
  );
}

function FormNotice({ error }: { error: string }) {
  return error ? <p className="contact-form__error" role="alert">{error}</p> : null;
}
