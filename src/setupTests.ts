// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock fetch for tests
global.fetch = jest.fn(() => 
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  } as Response)
);

// Mock IndexedDB for tests
const indexedDB = {
  open: jest.fn(),
};

Object.defineProperty(window, 'indexedDB', {
  value: indexedDB,
});

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});