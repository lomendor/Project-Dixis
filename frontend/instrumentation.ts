export async function register() {
  if (process.env.NEXT_PUBLIC_MSW === '1' && typeof window !== 'undefined') {
    const { worker } = await import('./tests/msw/browser')
    worker.start({
      onUnhandledRequest: 'bypass',
    })
  }
}