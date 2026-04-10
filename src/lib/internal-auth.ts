import { timingSafeEqual } from "node:crypto";

const toComparableBuffer = (value: string) => Buffer.from(value, "utf8");

export const tokenMatches = (
  expectedToken: string | undefined,
  providedToken: string | null,
): boolean => {
  if (!expectedToken || !providedToken) {
    return false;
  }

  const expected = toComparableBuffer(expectedToken);
  const provided = toComparableBuffer(providedToken);

  if (expected.length !== provided.length) {
    return false;
  }

  return timingSafeEqual(expected, provided);
};
