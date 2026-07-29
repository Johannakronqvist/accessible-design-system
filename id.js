/*
  Stable, unique DOM id generator shared by every labelled control (Field,
  Select, RadioGroup, AccessibilityFeedback). Each call bumps a module-level
  counter so ids are deterministic within a render pass and never collide
  across components that wire label / hint / error via aria-* attributes.

  Use inside a lazy useState initializer so an id is minted once per instance:
    const [id] = useState(() => nextId("ds-f"));
*/

let seq = 0;

export function nextId(prefix) {
  return `${prefix}-${++seq}`;
}
