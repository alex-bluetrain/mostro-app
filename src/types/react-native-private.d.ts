// react-native ships no types for its ReactPrivate entry. dom-shim.native.ts
// needs it to register DOM tag names against RCTView's view config; see the
// comment there for why that workaround exists.
declare module 'react-native/Libraries/ReactPrivate/ReactNativePrivateInterface' {
  export const ReactNativeViewConfigRegistry: {
    register(name: string, callback: () => unknown): string;
    get(name: string): unknown;
  };
}

declare module 'react-native/Libraries/Components/View/ViewNativeComponent';
