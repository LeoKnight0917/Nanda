import test from "node:test";
import assert from "node:assert/strict";
import { canonicalStringify, generateKeyPair, signPayload, verifyPayload } from "./index";

test("canonicalStringify outputs deterministic key order", () => {
  const a = {
    z: 1,
    nested: {
      b: true,
      a: false
    },
    a: "first"
  };

  const b = {
    a: "first",
    nested: {
      a: false,
      b: true
    },
    z: 1
  };

  assert.equal(canonicalStringify(a), canonicalStringify(b));
});

test("signPayload and verifyPayload succeed for valid payload", () => {
  const keys = generateKeyPair();
  const payload = {
    agentId: "weather.agent",
    version: "1.0.0",
    capabilities: ["weather.query", "weather.forecast"],
    endpoint: "http://weather-agent:3001/facts",
    publicKey: "pub-key-placeholder",
    issuedAt: "2026-05-28T00:00:00.000Z"
  };

  const signature = signPayload(payload, keys.privateKey);
  const valid = verifyPayload(payload, signature, keys.publicKey);

  assert.equal(typeof signature, "string");
  assert.equal(valid, true);
});

test("verifyPayload fails when payload is modified", () => {
  const keys = generateKeyPair();
  const payload = {
    agentId: "finance.agent",
    version: "1.0.0",
    capabilities: ["finance.prices"],
    endpoint: "http://finance-agent:3003/facts",
    publicKey: "pub-key-placeholder",
    issuedAt: "2026-05-28T00:00:00.000Z"
  };

  const signature = signPayload(payload, keys.privateKey);
  const tampered = {
    ...payload,
    version: "1.0.1"
  };

  const valid = verifyPayload(tampered, signature, keys.publicKey);
  assert.equal(valid, false);
});
