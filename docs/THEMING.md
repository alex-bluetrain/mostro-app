# Theming

Cómo se definen y customizan los colores en mostro-app.

## Dos sistemas de color

La app tiene **dos** capas de tema, una por plataforma:

| Plataforma | Quién define los colores | Dónde |
| --- | --- | --- |
| Native (Android/iOS) | Tokens propios de mostro | `src/constants/theme.ts` (`Colors.light` / `Colors.dark`) |
| Web | `@openuidev/react-ui` (AgentInterface) | tema del paquete, override vía `createTheme` |

En **native** renderizamos con componentes propios que leen `Colors` vía el hook `useTheme()`.
En **web** usamos el componente `AgentInterface`, que trae su propio sistema de tema (77 tokens en formato OKLch).

## Customizar el tema web

El tema web se customiza con la API pública de `@openuidev/react-ui`:

- `createTheme(overrides)` — recibe un objeto con overrides parciales de tokens y lo valida.
- `<ThemeProvider lightTheme={...} darkTheme={...}>` — aplica el tema. `AgentInterface` acepta la prop `theme?: ThemeProps` y lo pasa a `ThemeProvider` internamente.
- `swatch(name, shade)` — devuelve el color OKLch de una rampa (ej: `swatch("blue", 600)`).
- `withAlpha(color, alpha)` — aplica transparencia a un color.

### Qué hace `createTheme` (y qué NO hace)

`createTheme` valida **keys** = los **nombres de las propiedades** del objeto de tema
(`textBrand`, `borderAccent`, `interactiveAccentDefault`, etc.).

> ⚠️ "key" acá significa clave de un objeto JavaScript. **No** tiene nada que ver con
> API keys, secrets, contraseñas ni variables de entorno. Nada de Doppler / Infisical / `.env`.

Paso a paso:

1. Le pasás un objeto con colores del tema.
2. En **desarrollo**: chequea que cada nombre de propiedad exista en la lista de tokens
   conocidos. Si escribís mal uno (ej: `textBrnd` en vez de `textBrand`), imprime un
   `console.warn` con sugerencia "did you mean…?".
3. En **producción**: ese chequeo se elimina en el build, no hace nada en runtime.
4. Devuelve el **mismo objeto sin modificar**. Es solo un corrector de typos en los nombres.

### Implementación actual

La marca web (ámbar) vive en `src/constants/web-theme.ts` y se pasa en `src/app/index.web.tsx`.
Para cambiar de marca, cambiá el swatch en `const brand = swatch('amber', 600)`.

### Ejemplo

```tsx
import { AgentInterface, createTheme, swatch, withAlpha, black } from "@openuidev/react-ui";

const brand = swatch("blue", 600);

const brandTheme = createTheme({
  interactiveAccentDefault:  brand,
  interactiveAccentHover:    withAlpha(brand, 0.8),
  interactiveAccentPressed:  brand,
  interactiveAccentDisabled: withAlpha(brand, 0.4),
  textBrand:                 brand,
  borderAccent:              withAlpha(brand, 0.08),
  borderAccentEmphasis:      withAlpha(brand, 0.3),
  textAccentPrimary:         black, // texto sobre botones de acento
});

<AgentInterface
  theme={{ mode, lightTheme: brandTheme }}
  // ...resto de props
/>;
```

Notas:

- `mode` y `lightTheme` van dentro del mismo objeto `theme`.
- Si omitís `darkTheme`, los overrides de `lightTheme` aplican a **ambos** modos.
- `disableThemeProvider` en `AgentInterface` si querés envolverlo vos mismo en un `ThemeProvider`.

## Referencias

- Paquete instalado: `@openuidev/react-ui@0.16.2`
- Tipos verificados en: `node_modules/@openuidev/react-ui/dist/components/ThemeProvider/`
