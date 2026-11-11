import { PrismaClient } from '@prisma/client';

function normalizeDatabaseUrl(url: string | undefined) {
  if (!url) return url;

  url = url.trim().replace(/^["']|["']$/g, '');

  // Supabase passwords may contain URL-reserved characters. Normalize only the
  // credentials portion so Prisma receives a valid PostgreSQL connection URL.
  const protocolEnd = url.indexOf('://');
  const pathStart = url.indexOf('/', protocolEnd + 3);
  const authorityEnd = pathStart === -1 ? url.length : pathStart;
  const authority = url.slice(protocolEnd + 3, authorityEnd);
  const atIndex = authority.lastIndexOf('@');
  const colonIndex = authority.indexOf(':');

  if (protocolEnd === -1 || atIndex === -1 || colonIndex === -1 || colonIndex > atIndex) {
    return url;
  }

  const username = authority.slice(0, colonIndex);
  const rawPassword = authority.slice(colonIndex + 1, atIndex);
  const host = authority.slice(atIndex + 1);
  let decodedPassword = rawPassword;

  try {
    decodedPassword = decodeURIComponent(rawPassword);
  } catch {
    // Keep the raw value; encodeURIComponent below will handle it.
  }

  return `${url.slice(0, protocolEnd + 3)}${username}:${encodeURIComponent(decodedPassword)}@${host}${url.slice(authorityEnd)}`;
}

process.env.DATABASE_URL = normalizeDatabaseUrl(process.env.DATABASE_URL);

const prisma = new PrismaClient();

export default prisma;
