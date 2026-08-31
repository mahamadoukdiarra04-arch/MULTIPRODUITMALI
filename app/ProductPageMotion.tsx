"use client";

import { useEffect, useRef, type ReactNode } from "react";

type NavigatorWithConnection = Navigator & {
  connection?: { saveData?: boolean };
};

type ProductPageMotionProps = {
  children: ReactNode;
  className: string;
  id?: string;
  labelledBy?: string;
  dataSection?: string;
};

export function ProductPageMotion({ children, className, id, labelledBy, dataSection }: ProductPageMotionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const saveData = Boolean((navigator as NavigatorWithConnection).connection?.saveData);
    let isIntersecting = true;

    const update = () => {
      const paused = document.hidden || !isIntersecting || reducedMotion.matches || saveData;
      section.dataset.motionState = paused ? "paused" : "running";
      section.dataset.saveData = saveData ? "true" : "false";
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isIntersecting = entry.isIntersecting;
        update();
      },
      { rootMargin: "120px 0px", threshold: 0.08 },
    );

    observer.observe(section);
    document.addEventListener("visibilitychange", update);
    reducedMotion.addEventListener("change", update);
    update();

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
      reducedMotion.removeEventListener("change", update);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={className}
      id={id}
      aria-labelledby={labelledBy}
      data-product-section={dataSection}
      data-motion-state="paused"
    >
      {children}
    </section>
  );
}
