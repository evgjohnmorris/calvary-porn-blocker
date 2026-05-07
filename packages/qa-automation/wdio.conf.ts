import type { Options } from '@wdio/types';

export const config: Options.Testrunner = {
    runner: 'local',
    port: 4723,
    specs: [
        './tests/mobile/**/*.ts'
    ],
    exclude: [],
    maxInstances: 1,
    capabilities: [{
        platformName: 'Android',
        'appium:deviceName': 'Android Emulator',
        'appium:app': '../../apps/mobile-client/android/app/build/outputs/apk/debug/app-debug.apk',
        'appium:automationName': 'UiAutomator2'
    }],
    logLevel: 'info',
    bail: 0,
    baseUrl: 'http://localhost',
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    services: ['appium'],
    framework: 'mocha',
    reporters: ['spec'],
    mochaOpts: {
        ui: 'bdd',
        timeout: 60000
    },
};
