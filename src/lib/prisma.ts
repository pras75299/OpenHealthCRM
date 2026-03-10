import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// determine if we're running in a Vercel build environment or explicitly skipping DB init
const isVercel = !!process.env.VERCEL;
const skipDbInit = process.env.SKIP_DB_INIT === "true" || isVercel;

const connectionString = process.env.DATABASE_URL || "";

let adapter: any = undefined;

// Neon cold starts can take 5–15s; increase timeout so first request doesn't fail
if (!skipDbInit && connectionString) {
  try {
    const pool = new Pool({
      connectionString,
      connectionTimeoutMillis: 30_000,
      idleTimeoutMillis: 30_000,
    });
    adapter = new PrismaPg(pool);
  } catch (err) {
    console.warn(
      "Prisma pool initialization failed, continuing without adapter:",
      err,
    );
  }
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

let client: any;
if (skipDbInit) {
  // during build or when skipping, provide a dummy proxy client that throws if used
  client =
    globalForPrisma.prisma ||
    new Proxy(
      {},
      {
        get(target, prop) {
          if (prop === "__isPrismaClient") return true;
          return () => {
            throw new Error(
              "Prisma client is disabled in the current environment",
            );
          };
        },
      },
    );
} else {
  client =
    globalForPrisma.prisma ||
    new PrismaClient({
      ...(adapter ? { adapter } : {}),
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "error", "warn"]
          : ["error"],
    });
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
}

export const prisma: typeof client = client;
