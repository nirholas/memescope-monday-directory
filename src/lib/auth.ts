import { db, initDb } from './db';
import { users, sessions } from './db/schema';
import { eq } from 'drizzle-orm';
import { hashSync, compareSync } from 'bcryptjs';
import { cookies } from 'next/headers';
import type { User } from './db/schema';

const SESSION_COOKIE = 'mm_session';
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function generateId(length = 24): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < array.length; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
}

export async function registerUser(email: string, username: string, password: string): Promise<User> {
  await initDb();

  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length > 0) throw new Error('Email already registered');

  const existingUsername = await db.select().from(users).where(eq(users.username, username));
  if (existingUsername.length > 0) throw new Error('Username already taken');

  const id = generateId(16);
  const passwordHash = hashSync(password, 10);

  await db.insert(users).values({
    id,
    email,
    username,
    passwordHash,
    createdAt: new Date().toISOString(),
  });

  const rows = await db.select().from(users).where(eq(users.id, id));
  return rows[0];
}

export async function loginUser(email: string, password: string): Promise<User> {
  await initDb();

  const rows = await db.select().from(users).where(eq(users.email, email));
  if (rows.length === 0) throw new Error('Invalid email or password');

  const user = rows[0];
  const valid = compareSync(password, user.passwordHash);
  if (!valid) throw new Error('Invalid email or password');

  return user;
}

export async function createSession(userId: string): Promise<string> {
  await initDb();

  const id = generateId(16);
  const token = generateId(48);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();

  await db.insert(sessions).values({
    id,
    userId,
    token,
    expiresAt,
    createdAt: new Date().toISOString(),
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION_MS / 1000,
  });

  return token;
}

export async function destroySession(): Promise<void> {
  await initDb();

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.token, token));
    cookieStore.delete(SESSION_COOKIE);
  }
}

export async function getCurrentUser(): Promise<(Omit<User, 'passwordHash'>) | null> {
  try {
    await initDb();

    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return null;

    const sessionRows = await db.select().from(sessions).where(eq(sessions.token, token));
    if (sessionRows.length === 0) return null;

    const session = sessionRows[0];
    if (new Date(session.expiresAt) < new Date()) {
      await db.delete(sessions).where(eq(sessions.id, session.id));
      return null;
    }

    const userRows = await db.select().from(users).where(eq(users.id, session.userId));
    if (userRows.length === 0) return null;

    const { passwordHash: _, ...safeUser } = userRows[0];
    return safeUser;
  } catch {
    return null;
  }
}

export async function getUserIdFromRequest(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id ?? null;
}
