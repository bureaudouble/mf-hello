// hello: the test app of an mf fleet. Each route exercises something the dashboard shows:
// requests and their status, logs, latency, errors, memory, variables, revisions and previews.
import build from "./build_info.ts";

const env = (k: string) => Deno.env.get(k) ?? "";
const started = new Date().toISOString();
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body, null, 2) + "\n", {
    status,
    headers: { "content-type": "application/json" },
  });
let hoard: Uint8Array[] = [];

Deno.serve({ port: Number(env("PORT") || 8000) }, async (req) => {
  const url = new URL(req.url);
  console.log(`${req.method} ${url.pathname}${url.search}`);
  switch (url.pathname) {
    case "/":
      return new Response(
        `hello ${env("GREETING") || "world"} (preview branch) from ${env("MF_APP")} revision ${env("MF_REV")}\n`,
        { headers: { "content-type": "text/plain" } },
      );
    case "/health":
      return new Response("ok\n");
    case "/info":
      return json({
        app: env("MF_APP"),
        rev: env("MF_REV"),
        url: env("MF_URL"),
        domain: env("MF_DOMAIN"),
        started,
        build,
        greeting: env("GREETING"),
        secret_set: env("SECRET_TOKEN") !== "",
        memory: Deno.memoryUsage(),
      });
    case "/slow": {
      const ms = Math.min(Number(url.searchParams.get("ms") ?? 1500), 10_000);
      await new Promise((r) => setTimeout(r, ms));
      return json({ slept_ms: ms });
    }
    case "/error":
      console.error("error: /error was asked for a 500");
      return json({ error: "on purpose" }, 500);
    case "/memory": {
      const mib = Math.min(Number(url.searchParams.get("mib") ?? 32), 96);
      hoard.push(new Uint8Array(mib << 20).fill(1));
      if (url.searchParams.has("free")) hoard = [];
      return json({ held_mib: hoard.reduce((n, b) => n + b.length, 0) >> 20 });
    }
    default:
      console.warn(`warn: no route for ${url.pathname}`);
      return json({ error: "not found" }, 404);
  }
});
