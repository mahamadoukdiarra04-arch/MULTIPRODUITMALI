"use client";

import { useRef } from "react";

type MobileMenuProps = {
  navigation: readonly (readonly [label: string, href: string, mobileLabel?: string])[];
};

export function MobileMenu({ navigation }: MobileMenuProps) {
  const menuRef = useRef<HTMLDetailsElement>(null);
  const closeMenu = () => menuRef.current?.removeAttribute("open");

  return (
    <details className="mobile-menu" ref={menuRef}>
      <summary aria-label="Ouvrir la navigation"><i /><i /></summary>
      <nav aria-label="Navigation mobile">
        {navigation.map(([label, href, mobileLabel]) => (
          <a
            href={href}
            key={href}
            onClick={closeMenu}
          >
            {mobileLabel ?? label}
          </a>
        ))}
      </nav>
    </details>
  );
}
