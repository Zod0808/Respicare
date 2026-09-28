import { z } from 'zod';

const MIN_SECRET_LENGTH = 32;

const SECRET_GENERATION_HINT =
  'Genera uno seguro con: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'base64\'))"';

// Patrones tomados de las plantillas reales del repo (.env.example, .env.production,
// .env.vm, .env.server) y de convenciones habituales de placeholders. Sirven para que
// un despliegue no arranque nunca con un secreto "de mentira" copiado sin reemplazar.
const PLACEHOLDER_PATTERNS: RegExp[] = [
  /cambiar/i,
  /cambia_/i,
  /generar_con/i,
  /genera_(un|otro)/i,
  /pon_una/i,
  /placeholder/i,
  /change[_-]?me/i,
  /changethis/i,
  /your_/i,
  /tu_(secreto|app|clave)/i,
  /replace[_-]?me/i,
  /secreto_aqui/i,
  /password_aqui/i,
  /clave_real/i,
  /xxxxx/i,
  /admin1234/i,
  /\badmin123\b/i,
  /password123/i,
  /^demo1234$/i,
  /usuario:password/i,
  /username:password/i
];

const isPlaceholder = (value: string): boolean =>
  PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(value));

const secretSchema = (name: string) =>
  z
    .string({ required_error: `Variable de entorno requerida no encontrada: ${name}` })
    .min(1, `Variable de entorno requerida no encontrada: ${name}`)
    .min(
      MIN_SECRET_LENGTH,
      `${name} debe tener al menos ${MIN_SECRET_LENGTH} caracteres. ${SECRET_GENERATION_HINT}`
    )
    .refine((value) => !isPlaceholder(value), {
      message: `${name} parece ser un valor de ejemplo/placeholder, no un secreto real. ${SECRET_GENERATION_HINT}`
    });

const envSchema = z
  .object({
    MONGODB_URI: z
      .string({ required_error: 'Variable de entorno requerida no encontrada: MONGODB_URI' })
      .min(1, 'Variable de entorno requerida no encontrada: MONGODB_URI')
      .refine((value) => !isPlaceholder(value), {
        message:
          'MONGODB_URI contiene credenciales de ejemplo/placeholder, no una cadena de conexión real.'
      }),
    JWT_SECRET: secretSchema('JWT_SECRET'),
    JWT_REFRESH_SECRET: secretSchema('JWT_REFRESH_SECRET')
  })
  .refine((data) => data.JWT_SECRET !== data.JWT_REFRESH_SECRET, {
    message: 'JWT_SECRET y JWT_REFRESH_SECRET deben ser distintos entre sí',
    path: ['JWT_REFRESH_SECRET']
  });

// Se ejecuta una sola vez al cargar config.ts: si falta un secreto o si detecta uno
// de ejemplo/demo, la app no debe llegar a arrancar.
export const validateEnv = (rawEnv: NodeJS.ProcessEnv = process.env): void => {
  const result = envSchema.safeParse(rawEnv);
  if (!result.success) {
    const messages = result.error.errors.map((issue) => issue.message);
    throw new Error(`Configuración de entorno inválida:\n- ${messages.join('\n- ')}`);
  }
};
