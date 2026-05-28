const { spawnSync } = require("node:child_process");

const result = spawnSync("tsc", ["-p", "tsconfig.json"], {
  stdio: "inherit",
  shell: true
});

if (typeof result.status === "number" && result.status !== 0) {
  process.exit(result.status);
}

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}
