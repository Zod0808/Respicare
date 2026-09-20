/**
 * Rota FIELD_ENCRYPTION_KEY: re-cifra en Mongo todos los campos protegidos
 * por applyFieldEncryption() usando la clave vieja para descifrar y la
 * nueva para re-cifrar. Usa las colecciones nativas (mongoose.connection.collection)
 * para no disparar los hooks pre('save')/pre('findOneAndUpdate') del modelo,
 * que solo conocen una clave (process.env.FIELD_ENCRYPTION_KEY) a la vez.
 *
 * Uso:
 *   MONGODB_URI=... \
 *   OLD_FIELD_ENCRYPTION_KEY=<clave-filtrada-o-actual> \
 *   NEW_FIELD_ENCRYPTION_KEY=<clave-nueva> \
 *   ts-node --transpile-only src/scripts/rotateFieldEncryptionKey.ts [--dry-run]
 *
 * Requiere que OLD y NEW sean distintas y decodifiquen a 32 bytes en base64.
 * Ejecutar contra un backup antes de correr en la base real.
 */
import mongoose from 'mongoose';
import { encryptString, decryptString } from '../utils/encryption';

interface FieldSpec {
  collection: string;
  fields: string[];
}

const TARGETS: FieldSpec[] = [
  { collection: 'users', fields: ['name', 'avatar', 'phone'] },
  { collection: 'alerts', fields: ['title', 'message', 'lastError'] },
  { collection: 'prescriptions', fields: ['diagnosis', 'observations', 'validationNotes'] },
  {
    collection: 'appointments',
    fields: ['reason', 'notes', 'location.address', 'location.meetingLink', 'cancellationReason'],
  },
  {
    collection: 'informedconsents',
    fields: ['description', 'procedureDetails', 'revokedReason'],
  },
  { collection: 'labresults', fields: ['notes'] },
  {
    collection: 'medicalhistories',
    fields: ['patientName', 'diagnosis', 'description', 'audioNotes', 'location.address'],
  },
];

function parseKey(name: string): Buffer {
  const raw = process.env[name] || '';
  if (!raw) throw new Error(`${name} no está definida`);
  const key = Buffer.from(raw, 'base64');
  if (key.length !== 32) throw new Error(`${name} debe decodificar a 32 bytes en base64 (AES-256)`);
  return key;
}

function getPath(doc: any, path: string): unknown {
  return path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), doc);
}

async function rotateCollection(
  conn: mongoose.Connection,
  spec: FieldSpec,
  oldKey: Buffer,
  newKey: Buffer,
  dryRun: boolean
) {
  const col = conn.collection(spec.collection);
  let scanned = 0;
  let updated = 0;

  for (const field of spec.fields) {
    const cursor = col.find({ [field]: { $regex: '^enc:' } }, { projection: { [field]: 1 } });
    const ops: mongoose.mongo.AnyBulkWriteOperation[] = [];

    for await (const doc of cursor) {
      scanned++;
      const current = getPath(doc, field);
      if (typeof current !== 'string' || !current.startsWith('enc:')) continue;

      const plaintext = decryptString(current.slice(4), oldKey);
      const reEncrypted = `enc:${encryptString(plaintext, newKey)}`;
      ops.push({
        updateOne: {
          filter: { _id: doc._id },
          update: { $set: { [field]: reEncrypted } },
        },
      });
    }

    if (ops.length && !dryRun) {
      const res = await col.bulkWrite(ops, { ordered: false });
      updated += res.modifiedCount ?? 0;
    } else {
      updated += ops.length;
    }

    console.log(
      `  [${spec.collection}.${field}] escaneados=${scanned} ${dryRun ? 'a-rotar' : 'rotados'}=${ops.length}`
    );
    scanned = 0;
  }

  return updated;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI no está definida');

  const oldKey = parseKey('OLD_FIELD_ENCRYPTION_KEY');
  const newKey = parseKey('NEW_FIELD_ENCRYPTION_KEY');
  if (oldKey.equals(newKey)) throw new Error('OLD_FIELD_ENCRYPTION_KEY y NEW_FIELD_ENCRYPTION_KEY son iguales');

  console.log(`Conectando a MongoDB${dryRun ? ' (dry-run, no se escribirá nada)' : ''}...`);
  const conn = await mongoose.createConnection(uri).asPromise();

  let total = 0;
  try {
    for (const spec of TARGETS) {
      console.log(`Colección: ${spec.collection}`);
      total += await rotateCollection(conn, spec, oldKey, newKey, dryRun);
    }
  } finally {
    await conn.close();
  }

  console.log(`\nListo. Campos ${dryRun ? 'pendientes de rotar' : 'rotados'}: ${total}`);
  if (dryRun) console.log('Vuelve a correr sin --dry-run para aplicar los cambios.');
}

main().catch((err) => {
  console.error('Rotación falló:', err);
  process.exit(1);
});
