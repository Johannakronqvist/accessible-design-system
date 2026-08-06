/*
  Divider - a rule between things.

  Without a label it is an <hr>, which already carries role="separator" and
  needs no ARIA at all.

  With a label it becomes a div with role="separator" and an aria-label. The
  aria-label is not optional decoration: role="separator" takes its name from
  the author, not from its contents, so a labelled divider that only renders
  the text is announced as an anonymous separator and the word is lost. With
  the name set, the visible rendering - text and flanking rules alike - is
  decorative and hidden, so it is announced once rather than twice.

  No shape token here on purpose. A 1px rule has no corners to round, and
  giving it a radius at the pill setting would produce nothing visible while
  implying the token does something it does not.

  emphasis="strong" swaps --border for --border-interactive, for when the rule
  separates regions rather than list rows and needs to be read as structure.
*/

export function Divider({
  orientation = "horizontal", label, spacing = "md", emphasis = "subtle",
  className, ...rest
}) {
  const cls = ["ds-divider", orientation, `sp-${spacing}`, `em-${emphasis}`, className]
    .filter(Boolean).join(" ");

  if (!label) {
    return orientation === "vertical"
      ? <div className={cls} role="separator" aria-orientation="vertical" {...rest} />
      : <hr className={cls} {...rest} />;
  }

  return (
    // The name has to come from aria-label: role="separator" takes its name from
    // the author, not from its contents, so the visible text alone would leave it
    // anonymous. With the name set, the rendering below is decorative.
    <div
      className={`${cls} labelled`} role="separator"
      aria-orientation={orientation} aria-label={label} {...rest}
    >
      <span className="ds-divider-line" aria-hidden="true" />
      <span className="ds-divider-label" aria-hidden="true">{label}</span>
      <span className="ds-divider-line" aria-hidden="true" />
    </div>
  );
}

export const DIVIDER_CSS = `
/* 1px, not the .5px hairline the rest of the system uses on surfaces. A card or
   listbox border sits between two different backgrounds, so a hairline reads;
   a divider has the same colour on both sides and nothing else to help it. Sub-
   pixel widths also render inconsistently off retina, where .5px can round away
   to nothing - on the one element whose whole job is to be visible. */
.ds-divider{border:none;background:var(--border)}
.ds-divider.horizontal{height:1px;width:100%}
.ds-divider.vertical{width:1px;align-self:stretch;min-height:1em}
/* When it has to carry real weight - separating regions rather than list rows. */
.ds-divider.em-strong,.ds-divider.em-strong .ds-divider-line{background:var(--border-interactive)}
.ds-divider.sp-none{margin:0}
.ds-divider.horizontal.sp-sm{margin:var(--space-1) 0}
.ds-divider.horizontal.sp-md{margin:var(--space-2) 0}
.ds-divider.horizontal.sp-lg{margin:var(--space-4) 0}
.ds-divider.vertical.sp-sm{margin:0 var(--space-1)}
.ds-divider.vertical.sp-md{margin:0 var(--space-2)}
.ds-divider.vertical.sp-lg{margin:0 var(--space-4)}
.ds-divider.labelled{display:flex;align-items:center;gap:12px;background:none;height:auto}
.ds-divider-line{flex:1;height:1px;background:var(--border)}
.ds-divider-label{font-family:var(--font-body);font-size:var(--fs-sm);color:var(--text-2);
  white-space:nowrap}
`;
