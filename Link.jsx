/*
  Link - the one place a design system usually fails 1.4.1. An accent-coloured
  link inside a paragraph is distinguished from the surrounding text by colour
  alone unless it is also underlined, so underline="always" is the default and
  the quieter underline="hover" is opt-in for places where the link is already
  distinguishable by position, like a nav row.

  external adds a visible icon plus text that says the link opens in a new tab,
  so the change of context is announced rather than sprung (3.2.5), and sets
  rel="noopener noreferrer" for the security footgun that comes with target.

  Depends only on .ds-sr from VISUALLYHIDDEN_CSS, for the new-tab warning.
*/

import { ExternalLink } from "lucide-react";

export function Link({
  href, children, external = false, underline = "always",
  newTabLabel = "(opens in a new tab)", ...rest
}) {
  return (
    <a
      href={href}
      className={`ds-link${underline === "hover" ? " hover-only" : ""}`}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      {...rest}
    >
      {children}
      {external && (
        <>
          <ExternalLink className="ds-link-ext" size={13} aria-hidden="true" />
          {/* The separating space is its own text node, a direct child of the
              anchor. Inside the span it would be trimmed away when the
              accessible name is computed, giving "Docs(opens in a new tab)". */}
          {" "}
          <span className="ds-sr">{newTabLabel}</span>
        </>
      )}
    </a>
  );
}

export const LINK_CSS = `
.ds-link{color:var(--accent-text);font-family:var(--font-body);cursor:pointer;
  text-decoration:underline;text-underline-offset:2px;text-decoration-thickness:1px;
  border-radius:min(var(--radius),4px);transition:text-decoration-thickness .1s}
.ds-link:hover{text-decoration-thickness:2px}
.ds-link.hover-only{text-decoration:none}
.ds-link.hover-only:hover,.ds-link.hover-only:focus-visible{text-decoration:underline}
.ds-link:focus-visible{outline:none;box-shadow:0 0 0 2px var(--bg),0 0 0 4px var(--ring)}
.ds-link-ext{display:inline-block;vertical-align:-1px;margin-left:3px;flex-shrink:0}
/* .ds-sr lives in VISUALLYHIDDEN_CSS - include that block alongside this one. */
@media (prefers-reduced-motion:reduce){.ds-link{transition:none}}
`;
