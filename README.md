# hello

The test app of an [mf](https://github.com/bureaudouble/mf-releases) fleet. Each route exercises
something the dashboard shows:

| Route            | What it does                                                                           |
| ---------------- | -------------------------------------------------------------------------------------- |
| `/`              | `hello $GREETING from <app> revision <rev>` (from `OTEL_SERVICE_NAME` and `OTEL_RESOURCE_ATTRIBUTES`) |
| `/health`        | answers `ok` (the fleet's health check is boot-completed; set `health_path` in `mf.toml` to probe it) |
| `/info`          | revision, build label (a build-tagged variable), whether `SECRET_TOKEN` is set, memory |
| `/slow?ms=1500`  | latency                                                                                |
| `/error`         | a 500 and an error log line                                                            |
| `/memory?mib=32` | holds memory (`&free` lets it go)                                                      |

How it builds and runs is `mf.toml`. Traces: `mf env set OTEL_DENO=true OTEL_DENO_CONSOLE=replace --context build,production,development`
(`deno compile` fixes both into the executable).

Push a branch to get a preview: `hello-<rev>.apps.elias.systems`.

The second revision: its build carries `BUILD_LABEL`.
