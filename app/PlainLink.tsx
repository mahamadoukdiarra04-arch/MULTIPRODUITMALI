import type { AnchorHTMLAttributes, ReactNode } from "react";

type PlainLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children?: ReactNode;
};

/**
 * A deliberately plain anchor used by the visual preview.
 *
 * The Vercel visual build is served by a lightweight worker rather than the
 * full Vinext runtime. Native anchors keep every internal destination usable
 * even when the client-side router is unavailable.
 */
export default function PlainLink({ href, children, ...props }: PlainLinkProps) {
  return <a href={href} {...props}>{children}</a>;
}
