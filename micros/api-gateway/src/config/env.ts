import { z } from 'zod';

const booleanString = z.enum(['true', 'false']);

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().max(65535).default(4000),
  HOST: z.string().trim().min(1).default('0.0.0.0'),
  TRUST_PROXY: booleanString.default('false'),
  CORS_ORIGIN: z.string().optional(),
  CORS_ORIGINS: z.string().optional(),
  CORS_CREDENTIALS: booleanString.default('false'),
  JSON_BODY_LIMIT: z.string().trim().min(1).default('1mb'),
  URLENCODED_EXTENDED: booleanString.default('true'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(1000),
  RATE_LIMIT_MESSAGE: z
    .string()
    .trim()
    .min(1)
    .default('Too many requests from this IP, please try again later.'),
  GATEWAY_PROXY_TIMEOUT_MS: z.coerce.number().int().positive().default(5000),
  REQUIRE_AUTH: booleanString.default('false'),
});

type ParsedEnv = z.infer<typeof envSchema>;

const parseCorsOrigins = (value?: string): '*' | string[] => {
  if (!value) {
    return '*';
  }

  const origins = value
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

  if (origins.length === 0 || origins.includes('*')) {
    return '*';
  }

  return [...new Set(origins)];
};

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid API gateway environment configuration', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid API gateway environment configuration');
}

const env: ParsedEnv = parsed.data;
const corsOrigins = parseCorsOrigins(env.CORS_ORIGINS ?? env.CORS_ORIGIN);
const allowAllOrigins = corsOrigins === '*';
const requestedCorsCredentials = env.CORS_CREDENTIALS === 'true';

if (allowAllOrigins && requestedCorsCredentials) {
  console.warn('CORS_CREDENTIALS=true is ignored when CORS_ORIGINS=*');
}

export const gatewayConfig = {
  port: env.PORT,
  host: env.HOST,
  trustProxy: env.TRUST_PROXY === 'true',
  jsonBodyLimit: env.JSON_BODY_LIMIT,
  urlencodedExtended: env.URLENCODED_EXTENDED === 'true',
  requireAuth: env.REQUIRE_AUTH === 'true',
  proxyTimeoutMs: env.GATEWAY_PROXY_TIMEOUT_MS,
  cors: {
    allowAllOrigins,
    origins: allowAllOrigins ? [] : corsOrigins,
    credentials: !allowAllOrigins && requestedCorsCredentials,
  },
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    message: env.RATE_LIMIT_MESSAGE,
  },
} as const;
