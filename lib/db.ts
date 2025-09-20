// lib/db.ts
import { PrismaClient } from "@prisma/client";

declare global {
  // prevent creating multiple instances of PrismaClient in dev (HMR)
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  global.__prisma ??
  new PrismaClient({ log: process.env.NODE_ENV === "development" ? ["query"] : [] });

if (process.env.NODE_ENV === "development") global.__prisma = prisma;
