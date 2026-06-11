module.exports = {
    testEnvironment: 'node',
    testMatch: [
        '<rootDir>/tests/unit/**/*.test.js',
        '<rootDir>/tests/integration/**/*.test.js',
    ],

    moduleDirectories:['node_modules','worker/node_modules','api/node_modules'],


};