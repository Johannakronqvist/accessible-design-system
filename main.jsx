/*
  Dev harness entry point. The library itself stays framework-agnostic — this
  file exists only so `npm run dev` can mount the living style guide in a
  browser. Nothing in the components imports it.
*/

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import StyleGuide from "./index.js";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <StyleGuide />
  </StrictMode>
);
