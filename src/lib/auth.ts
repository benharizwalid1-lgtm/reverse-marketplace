import bcrypt from "bcryptjs";
import { findUserById, hydrateUser } from "./db";
import { getSession } from "./session";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function requireUser() {
  const session = await getSession();
  if (!session) return null;
  return findUserById(session.id);
}

export async function currentUser() {
  const session = await getSession();
  if (!session) return null;
  const user = findUserById(session.id);
  if (!user) return null;
  return hydrateUser(user);
}
