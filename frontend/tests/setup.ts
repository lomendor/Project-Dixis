import '@testing-library/jest-dom'

// Mock Next.js environment variables
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3001',
    origin: 'http://localhost:3001'
  },
  writable: true,
})

// Mock environment variables
process.env.NEXT_PUBLIC_API_BASE_URL = 'http://127.0.0.1:8001/api/v1'