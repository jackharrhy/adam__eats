import { definePlugin } from "emdash";

const RESEND_API_URL = "https://api.resend.com/emails";

function requiredEnvironmentVariable(name: "RESEND_API_KEY" | "RESEND_FROM"): string {
	const value = process.env[name]?.trim();

	if (!value) {
		throw new Error(`[adam-eats-resend] ${name} is not configured`);
	}

	return value;
}

export function createPlugin() {
	return definePlugin({
		id: "adam-eats-resend",
		version: "1.0.0",
		capabilities: ["hooks.email-transport:register", "network:request"],
		allowedHosts: ["api.resend.com"],
		hooks: {
			"email:deliver": {
				exclusive: true,
				handler: async ({ message }, context) => {
					if (!context.http) {
						throw new Error("[adam-eats-resend] HTTP access is unavailable");
					}

					const response = await context.http.fetch(RESEND_API_URL, {
						method: "POST",
						headers: {
							Authorization: `Bearer ${requiredEnvironmentVariable("RESEND_API_KEY")}`,
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							from: requiredEnvironmentVariable("RESEND_FROM"),
							to: [message.to],
							subject: message.subject,
							text: message.text,
							...(message.html ? { html: message.html } : {}),
							...(process.env.RESEND_REPLY_TO?.trim()
								? { reply_to: process.env.RESEND_REPLY_TO.trim() }
								: {}),
						}),
					});

					if (!response.ok) {
						const detail = (await response.text()).slice(0, 1_000);
						throw new Error(`[adam-eats-resend] Resend returned ${response.status}: ${detail}`);
					}

					context.log.info("Email delivered through Resend", {
						to: message.to,
						subject: message.subject,
					});
				},
			},
		},
	});
}

export default createPlugin;
