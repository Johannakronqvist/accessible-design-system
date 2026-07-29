/*
  Alert / Callout — soft tint across four tones, each with an icon and text so
  severity never rests on color alone (1.4.1); the icon is sized up as the
  primary non-color cue. Reads the --al-<tone>-* CSS vars the theme layer emits
  from ALERT_TONES (./tokens). Pass live="assertive" (role=alert) or
  live="polite" (role=status) for dynamically inserted alerts; static callouts
  stay silent to assistive tech. The dismiss is a real 24px button with a label.
*/

import { useState } from "react";
import { X, Info, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import { Stack } from "./Layout";

export const ALERT_ICON = { info: Info, success: CheckCircle2, warning: AlertTriangle, danger: AlertCircle };

export function Alert({ tone = "info", title, children, onDismiss, dismissLabel, live }) {
  const Icon = ALERT_ICON[tone] || Info;
  const role = live === "assertive" ? "alert" : live === "polite" ? "status" : undefined;
  return (
    <div className="ds-alert" role={role} style={{
      background: `var(--al-${tone}-bg)`, borderColor: `var(--al-${tone}-border)`,
      "--a-bg": `var(--al-${tone}-bg)`, "--a-head": `var(--al-${tone}-head)`, "--a-body": `var(--al-${tone}-body)`,
    }}>
      <Icon className="ds-alert-ic" size={23} aria-hidden="true" />
      <div className="ds-alert-body">
        {title && <p className="ds-alert-h">{title}</p>}
        {children && <p className="ds-alert-t">{children}</p>}
      </div>
      {onDismiss && (
        <button type="button" className="ds-alert-x" onClick={onDismiss} aria-label={dismissLabel || "Dismiss"}>
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

// Stateful demo of dismissible alerts, used by the style guide.
export function AlertDemo() {
  const items = [
    { tone: "info", title: "Your trial ends soon", body: "Your free trial ends in 3 days. Add a payment method now to keep your workspace and avoid any interruption for your team." },
    { tone: "success", title: "Changes saved", body: "Your workspace settings were updated. It may take a few minutes for everyone on your team to see the new configuration." },
    { tone: "warning", title: "Approaching your limit", body: "You've used 90% of your monthly quota. Consider upgrading your plan to avoid throttling later this month." },
    { tone: "danger", title: "Payment failed", body: "We couldn't process your card ending in 4242. Please update your billing details to restore access to premium features." },
  ];
  const [shown, setShown] = useState(items.map((_, i) => i));
  return (
    <Stack gap="12px">
      {items.map((a, i) => shown.includes(i) && (
        <Alert key={i} tone={a.tone} title={a.title} dismissLabel={`Dismiss: ${a.title}`}
          onDismiss={() => setShown((s) => s.filter((x) => x !== i))}>{a.body}</Alert>
      ))}
      {shown.length < items.length && (
        <button type="button" className="ds-btn ghost sm" style={{ alignSelf: "flex-start" }}
          onClick={() => setShown(items.map((_, i) => i))}>Reset alerts</button>
      )}
    </Stack>
  );
}

export const ALERT_CSS = `
.ds-alert{display:flex;gap:12px;padding:14px 14px 14px 15px;border:.5px solid;
  border-radius:min(calc(var(--radius) + 2px),14px);align-items:flex-start}
.ds-alert-ic{flex-shrink:0;margin-top:1px;color:var(--a-head)}
.ds-alert-body{flex:1;min-width:0}
.ds-alert-h{font-family:var(--font-body);font-size:var(--fs-base);font-weight:600;line-height:1.35;margin:0 0 3px;color:var(--a-head)}
.ds-alert-t{font-family:var(--font-body);font-size:var(--fs-sm);line-height:1.55;margin:0;color:var(--a-body)}
.ds-alert-x{flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;
  margin:-2px -3px 0 0;padding:0;border:none;border-radius:50%;background:transparent;color:var(--a-head);cursor:pointer;opacity:.7}
.ds-alert-x:hover{opacity:1;background:rgba(120,90,90,0.12)}
.ds-alert-x:focus-visible{outline:none;box-shadow:0 0 0 2px var(--a-bg),0 0 0 3px currentColor}
`;
