import { pbkdf2Sync, randomBytes } from "node:crypto";

const plainKey = process.argv[2];
const iterationsArg = process.argv[3];
const iterations = iterationsArg ? Number(iterationsArg) : 260000;

if (!plainKey) {
  console.error("Usage: node scripts/generate-access-config.mjs \"YourStrongAccessKey\" [iterations]");
  process.exit(1);
}

if (!Number.isInteger(iterations) || iterations < 100000) {
  console.error("iterations must be an integer >= 100000");
  process.exit(1);
}

const salt = randomBytes(16);
const hash = pbkdf2Sync(plainKey, salt, iterations, 32, "sha256");

const payload = {
  version: 1,
  kdf: "PBKDF2-HMAC-SHA-256",
  iterations,
  salt: salt.toString("base64"),
  hash: hash.toString("hex"),
  updatedAt: new Date().toISOString(),
};

console.log(JSON.stringify(payload, null, 2));
