import { createHash, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE = "queueless_admin_session";

function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function getExpectedAdminHash() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    throw new Error("Admin credentials are not configured. Set ADMIN_USERNAME and ADMIN_PASSWORD.");
  }

  return hashValue(`${username}:${password}`);
}

export function createAdminSessionValue() {
  return getExpectedAdminHash();
}

export function isValidAdminSession(value?: string | null) {
  if (!value) {
    return false;
  }

  const expected = Buffer.from(getExpectedAdminHash());
  const incoming = Buffer.from(value);

  if (expected.length !== incoming.length) {
    return false;
  }

  return timingSafeEqual(expected, incoming);
}
