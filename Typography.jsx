/*
  Heading and Text - the components that finally make the generated type scale
  usable. The scale has always been derived from one base size and ratio, but
  nothing consumed it: the style guide inlines fontSize: "var(--fs-*)" eleven
  times, and a consuming app had no better option.

  The important prop is the one that looks redundant. Heading takes `level` and
  `size` separately, because they answer different questions:

    level  - where this sits in the document outline (1.3.1, 2.4.10)
    size   - how big it looks

  Conflating them is the most common heading-order bug in the world. Someone
  wants smaller text, picks <h4> under an <h2>, and quietly breaks the outline
  that screen reader users navigate by. Here you keep the level correct and
  shrink the size:

    <Heading level={3} size="base">Billing address</Heading>

  size defaults to a sensible step for the level, so the common case is just
  <Heading level={2}>.
*/

const SIZE_FOR_LEVEL = { 1: "3xl", 2: "2xl", 3: "xl", 4: "lg", 5: "base", 6: "sm" };

export function Heading({
  level = 2, size, display = true, tone = "default", children, className, ...rest
}) {
  const Tag = `h${level}`;
  const resolved = size || SIZE_FOR_LEVEL[level] || "xl";
  return (
    <Tag
      className={["ds-heading", `fs-${resolved}`, display ? "display" : "body", `tone-${tone}`, className]
        .filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function Text({
  as: Tag = "p", size = "base", tone = "default", weight = "regular",
  measure = false, children, className, ...rest
}) {
  return (
    <Tag
      className={["ds-text", `fs-${size}`, `tone-${tone}`, `w-${weight}`, measure ? "measure" : "", className]
        .filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export const TYPOGRAPHY_CSS = `
.ds-heading{margin:0;line-height:1.2;text-wrap:balance;color:var(--text-1)}
.ds-heading.display{font-family:var(--font-display);font-weight:500}
.ds-heading.body{font-family:var(--font-body);font-weight:600}
.ds-text{margin:0;font-family:var(--font-body);line-height:1.6;color:var(--text-1)}
/* One scale, shared by both, so a Heading at size="base" and a Text at
   size="base" are genuinely the same size. */
.ds-heading.fs-sm,.ds-text.fs-sm{font-size:var(--fs-sm)}
.ds-heading.fs-base,.ds-text.fs-base{font-size:var(--fs-base)}
.ds-heading.fs-lg,.ds-text.fs-lg{font-size:var(--fs-lg)}
.ds-heading.fs-xl,.ds-text.fs-xl{font-size:var(--fs-xl)}
.ds-heading.fs-2xl,.ds-text.fs-2xl{font-size:var(--fs-2xl)}
.ds-heading.fs-3xl,.ds-text.fs-3xl{font-size:var(--fs-3xl)}
.ds-heading.tone-muted,.ds-text.tone-muted{color:var(--text-2)}
.ds-heading.tone-accent,.ds-text.tone-accent{color:var(--accent-text)}
.ds-text.w-medium{font-weight:500}
.ds-text.w-semibold{font-weight:600}
/* Caps the measure near 65 characters, where running text stays comfortable. */
.ds-text.measure{max-width:65ch}
`;
