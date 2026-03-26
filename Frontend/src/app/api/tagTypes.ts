export const tagTypes = [
  "User",
  "Land",
  "Transfer",
  "Auth",
  "Audit",
] as const;

export type TagType = (typeof tagTypes)[number];