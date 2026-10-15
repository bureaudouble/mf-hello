// The build step: proves build-tagged variables reach the build and only the build. It rewrites
// build_info.ts, which main.ts imports, so the compiled executable carries it.
const info = { label: Deno.env.get("BUILD_LABEL") ?? "", at: new Date().toISOString() };
await Deno.writeTextFile("build_info.ts", `export default ${JSON.stringify(info)};\n`);
console.log(`build: label ${JSON.stringify(info.label)}`);
