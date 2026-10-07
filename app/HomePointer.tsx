import Link from "./PlainLink";

/** Small orientation cue shown on internal pages. The logo remains the primary home link. */
export function HomePointer() {
  return (
    <Link className="home-pointer" href="/" aria-label="Accueil Multiproduit Mali">
      <svg className="home-pointer__arrow" viewBox="0 0 44 28" aria-hidden="true" focusable="false">
        <path d="M42 23C37 11 27 6 18 8.5C10.5 10.5 6.5 13 3 16" />
        <path d="M4.5 7L3 16L12.5 15" />
      </svg>
      <small>Accueil</small>
    </Link>
  );
}
