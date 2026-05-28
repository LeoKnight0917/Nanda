import { generateKeyPairSync, sign, verify } from "node:crypto";
import { canonicalStringify, type CanonicalJsonValue } from "./canonical-json";

export interface Ed25519KeyPair {
  publicKey: string;
  privateKey: string;
}

export function generateKeyPair(): Ed25519KeyPair {
  const { publicKey, privateKey } = generateKeyPairSync("ed25519");

  return {
    publicKey: publicKey.export({ type: "spki", format: "pem" }).toString(),
    privateKey: privateKey.export({ type: "pkcs8", format: "pem" }).toString()
  };
}

export function signPayload(payload: CanonicalJsonValue, privateKey: string): string {
  const message = canonicalStringify(payload);
  const signature = sign(null, Buffer.from(message), privateKey);
  return signature.toString("base64");
}

export function verifyPayload(
  payload: CanonicalJsonValue,
  signature: string,
  publicKey: string
): boolean {
  const message = canonicalStringify(payload);
  return verify(null, Buffer.from(message), publicKey, Buffer.from(signature, "base64"));
}
