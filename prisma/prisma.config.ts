import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'prisma/config';
config({
  path: fileURLToPath(new URL('../apps/api/.env', import.meta.url)),
  quiet: true,
});
// La g?n?ration ne n?cessite pas de connexion ; scripts/db.mjs prot?ge les migrations.
export default defineConfig({
  schema: './schema.prisma',
  migrations: { path: './migrations' },
  datasource: { url: process.env.DATABASE_URL ?? '' },
});
