import { z } from 'zod';

// Aucun import de configuration, de framework ou de client de données.
// Le sous-chemin ./server est interdit à la résolution navigateur du package.
export const healthQuerySchema = z.strictObject({});
export const requestIdSchema = z
  .string()
  .length(36)
  .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
  .transform((value) => value.toLowerCase());
