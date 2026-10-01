import { defineConfig } from "vitest/config";
import { cloudflareTest } from "@cloudflare/vitest-pool-workers";

export default defineConfig({
	plugins: [cloudflareTest({ wrangler: { configPath: "./wrangler.e2e.jsonc" } })],
	test: {
		coverage: {
			provider: "istanbul",
			reporter: ["text", "cobertura"],
			reportsDirectory: "./coverage",
			include: ["src/**/*.ts"],
		},
	},
});
