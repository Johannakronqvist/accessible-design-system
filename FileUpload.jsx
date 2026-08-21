/*
  FileUpload - drag and drop is an enhancement here, never the only way in.
  The primary control is a real <input type="file"> paired with a <label>, so
  the same action is available by keyboard, by click and by touch with no
  dragging at all (2.5.7). The input stays in the tab order (it is hidden with
  opacity, not display:none) and its focus ring is drawn on the label.

  Chosen files are listed as text with a labelled remove button each, and a
  polite status region reports what was added, rejected or removed (4.1.3),
  so the result of a drop is never conveyed by the visual list alone.

  Reuses .ds-field / .ds-field-label / .ds-field-hint / .ds-field-err /
  .ds-sr / .ds-req from FIELD_CSS.
*/

import { useState, useRef } from "react";
import { UploadCloud, File as FileIcon, X, AlertCircle } from "lucide-react";
import { nextId } from "./id";

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Matches the accept syntax: ".pdf", "image/*", "text/csv".
function matchesAccept(file, accept) {
  if (!accept) return true;
  return accept.split(",").map((a) => a.trim().toLowerCase()).some((a) => {
    if (a.startsWith(".")) return file.name.toLowerCase().endsWith(a);
    if (a.endsWith("/*")) return file.type.startsWith(a.slice(0, -1));
    return file.type.toLowerCase() === a;
  });
}

export function FileUpload({
  label = "Attachments", hint, error, required = false, disabled = false,
  accept, multiple = false, maxSizeMB,
  buttonLabel = "Choose file", dropLabel = "or drag and drop here",
  removeLabel = "Remove",
}) {
  const [id] = useState(() => nextId("ds-file"));
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [rejected, setRejected] = useState(null);
  const [status, setStatus] = useState("");
  const inputRef = useRef(null);

  const hintId = hint ? `${id}-hint` : undefined;
  const errId = (error || rejected) ? `${id}-err` : undefined;
  const listId = files.length ? `${id}-list` : undefined;
  const describedBy = [hintId, listId, errId].filter(Boolean).join(" ") || undefined;

  const accepted = (incoming) => {
    const ok = [];
    const bad = [];
    for (const f of incoming) {
      if (!matchesAccept(f, accept)) bad.push(`${f.name} is not an accepted file type`);
      else if (maxSizeMB && f.size > maxSizeMB * 1024 * 1024) bad.push(`${f.name} is larger than ${maxSizeMB} MB`);
      else ok.push(f);
    }
    return { ok, bad };
  };

  const add = (incoming) => {
    if (disabled || !incoming.length) return;
    const { ok, bad } = accepted(Array.from(incoming));
    setRejected(bad.length ? bad.join(". ") + "." : null);
    if (!ok.length) return;
    setFiles((prev) => (multiple ? [...prev, ...ok] : ok.slice(0, 1)));
    setStatus(`${ok.length} ${ok.length === 1 ? "file" : "files"} added: ${ok.map((f) => f.name).join(", ")}`);
  };

  const remove = (name) => {
    setFiles((prev) => prev.filter((f) => f.name !== name));
    setStatus(`${name} removed`);
    // The input keeps its own FileList; clearing it lets the same file be re-picked.
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="ds-field">
      <span className="ds-field-label" id={`${id}-label`}>
        {label}
        {required && <span className="ds-req" aria-hidden="true"> *</span>}
        {required && <span className="ds-sr"> (required)</span>}
      </span>
      {hint && <div id={hintId} className="ds-field-hint">{hint}</div>}

      <div
        className={`ds-file-zone${dragging ? " dragging" : ""}${disabled ? " disabled" : ""}${(error || rejected) ? " error" : ""}`}
        onDragOver={(e) => { if (!disabled) { e.preventDefault(); setDragging(true); } }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); add(e.dataTransfer.files); }}
      >
        <UploadCloud size={22} className="ds-file-ic" aria-hidden="true" />
        <input
          ref={inputRef} id={id} type="file" className="ds-file-input"
          accept={accept} multiple={multiple} disabled={disabled}
          // Names the input after the group *and* the visible button text, so the
          // field is identifiable and the visible label is in the name (2.5.3).
          aria-labelledby={`${id}-label ${id}-btn`}
          aria-describedby={describedBy} aria-required={required || undefined}
          aria-invalid={(error || rejected) ? true : undefined}
          onChange={(e) => add(e.target.files)}
        />
        <label htmlFor={id} id={`${id}-btn`} className="ds-file-btn">{buttonLabel}</label>
        <span className="ds-file-drop" aria-hidden="true">{dropLabel}</span>
      </div>

      {files.length > 0 && (
        <ul id={listId} className="ds-file-list">
          {files.map((f) => (
            <li key={f.name} className="ds-file-item">
              <FileIcon size={15} className="ds-file-itemic" aria-hidden="true" />
              <span className="ds-file-name">{f.name}</span>
              <span className="ds-file-size">{formatSize(f.size)}</span>
              <button type="button" className="ds-file-x" onClick={() => remove(f.name)}
                aria-label={`${removeLabel} ${f.name}`} disabled={disabled}>
                <X size={14} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {(error || rejected) && (
        <div id={errId} className="ds-field-err" role="alert">
          <AlertCircle size={14} aria-hidden="true" />{error || rejected}
        </div>
      )}
      <span className="ds-sr" role="status">{status}</span>
    </div>
  );
}

export const FILEUPLOAD_CSS = `
.ds-file-zone{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:10px;
  padding:20px 16px;text-align:center;background:var(--surface);
  border:1.5px dashed var(--border-interactive);border-radius:min(calc(var(--radius) + 2px),14px);
  transition:background .12s,border-color .12s}
.ds-file-zone.dragging{border-color:var(--accent-marker);background:var(--accent-tint);border-style:solid}
.ds-file-zone.error{border-color:var(--danger)}
.ds-file-zone.disabled{background:var(--disabled-bg);border-color:var(--disabled-border)}
.ds-file-ic{color:var(--text-2);flex-shrink:0}
.ds-file-zone.dragging .ds-file-ic{color:var(--accent-text)}
.ds-file-input{position:absolute;width:1px;height:1px;opacity:0;margin:0;clip:rect(0 0 0 0);overflow:hidden}
.ds-file-btn{font-family:var(--font-body);font-size:var(--fs-sm);font-weight:500;
  display:inline-flex;align-items:center;justify-content:center;min-height:var(--target-min);
  padding:7px 14px;border-radius:var(--radius);cursor:pointer;
  background:var(--secondary-bg);color:var(--secondary-text);border:1.5px solid var(--secondary-border)}
.ds-file-btn:hover{background:var(--secondary-bg-hover)}
.ds-file-input:focus-visible ~ .ds-file-btn{box-shadow:0 0 0 2px var(--surface),0 0 0 4px var(--ring)}
.ds-file-input:disabled ~ .ds-file-btn{background:var(--disabled-bg);color:var(--disabled-text);
  border-color:var(--disabled-border);cursor:not-allowed}
.ds-file-drop{font-size:var(--fs-sm);color:var(--text-2)}
.ds-file-list{list-style:none;margin:2px 0 0;padding:0;display:flex;flex-direction:column;gap:6px}
.ds-file-item{display:flex;align-items:center;gap:9px;padding:7px 8px 7px 11px;background:var(--surface);
  border:.5px solid var(--border);border-radius:min(var(--radius),10px);font-size:var(--fs-sm);color:var(--text-1)}
.ds-file-itemic{color:var(--text-2);flex-shrink:0}
.ds-file-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;flex:1}
.ds-file-size{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--text-2);
  white-space:nowrap;flex-shrink:0}
.ds-file-x{display:inline-flex;align-items:center;justify-content:center;width:var(--target-min);
  height:var(--target-min);flex-shrink:0;padding:0;border:none;border-radius:50%;background:transparent;
  color:var(--text-2);cursor:pointer}
.ds-file-x:hover:not(:disabled){background:var(--accent-tint);color:var(--accent-on-tint)}
.ds-file-x:disabled{color:var(--disabled-text);cursor:not-allowed}
.ds-file-x:focus-visible{outline:none;box-shadow:0 0 0 2px var(--surface),0 0 0 4px var(--ring)}
@media (prefers-reduced-motion:reduce){.ds-file-zone{transition:none}}
`;
