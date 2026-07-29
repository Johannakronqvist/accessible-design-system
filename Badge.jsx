/*
  Badge — solid (default) and soft variants across six tones (neutral, accent,
  success, warning, danger, info), each verified AA in light and dark. Reads
  the --bd-<tone>-* CSS vars the theme layer emits from BADGE_TONES (./tokens).
  The label always states the meaning, so nothing rests on color alone; the
  removable tag's × is a real button with an aria-label. Radius follows shape.
*/

import { useState } from "react";
import { X } from "lucide-react";

export function Badge({ tone = "neutral", variant = "solid", children, onRemove, removeLabel }) {
  const colors = variant === "soft"
    ? { background: `var(--bd-${tone}-sb)`, color: `var(--bd-${tone}-sf)` }
    : { background: `var(--bd-${tone}-lb)`, color: `var(--bd-${tone}-lf)` };
  return (
    <span className="ds-badge2" style={colors}>
      {children}
      {onRemove && (
        <button type="button" className="ds-badge-x" onClick={onRemove} aria-label={removeLabel || "Remove"}>
          <X size={12} aria-hidden="true" />
        </button>
      )}
    </span>
  );
}

// Stateful demo of removable tags, used by the style guide.
export function TagDemo() {
  const [tags, setTags] = useState(["Design", "Research", "Frontend"]);
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      {tags.map((t) => (
        <Badge key={t} tone="accent" variant="soft" removeLabel={`Remove ${t}`}
          onRemove={() => setTags((x) => x.filter((y) => y !== t))}>{t}</Badge>
      ))}
      {tags.length === 0 && <span style={{ fontSize: "var(--fs-sm)", color: "var(--text-2)" }}>All removed.</span>}
    </div>
  );
}

export const BADGE_CSS = `
.ds-badge2{display:inline-flex;align-items:center;gap:6px;font-family:var(--font-body);
  font-size:var(--fs-sm);font-weight:500;padding:3px 10px;border-radius:var(--radius);
  line-height:1.5;box-sizing:border-box;white-space:nowrap}
.ds-badge-x{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;
  margin:0 -4px 0 0;padding:0;border:none;border-radius:50%;background:transparent;color:inherit;cursor:pointer;opacity:.75}
.ds-badge-x:hover{opacity:1;background:rgba(120,90,90,0.16)}
.ds-badge-x:focus-visible{outline:none;box-shadow:0 0 0 2px var(--surface),0 0 0 3px currentColor}
`;
