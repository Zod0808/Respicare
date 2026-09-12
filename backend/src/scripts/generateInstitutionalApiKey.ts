/**
 * CLI script to register an institutional API client (Sprint 13) and print its
 * plaintext API key ONCE. Only the bcrypt hash is persisted, so the key must
 * be captured now and stored securely (e.g. handed off to MINSA/SINADEF or a
 * secrets manager).
 *
 * Usage:
 *   npm run institutional:generate-key -- --name "MINSA DIRESA Tacna" --scopes epidemiological:read,alerts:write
 *
 * Available scopes: epidemiological:read, health-centers:write, alerts:write
 */

import mongoose from 'mongoose';
import InstitutionalApiClient, { INSTITUTIONAL_API_SCOPES, InstitutionalApiScope } from '../models/InstitutionalApiClient';
import { config } from '../config/config';
import { logger } from '../utils/logger';

function parseArgs(argv: string[]): { name?: string; scopes: InstitutionalApiScope[] } {
  const args: Record<string, string> = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const value = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : '';
      args[key] = value;
      i += 1;
    }
  }

  const scopes = (args.scopes ? args.scopes.split(',') : INSTITUTIONAL_API_SCOPES).map((scope) =>
    scope.trim()
  ) as InstitutionalApiScope[];

  const invalidScopes = scopes.filter((scope) => !INSTITUTIONAL_API_SCOPES.includes(scope));
  if (invalidScopes.length > 0) {
    throw new Error(
      `Scopes inválidos: ${invalidScopes.join(', ')}. Válidos: ${INSTITUTIONAL_API_SCOPES.join(', ')}`
    );
  }

  return { name: args.name, scopes };
}

async function generateInstitutionalApiKey(): Promise<void> {
  const { name, scopes } = parseArgs(process.argv.slice(2));

  if (!name) {
    throw new Error('Debe especificar --name "<nombre del cliente institucional>"');
  }

  await mongoose.connect(config.database.mongodb, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  try {
    const { key, keyPrefix } = InstitutionalApiClient.generateKey();
    const keyHash = await InstitutionalApiClient.hashKey(key);

    const client = await InstitutionalApiClient.create({
      name,
      keyPrefix,
      keyHash,
      scopes,
      isActive: true,
    });

    // eslint-disable-next-line no-console
    console.log('\n✅ Cliente institucional creado:');
    // eslint-disable-next-line no-console
    console.log(`   ID:      ${client.id}`);
    // eslint-disable-next-line no-console
    console.log(`   Nombre:  ${client.name}`);
    // eslint-disable-next-line no-console
    console.log(`   Scopes:  ${client.scopes.join(', ')}`);
    // eslint-disable-next-line no-console
    console.log(`\n🔑 API Key (guárdela ahora, no se volverá a mostrar):\n   ${key}\n`);
  } finally {
    await mongoose.connection.close();
  }
}

if (require.main === module) {
  generateInstitutionalApiKey()
    .then(() => process.exit(0))
    .catch((error) => {
      logger.error('Falló la generación de la API key institucional', { error: error.message });
      // eslint-disable-next-line no-console
      console.error(`\n❌ ${error.message}\n`);
      process.exit(1);
    });
}

export default generateInstitutionalApiKey;
