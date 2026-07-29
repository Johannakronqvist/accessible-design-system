/*
  Public entry point. Preserves the original module's surface:
    import StyleGuide, { Button, Field, Select, deriveAccent } from "./design-system";

  StyleGuide is the default export (the living demo); the named exports are the
  themeable components, layout primitives, and the token / color helpers.
*/

export { default } from "./StyleGuide";

export { Button } from "./Button";
export { Field } from "./Field";
export { Select } from "./Select";
export { Checkbox, RadioGroup, Switch } from "./SelectionControls";
export { Badge } from "./Badge";
export { Alert } from "./Alert";
export { Container, Stack, Cluster, Grid } from "./Layout";

export { deriveAccent } from "./color";
export { PRESETS, BADGE_TONES, ALERT_TONES, BREAKPOINTS } from "./tokens";
