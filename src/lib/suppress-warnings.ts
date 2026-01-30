/**
 * 브라우저 콘솔 경고 억제
 * - 개발 환경에서만 활성화
 * - 프로덕션에서는 무시됨
 */

const SUPPRESSED_WARNINGS = [
  'Deprecated API for given entry type',
  'preload',
  'was preloaded using link preload but not used',
  'The resource',
]

export function suppressConsoleWarnings() {
  if (typeof window === 'undefined') return
  if (process.env.NODE_ENV === 'production') return

  const originalWarn = console.warn
  const originalError = console.error

  console.warn = (...args: unknown[]) => {
    const message = args[0]?.toString() || ''
    const shouldSuppress = SUPPRESSED_WARNINGS.some(pattern =>
      message.includes(pattern)
    )
    if (!shouldSuppress) {
      originalWarn.apply(console, args)
    }
  }

  console.error = (...args: unknown[]) => {
    const message = args[0]?.toString() || ''
    // React 18/19 hydration 경고도 억제 (선택적)
    if (message.includes('Hydration') || message.includes('preload')) {
      return
    }
    originalError.apply(console, args)
  }
}
