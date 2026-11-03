export default {
  rootDir: '..',
  testEnvironment: 'node',
  transform: {},
  testMatch:
    process.env.KOPAKA_INTEGRATION === '1'
      ? ['<rootDir>/dist-test/test/**/*.integration-spec.js']
      : [
          '<rootDir>/dist-test/src/**/*.spec.js',
          '<rootDir>/dist-test/test/fixtures/**/*.spec.js',
        ],
};
