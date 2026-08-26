import { defineConfig } from '@playwright/test';

export default defineConfig({
    use: {
        baseURL: 'http://reverseproxy',
        screenshot: 'on',
        viewport: { width: 1280, height: 720 },
        locale: 'de-DE'
    },
    expect: {
        timeout: 15000,
    },
    timeout: 240000,
    reporter: [['html', { open: 'never', outputFolder: 'reports' }]]
});
