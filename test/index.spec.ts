import { exports } from "cloudflare:workers";
import { env, createExecutionContext, waitOnExecutionContext } from "cloudflare:test";
import { describe, it, expect } from "vitest";

const worker = exports.default;

describe("LLM chat worker", () => {
	it("serves static assets for the root path", async () => {
		const request = new Request("http://example.com/");
		const ctx = createExecutionContext();

		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(200);
		const body = await response.text();
		expect(body).toContain("<html");
	});

	it("returns 405 for non-POST requests to /api/chat", async () => {
		const request = new Request("http://example.com/api/chat", {
			method: "GET",
		});
		const ctx = createExecutionContext();

		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(405);
		expect(await response.text()).toBe("Method not allowed");
	});

	it("returns 404 for unmatched API routes", async () => {
		const request = new Request("http://example.com/api/unknown");
		const ctx = createExecutionContext();

		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(404);
		expect(await response.text()).toBe("Not found");
	});

	it("returns a 500 response when the request body is not valid JSON", async () => {
		const request = new Request("http://example.com/api/chat", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: "not valid json",
		});
		const ctx = createExecutionContext();

		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(500);
		const json = (await response.json()) as { error: string };
		expect(json.error).toBe("Failed to process request");
	});
});
