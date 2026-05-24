import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: '../../frontend/src/test',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:8920',
  },
});
