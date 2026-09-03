import { z } from 'zod';

/**
 * Configuração centralizada do servidor, carregada de variáveis de ambiente.
 * Nenhum valor secreto reside no código-fonte; apenas nomes de variáveis.
 */

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),
});

export type Config = z.infer<typeof envSchema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const parsed = envSchema.safeParse(env);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ');

    throw new Error(`Configuração inválida: ${issues}`);
  }

  return parsed.data;
}
