import type { Options } from '@wdio/types';
import { config as baseConfig } from './wdio.conf';

export const config: Options.Testrunner = {
    ...baseConfig,
    capabilities: [{
        platformName: 'Android',
        // Amazon Fire HD / Android Tablet emulation
        'appium:deviceName': 'Amazon Fire HD 10 Emulator', 
        'appium:app': '../../apps/mobile-client/android/app/build/outputs/apk/debug/app-debug.apk',
        'appium:automationName': 'UiAutomator2',
        // Tablets have distinct breakpoints and UI structures compared to phones
        'appium:deviceType': 'tablet',
        // Sometimes FireOS requires specific activity waiting due to launcher differences
        'appium:appWaitActivity': '*',
    }],
};
