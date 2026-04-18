export const tagTypes = [
  "User",
  "Land",
  "Transfer",
  "Auth",
  "Audit",
  "Payment",
] as const;

export type TagType = (typeof tagTypes)[number];