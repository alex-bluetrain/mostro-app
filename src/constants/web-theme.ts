import { black, createTheme, swatch, withAlpha } from '@openuidev/react-ui';

// Brand accent for the web chat (AgentInterface). Only accent tokens are
// overridden; everything else keeps react-ui's defaults.
// Alphas mirror react-ui's own defaults for the brand color.
const brand = swatch('amber', 400);

const accent = {
  textBrand: brand,
  textAccentPrimary: black, // amber is light: dark text keeps contrast
  interactiveAccentDefault: brand,
  interactiveAccentHover: withAlpha(brand, 0.8),
  interactiveAccentDisabled: withAlpha(brand, 0.4),
  interactiveAccentPressed: brand,
};

export const webLightTheme = createTheme({
  ...accent,
  borderAccent: withAlpha(brand, 0.08),
  borderAccentEmphasis: withAlpha(brand, 0.3),
});

export const webDarkTheme = createTheme({
  ...accent,
  borderAccent: withAlpha(brand, 0.2),
  borderAccentEmphasis: withAlpha(brand, 0.4),
});
