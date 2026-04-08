import { defineConfig } from '@playwright/test';

export default defineConfig({
    use: {
        baseURL: 'http://localhost:7777',
        video: {
          mode: "on",
          show: {
              actions: {
                  duration: 500
              }
          }
        },
        viewport: { width: 1280, height: 720 },
        locale: 'de-DE',
        launchOptions:{
            slowMo:1000,
        }
    }
});
