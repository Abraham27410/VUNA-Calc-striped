module.exports = {
  testEnvironment: 'jsdom',
  collectCoverageFrom: [
    'calculator/assets/js/script.js',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};
