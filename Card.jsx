/*
  Card - a surface. The most-used pattern in the system, and until now the only
  implementation lived in the style guide's own CSS, used 33 times and available
  to nobody else. This is that class, promoted and owned here; the guide's
  existing .ds-card markup keeps working because the class name is unchanged.

  Shape follows the token with the container step-up the system uses everywhere
  a box holds other boxes: min(calc(var(--radius) + 4px), 18px). A container
  reads slightly rounder than its contents, and the ceiling stops a card full of
  text turning into a lozenge at the pill setting.

  title renders a real heading at the level you pass, because a card is usually
  a section and a section usually needs to be findable in the heading order
  (1.3.1). Pass no title and you get a plain surface.

  It stays a div by default and does not accept an onClick. A clickable card is
  a link or a button - pass as="a" with an href, or put a real control inside
  and let it own the interaction, rather than making a div pretend.
*/

export function Card({
  as: Tag = "div", title, headingLevel = 3, footer,
  padding = "md", children, className, ...rest
}) {
  const Heading = `h${headingLevel}`;
  return (
    <Tag className={["ds-card", `pad-${padding}`, className].filter(Boolean).join(" ")} {...rest}>
      {title && <Heading className="ds-card-title">{title}</Heading>}
      {children}
      {footer && <div className="ds-card-foot">{footer}</div>}
    </Tag>
  );
}

export const CARD_CSS = `
/* Padding is a token, not a number, so density follows spacingUnit with
   everything else. At the default 8px unit this is the 24px the guide has
   always used, so its 33 existing .ds-card usages are unchanged. */
.ds-card{background:var(--surface);border:.5px solid var(--border);
  border-radius:min(calc(var(--radius) + 4px), 18px);padding:var(--space-3)}
.ds-card.pad-none{padding:0}
.ds-card.pad-sm{padding:var(--space-2)}
.ds-card.pad-md{padding:var(--space-3)}
.ds-card.pad-lg{padding:var(--space-4)}
.ds-card-title{font-family:var(--font-display);font-weight:500;font-size:var(--fs-lg);
  line-height:1.3;color:var(--text-1);margin:0 0 10px}
.ds-card-foot{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px;
  margin-top:var(--space-2);padding-top:var(--space-2);border-top:.5px solid var(--border)}
`;
