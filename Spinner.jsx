/*
  Spinner - a busy indicator that says what it is.

  role="status" carries an implicit aria-live="polite", so the label is
  announced when the spinner appears without interrupting whatever is being
  read (4.1.3). A bare spinning icon with no accessible name is silence to a
  screen reader, which is the usual failure.

  The reduced-motion handling is the interesting part. Most implementations
  stop the animation under prefers-reduced-motion and leave a static shape,
  which then conveys nothing at all - the user has traded a spinning circle for
  a stationary one. Here the animation stops *and* the label becomes visible,
  so the meaning survives the motion being removed rather than going with it.

  Reuses the .ds-spin keyframes from BUTTON_CSS, which Button's loading state
  already defines.
*/

const SIZE = { sm: 16, md: 20, lg: 28 };

export function Spinner({ size = "md", label = "Loading", labelVisible = false, className, ...rest }) {
  return (
    <span
      className={["ds-spinner", labelVisible ? "label-visible" : "", className].filter(Boolean).join(" ")}
      role="status"
      {...rest}
    >
      <svg
        className="ds-spin ds-spinner-mark" width={SIZE[size]} height={SIZE[size]}
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" aria-hidden="true"
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
      <span className="ds-spinner-label">{label}</span>
    </span>
  );
}

export const SPINNER_CSS = `
.ds-spinner{display:inline-flex;align-items:center;gap:9px;color:var(--accent-text);
  font-family:var(--font-body);font-size:var(--fs-sm)}
.ds-spinner-mark{flex-shrink:0}
.ds-spinner-label{position:absolute;width:1px;height:1px;padding:0;margin:-1px;
  overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
.ds-spinner.label-visible .ds-spinner-label{position:static;width:auto;height:auto;
  margin:0;overflow:visible;clip:auto;white-space:normal;color:var(--text-2)}
/* When motion is removed the spin conveys nothing, so the words take over. */
@media (prefers-reduced-motion:reduce){
  .ds-spinner .ds-spinner-label{position:static;width:auto;height:auto;margin:0;
    overflow:visible;clip:auto;white-space:normal;color:var(--text-2)}
}
`;
