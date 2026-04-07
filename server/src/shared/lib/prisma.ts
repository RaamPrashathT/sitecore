import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, Prisma } from '../../../generated/prisma/client.js'
import { env } from "../config/env.js";

const connectionString = env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter })

export { prisma, Prisma };