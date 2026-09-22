/**
 * Teaches React Native to render the handful of DOM tags that
 * `@openuidev/react-lang` emits regardless of platform.
 *
 * Why this is needed: the package advertises a `react-native` export
 * condition, but `dist/index.native.mjs` only re-exports the SAME bundle the
 * web entry uses. Its `Renderer` wraps every response in a literal
 * `<div style={{ position: 'relative' }}>`, and its default query loader is
 * another `div`. On native that reaches the host config as an unknown
 * component and throws:
 *
 *   View config getter callback for component `div` must be a function
 *
 * which unmounts the whole tree — the app goes blank on the first assistant
 * message. Registering the tags against RCTView's own view config makes them
 * render as plain Views instead.
 *
 * This is a workaround for an upstream bug (react-lang 0.3.0, the latest at
 * the time of writing). Drop it once the package ships a real native build.
 */
import { ReactNativeViewConfigRegistry } from 'react-native/Libraries/ReactPrivate/ReactNativePrivateInterface';

// Importing the component registers RCTView's config, so `get` below resolves.
import 'react-native/Libraries/Components/View/ViewNativeComponent';

const TAGS = ['div', 'span', 'p'] as const;

for (const tag of TAGS) {
  try {
    ReactNativeViewConfigRegistry.register(tag, () =>
      ReactNativeViewConfigRegistry.get('RCTView'),
    );
  } catch {
    // Already registered (Fast Refresh re-runs this module). Nothing to do.
  }
}
