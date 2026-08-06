/*
  Avatar - a person or workspace, as a picture or their initials.

  This is the component in the batch that best demonstrates the shape token.
  It is a square box reading --radius raw, with no clamp: at the sharp setting
  it is a rounded square, at the default it softens, and at the pill setting it
  resolves into a circle. Nothing else needs to change for an app to switch
  between the two conventions.

  The accessibility question here is 1.1.1, and it has two answers depending on
  what the avatar is for:

    · Next to the person's name, the picture is decorative - the name is
      already there - so alt="" keeps it out of the accessibility tree instead
      of announcing "Jane Cooper" twice. That is the default.
    · Standing alone, as the only identification, it carries information, so
      pass alt explicitly.

  Getting this wrong in the loud direction is the common one: an avatar in a
  comment thread announcing the author's name before every message.

  Initials are the fallback, and are always aria-hidden for the same reason -
  "JC" is a rendering of a name that the surrounding text already gives.
*/

const SIZE = { sm: 24, md: 36, lg: 48, xl: 64 };

function initialsFrom(name) {
  return String(name)
    .trim().split(/\s+/).slice(0, 2)
    .map((part) => part[0] || "")
    .join("")
    .toUpperCase();
}

export function Avatar({
  name, src, alt, size = "md", tone = "accent", className, ...rest
}) {
  const px = SIZE[size] || SIZE.md;
  const cls = ["ds-avatar", `tone-${tone}`, className].filter(Boolean).join(" ");
  const style = { width: px, height: px, fontSize: Math.round(px * 0.38) };

  if (src) {
    return (
      <img
        className={cls} style={style} src={src}
        // alt="" by default: beside a name, the picture repeats what is already
        // said. Pass alt when the avatar is the only identification.
        alt={alt ?? ""}
        width={px} height={px}
        {...rest}
      />
    );
  }

  return (
    <span className={cls} style={style} {...rest}>
      {alt ? <span className="ds-sr">{alt}</span> : null}
      <span aria-hidden="true">{initialsFrom(name || "?")}</span>
    </span>
  );
}

export const AVATAR_CSS = `
/* --radius raw and unclamped: a rounded square at Sharp, a circle at Pill. */
.ds-avatar{display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;
  border-radius:var(--radius);overflow:hidden;object-fit:cover;
  font-family:var(--font-body);font-weight:500;line-height:1;
  user-select:none;box-sizing:border-box}
.ds-avatar.tone-accent{background:var(--accent-tint);color:var(--accent-on-tint)}
.ds-avatar.tone-neutral{background:var(--disabled-bg);color:var(--text-2)}
`;
