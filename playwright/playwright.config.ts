import { defineConfig } from '@playwright/test';

export default defineConfig({
    use: {
        baseURL: 'http://localhost:7777',
        //video: 'on',
        viewport: { width: 1280, height: 720 },
        locale: 'de-DE',
        launchOptions:{
            slowMo:50,
        }
    },
    reporter: [['html', { open: 'never', outputFolder: 'reports' }]]
});
