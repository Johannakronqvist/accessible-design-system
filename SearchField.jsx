/*
  SearchField - a labelled search input inside a role=search landmark, with a
  clear button that only exists when there is something to clear and that
  returns focus to the input. The browser's own WebKit clear affordance is
  hidden because it is not keyboard reachable; ours is a real 24px button with
  a label. Pass resultCount to get a polite status region that announces how
  many results a search returned (4.1.3) without stealing focus.

  Reuses .ds-field / .ds-field-label / .ds-field-hint / .ds-input / .ds-sr
  from FIELD_CSS.
*/

import { useState, useRef } from "react";
import { Search, X } from "lucide-react";
import { nextId } from "./id";

export function SearchField({
  label = "Search", hint, placeholder = "Search…", defaultValue = "",
  disabled = false, hideLabel = false, clearLabel = "Clear search",
  onSearch, resultCount, resultLabel,
}) {
  const [id] = useState(() => nextId("ds-search"));
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef(null);

  const hintId = hint ? `${id}-hint` : undefined;
  const clear = () => { setValue(""); onSearch?.(""); inputRef.current?.focus(); };

  const status = resultCount == null ? "" :
    resultLabel ? resultLabel(resultCount) :
    `${resultCount} ${resultCount === 1 ? "result" : "results"}`;

  return (
    // aria-label names the landmark, so several searches on one page stay distinguishable.
    <div className="ds-field" role="search" aria-label={label}>
      <label htmlFor={id} className={hideLabel ? "ds-sr" : "ds-field-label"}>{label}</label>
      {hint && <div id={hintId} className="ds-field-hint">{hint}</div>}
      <div className="ds-search-wrap">
        <Search size={16} className="ds-search-ic" aria-hidden="true" />
        <input
          ref={inputRef} id={id} type="search" placeholder={placeholder} disabled={disabled}
          value={value} aria-describedby={hintId}
          onChange={(e) => { setValue(e.target.value); onSearch?.(e.target.value); }}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); onSearch?.(value); }
            // Escape clears in place, matching the platform convention.
            if (e.key === "Escape" && value) { e.preventDefault(); clear(); }
          }}
          className="ds-input ds-search-in"
        />
        {value && !disabled && (
          <button type="button" className="ds-search-x" onClick={clear} aria-label={clearLabel}>
            <X size={14} aria-hidden="true" />
          </button>
        )}
      </div>
      {resultCount != null && <div className="ds-field-hint" role="status">{status}</div>}
    </div>
  );
}

export const SEARCH_CSS = `
.ds-search-wrap{position:relative;display:flex;align-items:center}
.ds-search-ic{position:absolute;left:13px;color:var(--text-2);pointer-events:none}
.ds-search-in{padding-left:37px;padding-right:40px}
.ds-search-in::-webkit-search-cancel-button,
.ds-search-in::-webkit-search-decoration{-webkit-appearance:none;appearance:none}
.ds-search-x{position:absolute;right:9px;display:inline-flex;align-items:center;justify-content:center;
  width:var(--target-min);height:var(--target-min);padding:0;border:none;border-radius:50%;
  background:transparent;color:var(--text-2);cursor:pointer}
.ds-search-x:hover{background:var(--accent-tint);color:var(--accent-on-tint)}
.ds-search-x:focus-visible{outline:none;box-shadow:0 0 0 2px var(--surface),0 0 0 4px var(--ring)}
`;
