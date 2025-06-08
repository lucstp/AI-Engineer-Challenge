import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, vi } from 'vitest'
import React from 'react'

// Cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup()
})

// Global test setup
beforeAll(() => {
  // Mock Next.js router
  vi.mock('next/navigation', () => ({
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
    useParams: () => ({}),
  }))

  // Mock Next.js Image component
  vi.mock('next/image', () => ({
    default: (props: { src: string; alt: string; [key: string]: unknown }) => {
      return React.createElement('img', { src: props.src, alt: props.alt })
    },
  }))

  // Mock Next.js Link component
  vi.mock('next/link', () => ({
    default: (props: { children: React.ReactNode; href: string; [key: string]: unknown }) => {
      return React.createElement('a', { href: props.href }, props.children)
    },
  }))

  // Set test environment
  vi.stubEnv('NODE_ENV', 'test')
  vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3001')
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
})

// Mock fetch for API calls with default implementation
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  status: 200,
  json: async () => ({}),
  text: async () => '',
  headers: new Headers(),
  redirected: false,
  statusText: 'OK',
  type: 'basic' as ResponseType,
  url: '',
  clone: vi.fn(),
  body: null,
  bodyUsed: false,
  arrayBuffer: async () => new ArrayBuffer(0),
  blob: async () => new Blob(),
  formData: async () => new FormData(),
} as unknown as Response)

// Suppress console errors in tests unless explicitly needed
const originalError = console.error
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

// Custom matchers are provided by @testing-library/jest-dom

// Global test utilities
export const createMockUser = (overrides: Partial<{
  id: string
  name: string
  email: string
  role: 'user' | 'admin' | 'moderator'
  createdAt: Date
  updatedAt: Date
}> = {}) => ({
  id: Math.random().toString(36).substring(2, 11),
  name: 'Test User',
  email: `test-${Math.random().toString(36).substring(2, 7)}@example.com`,
  role: 'user' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

export const createMockApiResponse = <T>(data: T) => ({
  success: true,
  data,
  message: 'Success',
})

export const createMockApiError = (message: string) => ({
  success: false,
  error: message,
  data: null,
})

// Test helpers for async operations
export const waitForNextTick = () => new Promise((resolve) => setTimeout(resolve, 0))

export const flushPromises = () => new Promise(setImmediate)
