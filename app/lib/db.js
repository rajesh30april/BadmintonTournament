import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;
const createClient = () => new PrismaClient({ log: ["error", "warn"] });

let prisma = globalForPrisma.prisma || createClient();

const ensurePrisma = () => {
  if (!prisma.matchLike) {
    prisma = createClient();
  }
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
  }
  return prisma;
};

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export { prisma, ensurePrisma };
