import { PrismaClient } from "@prisma/client";

// Force Prisma to use the Node (binary) engine instead of the new "client" engine
// which requires an adapter/accelerateUrl. This runs before any PrismaClient is created.
process.env.PRISMA_CLIENT_ENGINE_TYPE ??= "binary";

// 1. Declare a global variable to hold the PrismaClient instance.
// This is necessary to persist the instance across hot-reloads in development.
declare global {
  // Use a unique symbol or string key to avoid conflicts, though 'prisma' is common.
  // We use `var` instead of `const` here because we are extending the global namespace.
  var cachedPrisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  // 2. In Production: Always create a new instance (no caching needed).
  // The Node.js process is typically single-run or managed by a persistent container.
  prisma = new PrismaClient({
    log: ["error"], // Keep logs minimal in production
  });
} else {
  // 3. In Development: Use the cached instance if it exists on the global object.
  // This prevents exhausting database connections due to Next.js hot-reloading.

  // Check if the cached instance exists, otherwise create a new one.
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient({
      log: ["query", "info", "warn", "error"], // Log more details in development
    });
  }
  prisma = global.cachedPrisma;
}

export default prisma;

