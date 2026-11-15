import { hash, compare } from "bcryptjs";

const SALT_ROUNDS = 12;

/** Hash a plain-text password before storing in users.password_hash. */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS);
}

/** Verify a plain-text password against a stored hash. */
export async function comparePassword(
  plain: string,
  hashed: string
): Promise<boolean> {
  return compare(plain, hashed);
}
