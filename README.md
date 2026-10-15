# hello

The test app of an [mf](https://github.com/bureaudouble/mf-releases) fleet. Each route exercises
something the dashboard shows:

| Route            | What it does                                                                           |
| ---------------- | -------------------------------------------------------------------------------------- |
| `/`              | `hello $GREETING from $MF_APP revision $MF_REV`                                        |
| `/health`        | the health check (`mf.health` in `deno.json`)                                          |
| `/info`          | revision, build label (a build-tagged variable), whether `SECRET_TOKEN` is set, memory |
| `/slow?ms=1500`  | latency                                                                                |
| `/error`         | a 500 and an error log line                                                            |
| `/memory?mib=32` | holds memory (`&free` lets it go)                                                      |

Push a branch to get a preview: `hello-<rev>.apps.elias.systems`.
