/* eslint-disable @next/next/no-img-element -- product packshots are lightweight visual selections inside client-side controls. */
"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";

type ContactMode = "choice" | "partnership" | "general" | "success";
type PartnerBrand = "tropicoul" | "triplex";
type ContactChannel = "email" | "whatsapp";

type ContactExperienceProps = {
  initialMode?: "partnership" | "general";
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
  collaborationType: string;
  message: string;
  preferredChannel: ContactChannel;
  email: string;
  phone: string;
};

type GeneralData = {
  name: string;
  message: string;
  preferredChannel: ContactChannel;
  email: string;
  phone: string;
};

type Receipt = {
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

const countrySuggestions = [
  "Mali", "Burkina Faso", "Côte d’Ivoire", "Guinée", "Niger", "Sénégal",
  "Bénin", "Togo", "Ghana", "Cameroun", "France", "Maroc", "Algérie",
] as const;

const collaborationChoices = ["Distribution", "Point de vente", "Événement", "Autre"] as const;

function partnershipInitialData(initialBrand?: PartnerBrand, initialFlavour?: string): PartnershipData {
  const matchedFlavour = tropicoulFlavours.find((flavour) => flavour.slug === initialFlavour)?.name;
  return {
    name: "",
    company: "",
    role: "",
    country: "Mali",
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

function generalInitialData(): GeneralData {
  return { name: "", message: "", preferredChannel: "email", email: "", phone: "" };
}

function labelForBrand(brand: PartnerBrand) {
  return brand === "tropicoul" ? "Tropicoul" : "Triplex";
}

export function ContactExperience({ initialMode, initialBrand, initialFlavour, source = "contact" }: ContactExperienceProps) {
  const [mode, setMode] = useState<ContactMode>(initialMode ?? "choice");
  const [step, setStep] = useState(1);
  const [partnership, setPartnership] = useState<PartnershipData>(() => partnershipInitialData(initialBrand, initialFlavour));
  const [general, setGeneral] = useState<GeneralData>(generalInitialData);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  const selectedFlavourNames = useMemo(
    () => partnership.tropicoulAll ? ["Toute la gamme"] : partnership.flavours,
    [partnership.flavours, partnership.tropicoulAll],
  );

  const begin = (nextMode: "partnership" | "general") => {
    setMode(nextMode);
    setStep(1);
    setError("");
    setReceipt(null);
  };

  const changeRequest = () => {
    setMode("choice");
    setStep(1);
    setError("");
  };

  const updatePartnership = <K extends keyof PartnershipData>(key: K, value: PartnershipData[K]) => {
    setPartnership((current) => ({ ...current, [key]: value }));
  };

  const updateGeneral = <K extends keyof GeneralData>(key: K, value: GeneralData[K]) => {
    setGeneral((current) => ({ ...current, [key]: value }));
  };

  const selectBrand = (brand: PartnerBrand) => {
    setPartnership((current) => {
      const hasBrand = current.brands.includes(brand);
      const brands = hasBrand ? current.brands.filter((item) => item !== brand) : [...current.brands, brand];
      return {
        ...current,
        brands,
        ...(brand === "tropicoul" && hasBrand ? { flavours: [], tropicoulAll: false } : {}),
      };
    });
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
    if (step === 1 && (!partnership.name || !partnership.company || !partnership.country)) {
      setError("Indiquez votre nom, votre entreprise et votre pays pour continuer.");
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

  const submit = async (event: FormEvent<HTMLFormElement>, kind: "partnership" | "general") => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const data = kind === "partnership" ? {
      kind,
      name: partnership.name,
      company: partnership.company,
      role: partnership.role,
      country: partnership.country,
      city: partnership.city,
      brands: partnership.brands.map(labelForBrand),
      flavours: selectedFlavourNames,
      collaborationType: partnership.collaborationType,
      preferredChannel: partnership.preferredChannel,
      email: partnership.email,
      phone: partnership.phone,
      message: partnership.message,
      source,
    } : {
      kind,
      name: general.name,
      company: "",
      role: "",
      country: "",
      city: "",
      brands: [],
      flavours: [],
      collaborationType: "",
      preferredChannel: general.preferredChannel,
      email: general.email,
      phone: general.phone,
      message: general.message,
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
        {!receipt?.whatsappUrl && receipt?.delivery === "pending" ? <p className="contact-success__note">L’échange sera poursuivi par le canal de réponse choisi.</p> : null}
        <div className="contact-success__links">
          <Link href="/#marques">Retourner aux produits</Link>
          <Link href="/">Retour à l’accueil</Link>
          <button type="button" onClick={changeRequest}>Faire une autre demande</button>
        </div>
      </section>
    );
  }

  if (mode === "choice") {
    return (
      <section className="contact-choice" aria-labelledby="contact-title">
        <div className="contact-choice__heading">
          <p className="section-kicker">PRENONS CONTACT</p>
          <h1 id="contact-title">Choisissez simplement le point de départ qui vous ressemble.</h1>
          <p>Que vous souhaitiez développer une présence commerciale ou poser une question, nous vous orientons vers le bon échange.</p>
        </div>
        <div className="contact-choice__cards">
          <button className="contact-path-card contact-path-card--partnership" type="button" onClick={() => begin("partnership")}>
            <span className="contact-path-card__eyebrow">PARTENARIAT</span>
            <strong>Construire un partenariat</strong>
            <small>Distribution, développement commercial, point de vente ou événement.</small>
            <span className="contact-path-card__products" aria-hidden="true">
              <img src="/media/mpm/products/tropicoul-ananas/packshot.webp" alt="" />
              <img src="/media/mpm/products/tropicoul-goyave/packshot.webp" alt="" />
              <img src="/media/mpm/products/triplex/packshot.webp" alt="" />
            </span>
            <i aria-hidden="true">↗</i>
          </button>
          <button className="contact-path-card contact-path-card--general" type="button" onClick={() => begin("general")}>
            <span className="contact-path-card__eyebrow">CONTACT GÉNÉRAL</span>
            <strong>Écrire à l’équipe</strong>
            <small>Pour toute question, message ou demande différente.</small>
            <span className="contact-path-card__institution" aria-hidden="true">MM</span>
            <i aria-hidden="true">↗</i>
          </button>
        </div>
      </section>
    );
  }

  if (mode === "general") {
    return (
      <section className="contact-general" aria-labelledby="general-contact-title">
        <div className="contact-general__intro">
          <button className="contact-change-request" type="button" onClick={changeRequest}>← Changer de demande</button>
          <p className="section-kicker">CONTACT GÉNÉRAL</p>
          <h1 id="general-contact-title">Comment pouvons-nous vous aider ?</h1>
          <p>Expliquez-nous votre demande avec vos propres mots. Nous vous répondrons par le canal qui vous convient.</p>
        </div>
        <form className="contact-form contact-form--general" onSubmit={(event) => submit(event, "general")}>
          <label className="contact-field">
            <span>Nom</span>
            <input value={general.name} onChange={(event) => updateGeneral("name", event.target.value)} autoComplete="name" required />
          </label>
          <label className="contact-field contact-field--wide">
            <span>Votre message</span>
            <textarea value={general.message} onChange={(event) => updateGeneral("message", event.target.value)} rows={7} required />
          </label>
          <ChannelChoice channel={general.preferredChannel} onChange={(channel) => updateGeneral("preferredChannel", channel)} />
          {general.preferredChannel === "email" ? (
            <label className="contact-field">
              <span>Adresse e-mail</span>
              <input type="email" value={general.email} onChange={(event) => updateGeneral("email", event.target.value)} autoComplete="email" required />
            </label>
          ) : (
            <label className="contact-field">
              <span>Numéro WhatsApp</span>
              <input type="tel" value={general.phone} onChange={(event) => updateGeneral("phone", event.target.value)} autoComplete="tel" required />
            </label>
          )}
          <FormNotice error={error} />
          <button className="contact-primary-action" type="submit" disabled={submitting}>{submitting ? "Transmission…" : general.preferredChannel === "whatsapp" ? "Continuer sur WhatsApp" : "Envoyer le message"} <span aria-hidden="true">↗</span></button>
        </form>
      </section>
    );
  }

  return (
    <section className={"contact-partnership contact-partnership--step-" + step} aria-labelledby="partnership-contact-title">
      <div className="contact-partnership__intro">
        <button className="contact-change-request" type="button" onClick={changeRequest}>← Changer de demande</button>
        <p className="section-kicker">PARTENARIAT</p>
        <h1 id="partnership-contact-title">Construisons une présence qui a du goût.</h1>
        <p>Quelques informations suffisent pour préparer le bon échange avec l’équipe Multiproduit Mali.</p>
      </div>

      <form className="contact-form contact-form--partnership" onSubmit={(event) => submit(event, "partnership")}>
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
              <label className="contact-field"><span>Pays</span><input value={partnership.country} onChange={(event) => updatePartnership("country", event.target.value)} list="contact-country-options" autoComplete="country-name" required /></label>
              <label className="contact-field"><span>Ville <em>facultatif</em></span><input value={partnership.city} onChange={(event) => updatePartnership("city", event.target.value)} autoComplete="address-level2" /></label>
            </div>
            <datalist id="contact-country-options">{countrySuggestions.map((country) => <option key={country} value={country} />)}</datalist>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="contact-step">
            <div className="contact-step__heading"><p>ÉTAPE 2</p><h2>Les produits qui vous intéressent</h2></div>
            <div className="contact-brand-options">
              <button className={"contact-brand-card contact-brand-card--tropicoul" + (partnership.brands.includes("tropicoul") ? " is-selected" : "")} type="button" aria-pressed={partnership.brands.includes("tropicoul")} onClick={() => selectBrand("tropicoul")}>
                <span><small>TROPICOUL</small><strong>Une gamme fruitée, colorée et généreuse.</strong></span>
                <div aria-hidden="true"><img src="/media/mpm/products/tropicoul-ananas/packshot.webp" alt="" /><img src="/media/mpm/products/tropicoul-mangue/packshot.webp" alt="" /><img src="/media/mpm/products/tropicoul-goyave/packshot.webp" alt="" /></div>
                <i aria-hidden="true">{partnership.brands.includes("tropicoul") ? "✓" : "+"}</i>
              </button>
              <button className={"contact-brand-card contact-brand-card--triplex" + (partnership.brands.includes("triplex") ? " is-selected" : "")} type="button" aria-pressed={partnership.brands.includes("triplex")} onClick={() => selectBrand("triplex")}>
                <span><small>TRIPLEX</small><strong>L’énergie intense prête à garder le rythme.</strong></span>
                <img src="/media/mpm/products/triplex/packshot.webp" alt="" aria-hidden="true" />
                <i aria-hidden="true">{partnership.brands.includes("triplex") ? "✓" : "+"}</i>
              </button>
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
            {partnership.brands.includes("triplex") ? <p className="contact-triplex-choice">✓ Triplex Original sélectionné</p> : null}
            <div className="contact-collaboration">
              <p>Comment souhaitez-vous collaborer ? <em>facultatif</em></p>
              <div>{collaborationChoices.map((choice) => <button type="button" className={partnership.collaborationType === choice ? "is-selected" : ""} aria-pressed={partnership.collaborationType === choice} key={choice} onClick={() => updatePartnership("collaborationType", partnership.collaborationType === choice ? "" : choice)}>{choice}</button>)}</div>
            </div>
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
          {step < 3 ? <button className="contact-primary-action" type="button" onClick={nextStep}>Continuer <span aria-hidden="true">→</span></button> : <button className="contact-primary-action" type="submit" disabled={submitting}>{submitting ? "Transmission…" : partnership.preferredChannel === "whatsapp" ? "Continuer sur WhatsApp" : "Envoyer la demande"} <span aria-hidden="true">↗</span></button>}
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
