// Brand color read by contexts that cannot resolve a CSS custom property
// (an HTML <meta> tag's content attribute). The rest of the site reads
// var(--brand-*) from src/styles.css instead. Keep this file outside
// src/routes|layouts|components/custom-ui|features|widgets: those are
// scanned by scripts/check-ui.mjs for raw color literals.
export const BRAND_BG_HEX = "#0a0b0c";
