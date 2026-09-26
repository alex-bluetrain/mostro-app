# Theming

## Two color systems

| Platform | Who defines colors | Where |
| --- | --- | --- |
| Native (Android/iOS) | mostro's own tokens | `src/constants/theme.ts` (`Colors.light` / `Colors.dark`), read via `useTheme()` |
| Web | `@openuidev/react-ui` (`AgentInterface`) | library theme (77 OKLch tokens), overridden in `src/constants/web-theme.ts` |

## Web brand

`web-theme.ts` uses only the public API of `@openuidev/react-ui`:

- `swatch(name, shade)` returns an OKLch color from a built-in ramp, e.g. `swatch('amber', 400)`.
- `withAlpha(color, alpha)` adds transparency.
- `createTheme(overrides)` checks token **names** for typos (a dev-only `console.warn`, stripped in production) and returns the object unchanged. It has nothing to do with API keys or secrets.

The result is passed to `AgentInterface`:

```tsx
<AgentInterface theme={{ mode, lightTheme: webLightTheme, darkTheme: webDarkTheme }} />
```

To change the brand, edit the swatch in `const brand = swatch('amber', 400)`. With a dark brand color, also switch `textAccentPrimary` to `white`, since it's the text color drawn on accent buttons.

Notes:

- Tokens you don't override keep the library defaults.
- If you omit `darkTheme`, the `lightTheme` overrides apply to both modes.
- The library doesn't export `createColorTheme` (full theme from a swatch name), so the accent tokens are set explicitly.

Types: `node_modules/@openuidev/react-ui/dist/components/ThemeProvider/` (v0.16.2).
