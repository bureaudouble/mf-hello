// hello: the test app of an mf fleet. Each route exercises something the dashboard shows:
// requests and their status, logs, latency, errors, memory, variables, revisions and previews.
import build from "./build_info.ts";

const env = (k: string) => Deno.env.get(k) ?? "";
// mf names the unit through OpenTelemetry's standard identity: the app id and its revision.
const identity = Object.fromEntries(
  env("OTEL_RESOURCE_ATTRIBUTES").split(",").map((kv) => kv.split("=") as [string, string]),
);
const app = env("OTEL_SERVICE_NAME");
const rev = identity["mf.rev"] ?? "";
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
        `hello ${env("GREETING") || "world"} from ${app} revision ${rev}\n`,
        { headers: { "content-type": "text/plain" } },
      );
    case "/health":
      return new Response("ok\n");
    case "/info":
      return json({
        app,
        rev,
        context: identity["mf.context"] ?? "",
        host: url.host,
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
