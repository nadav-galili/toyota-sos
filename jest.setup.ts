import '@testing-library/jest-dom';

// Mock IntersectionObserver for jsdom
class MockIntersectionObserver {
  root: Element | null = null;
  rootMargin: string = '';
  thresholds: ReadonlyArray<number> = [];
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
}
// @ts-ignore
global.IntersectionObserver = MockIntersectionObserver as any;


