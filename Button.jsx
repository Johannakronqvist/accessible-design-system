/*
  Button — reads only from CSS variables (var(--accent-fill), var(--radius),
  …), so it re-themes for free. Four variants × three sizes, icon-only,
  loading (sets aria-busy) and disabled states. Copy the component + its CSS
  block straight into your codebase.
*/

import { Loader2 } from "lucide-react";

const ICON = { sm: 14, md: 16, lg: 18 };

export function Button({
  variant = "primary", size = "md", loading = false, disabled = false,
  iconOnly = false, leftIcon: LI, rightIcon: RI, children, ariaLabel,
  // type defaults to "button": a bare <button> inside a form submits it, which
  // is almost never what a design-system button is being asked to do.
  type = "button", ...rest
}) {
  const cls = `ds-btn ${variant} ${size}${iconOnly ? " icon-only" : ""}`;
  const s = ICON[size];
  return (
    <button
      type={type}
      className={cls}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      aria-label={ariaLabel}
      {...rest}
    >
      {loading ? <Loader2 className="ds-spin" size={s} /> : LI ? <LI size={s} /> : null}
      {!iconOnly && children}
      {!loading && RI ? <RI size={s} /> : null}
    </button>
  );
}

export const BUTTON_CSS = `
.ds-btn{font-family:var(--font-body);font-weight:500;border:1.5px solid transparent;
  box-sizing:border-box;min-height:var(--target-min);
  border-radius:var(--radius);cursor:pointer;display:inline-flex;align-items:center;
  justify-content:center;gap:7px;outline:none;line-height:1.2;
  transition:background .12s,transform .08s,box-shadow .12s,filter .12s}
.ds-btn.sm{padding:6px 12px;font-size:13px}
.ds-btn.md{padding:9px 16px;font-size:14px}
.ds-btn.lg{padding:12px 20px;font-size:16px;min-height:var(--target-touch)}
.ds-btn.icon-only{padding:9px;min-width:var(--target-min)}
.ds-btn.icon-only.sm{padding:6px}.ds-btn.icon-only.lg{padding:12px}
.ds-btn.primary{background:var(--accent-fill);color:var(--accent-on-fill)}
.ds-btn.primary:hover{background:var(--accent-fill-hover)}
.ds-btn.primary:active{background:var(--accent-fill-active);transform:scale(.98)}
.ds-btn.secondary{background:var(--secondary-bg);color:var(--secondary-text);border-color:var(--secondary-border)}
.ds-btn.secondary:hover{background:var(--secondary-bg-hover)}
.ds-btn.secondary:active{transform:scale(.98)}
.ds-btn.ghost{background:transparent;color:var(--accent-text)}
.ds-btn.ghost:hover{background:var(--accent-tint)}
.ds-btn.ghost:active{transform:scale(.98)}
.ds-btn.danger{background:var(--danger-fill);color:#fff}
.ds-btn.danger:hover{filter:brightness(.92)}
.ds-btn.danger:active{transform:scale(.98)}
.ds-btn:focus-visible{box-shadow:0 0 0 2px var(--bg),0 0 0 4px var(--ring)}
.ds-btn:disabled{background:var(--disabled-bg);color:var(--disabled-text);
  border-color:var(--disabled-border);cursor:not-allowed;transform:none;filter:none}
.ds-spin{animation:ds-spin .6s linear infinite}
@keyframes ds-spin{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.ds-btn{transition:none}.ds-spin{animation:none}}
`;
