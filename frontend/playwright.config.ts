import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './tests',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: 'html',
	use: {
		baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001',
	},
	webServer: [
		{
			command: 'npm run start --workspace backend',
			url: 'http://localhost:3000/',
			reuseExistingServer: !process.env.CI,
		},
		{
			command: 'npm run dev --workspace frontend',
			url: 'http://localhost:3001/',
			reuseExistingServer: !process.env.CI,
		},
	],
	outputDir: 'test-results/',
	testMatch: '**/*.spec.ts',
	testIgnore: ['**/*.test.js', '**/*.test.ts'],
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},
		// {
		//   name: 'firefox',
		//   use: { ...devices['Desktop Firefox'] },
		// },
		// {
		//   name: 'webkit',
		//   use: { ...devices['Desktop Safari'] },
		// },
	],
});
