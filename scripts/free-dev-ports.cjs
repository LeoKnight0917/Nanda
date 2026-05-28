const { execSync } = require("node:child_process");

const ports = [3000, 3002, 3003];

function getListeningPids(port) {
  try {
    const output = execSync(`netstat -ano | findstr ":${port}"`, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"]
    });

    const pids = new Set();
    for (const line of output.split(/\r?\n/)) {
      if (!line.includes("LISTENING")) {
        continue;
      }

      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (/^\d+$/.test(pid)) {
        pids.add(pid);
      }
    }

    return [...pids];
  } catch {
    return [];
  }
}

let freed = 0;

for (const port of ports) {
  const pids = getListeningPids(port);
  for (const pid of pids) {
    try {
      execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
      console.log(`Freed port ${port} (PID ${pid})`);
      freed += 1;
    } catch {
      console.log(`Could not free port ${port} (PID ${pid})`);
    }
  }
}

if (freed === 0) {
  console.log("No dev service ports were in use (3000, 3002, 3003).");
}
