import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

declare module '@vitest/expect' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- required for declaration merging with vitest's Assertion interface
  interface Assertion<T> extends TestingLibraryMatchers<unknown, T> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- required for declaration merging with vitest's AsymmetricMatchersContaining interface
  interface AsymmetricMatchersContaining extends TestingLibraryMatchers<unknown, unknown> {}
}
