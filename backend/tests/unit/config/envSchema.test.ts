import { validateEnv } from '../../../src/config/envSchema';

const STRONG_SECRET_A = 'k7Qw9pR2xL4mN8vB1cD5fG3hJ6sT0uY9zA2eW4rC7iO1p';
const STRONG_SECRET_B = 'v3Bn8mK1lQ5wE9rT2yU6iO4pA7sD0fG3hJ5kL8zX1cV6b';

const baseEnv = {
  MONGODB_URI: 'mongodb://user:realpassword@localhost:27017/respicare',
  JWT_SECRET: STRONG_SECRET_A,
  JWT_REFRESH_SECRET: STRONG_SECRET_B
} as NodeJS.ProcessEnv;

describe('validateEnv', () => {
  it('does not throw when all secrets are strong and distinct', () => {
    expect(() => validateEnv(baseEnv)).not.toThrow();
  });

  it.each(['MONGODB_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET'])(
    'throws when %s is missing',
    (key) => {
      const env = { ...baseEnv };
      delete (env as Record<string, string>)[key];
      expect(() => validateEnv(env)).toThrow(/requerida no encontrada/);
    }
  );

  it('throws when a JWT secret is shorter than 32 characters', () => {
    const env = { ...baseEnv, JWT_SECRET: 'demasiado-corto' };
    expect(() => validateEnv(env)).toThrow(/al menos 32 caracteres/);
  });

  it('throws when JWT_SECRET and JWT_REFRESH_SECRET are identical', () => {
    const env = { ...baseEnv, JWT_REFRESH_SECRET: STRONG_SECRET_A };
    expect(() => validateEnv(env)).toThrow(/deben ser distintos/);
  });

  it.each([
    'CAMBIAR_ESTE_SECRET_JWT_ALGO_MAS_LARGO_AQUI',
    'GENERAR_CON_OPENSSL_RAND_BASE64_64_DIFERENTE',
    'change_me_strong_jwt_secret_pero_mas_largo',
    'your_super_secret_jwt_value_placeholder_here'
  ])('throws when JWT_SECRET looks like a placeholder value (%s)', (placeholder) => {
    const env = { ...baseEnv, JWT_SECRET: placeholder };
    expect(() => validateEnv(env)).toThrow(/placeholder/);
  });

  it('throws when MONGODB_URI still contains template credentials', () => {
    const env = {
      ...baseEnv,
      MONGODB_URI: 'mongodb://username:password@host:27017/respicare?authSource=admin'
    };
    expect(() => validateEnv(env)).toThrow(/credenciales de ejemplo/);
  });

  it('throws when MONGODB_URI is missing', () => {
    const env = { ...baseEnv };
    delete (env as Record<string, string>).MONGODB_URI;
    expect(() => validateEnv(env)).toThrow(/MONGODB_URI/);
  });
});
