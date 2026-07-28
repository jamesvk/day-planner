import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['dotenv/config'],
  },
});

// console.log("DB target:", connectionString?.split("@")[1]);
