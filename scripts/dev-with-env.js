const { readFileSync } = require("node:fs");
const { spawn } = require("node:child_process");

const envFile = readFileSync(".env.local", "utf8");
for (const line of envFile.split(/\r?\n/)) {
  if (!line || line.trim().startsWith("#")) continue;
  const idx = line.indexOf("=");
  if (idx === -1) continue;
  const key = line.slice(0, idx).trim();
  const value = line.slice(idx + 1);
  if (key) process.env[key] = value;
}

const child = spawn("npm", ["run", "dev:raw"], {
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
