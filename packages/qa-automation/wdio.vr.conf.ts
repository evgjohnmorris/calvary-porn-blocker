import type { Options } from '@wdio/types';
import { config as baseConfig } from './wdio.conf';

export const config: Options.Testrunner = {
    ...baseConfig,
    capabilities: [{
        platformName: 'Android',
        // Meta Quest 2 / Quest 3 or generic VR headset
        'appium:deviceName': 'Meta Quest 3 Emulator', 
        'appium:app': '../../apps/mobile-client/android/app/build/outputs/apk/debug/app-debug.apk',
        'appium:automationName': 'UiAutomator2',
        // Specific VR considerations: Landscape orientation, specific resolution bounds
        'appium:orientation': 'LANDSCAPE',
        // Disable window animations to prevent VR jitter during automated interaction
        'appium:disableWindowAnimation': true,
        // Wait for idle might need to be relaxed if the VR environment has constant background rendering loops
        'appium:waitForIdleTimeout': 500,
    }],
};
