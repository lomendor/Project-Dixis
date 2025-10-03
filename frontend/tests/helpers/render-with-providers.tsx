import React from 'react';
import { render } from '@testing-library/react';

// Optional providers (wrapped in try/catch to avoid breaking if missing)
function withOptional<T extends React.ComponentType<any>>(Comp: T | undefined, props: any, children: React.ReactNode) {
  return Comp ? React.createElement(Comp as any, props, children) : <>{children}</>;
}

export function renderWithProviders(ui: React.ReactElement, { route = '/', queryClientOptions }: any = {}) {
  let tree: React.ReactNode = ui;

  // Router (Next/React Router)
  try {
    const { MemoryRouter } = require('react-router-dom');
    tree = <MemoryRouter initialEntries={[route]}>{tree}</MemoryRouter>;
  } catch {}
  try {
    const { RouterContext } = require('next/dist/shared/lib/router-context');
    const createMockRouter = (r: any) => ({
      basePath: '',
      pathname: r,
      route: r,
      asPath: r,
      query: {},
      push: async () => true,
      replace: async () => true,
      reload: () => {},
      back: () => {},
      prefetch: async () => {},
      beforePopState: () => {},
      events: { on: () => {}, off: () => {}, emit: () => {} },
      isFallback: false,
      isLocaleDomain: false,
      isReady: true,
      isPreview: false,
    });
    tree = <RouterContext.Provider value={createMockRouter(route)}>{tree}</RouterContext.Provider>;
  } catch {}

  // React Query
  try {
    const { QueryClient, QueryClientProvider } = require('@tanstack/react-query');
    const client = new QueryClient(queryClientOptions ?? { defaultOptions: { queries: { retry: 0 } } });
    tree = <QueryClientProvider client={client}>{tree}</QueryClientProvider>;
  } catch {}

  // Toasts (optional)
  try {
    const { Toaster } = require('react-hot-toast');
    tree = (
      <>
        {tree}
        <Toaster />
      </>
    );
  } catch {}

  // Any App context (optional)
  try {
    const { AppProvider } = require('@/context/AppProvider');
    tree = withOptional(AppProvider, {}, tree);
  } catch {}

  return render(<>{tree}</>);
}
