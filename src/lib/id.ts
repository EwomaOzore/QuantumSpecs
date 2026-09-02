import { randomBytes } from "node:crypto";

export function id(prefix: string) {
  return `${prefix}_${randomBytes(6).toString("hex")}`;
}
