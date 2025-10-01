// Polyfills for JSDOM gaps that break components (ResizeObserver, matchMedia)
if (!('matchMedia' in window)) {
  // @ts-ignore
  window.matchMedia = () => ({
    matches: false,
    media: '',
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {
      return false;
    },
  });
}

if (!('ResizeObserver' in window)) {
  // @ts-ignore
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
