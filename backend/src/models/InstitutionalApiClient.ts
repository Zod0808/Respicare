/**
 * Institutional API Client Model (Sprint 13)
 *
 * Represents an external institutional consumer (e.g. MINSA/DIRESA Tacna, SINADEF)
 * authorized to send and receive information through the interoperability API,
 * independent of the regular JWT-based user/role model used by patients/doctors/admins.
 */

import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export type InstitutionalApiScope =
  | 'epidemiological:read'
  | 'health-centers:write'
  | 'alerts:write';

export const INSTITUTIONAL_API_SCOPES: InstitutionalApiScope[] = [
  'epidemiological:read',
  'health-centers:write',
  'alerts:write',
];

export interface InstitutionalApiClientDocument extends Document {
  name: string;
  keyPrefix: string;
  keyHash: string;
  scopes: InstitutionalApiScope[];
  isActive: boolean;
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  verifyKey(candidateKey: string): Promise<boolean>;
}

export interface InstitutionalApiClientModel extends Model<InstitutionalApiClientDocument> {
  hashKey(key: string): Promise<string>;
  generateKey(): { key: string; keyPrefix: string };
}

const KEY_PREFIX_LENGTH = 14; // 'rcinst_' + 7 hex chars

const InstitutionalApiClientSchema = new Schema<InstitutionalApiClientDocument, InstitutionalApiClientModel>(
  {
    name: {
      type: String,
      required: [true, 'El nombre del cliente institucional es obligatorio'],
      trim: true,
      maxlength: [150, 'El nombre no puede exceder 150 caracteres'],
    },
    keyPrefix: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    keyHash: {
      type: String,
      required: true,
    },
    scopes: {
      type: [String],
      enum: INSTITUTIONAL_API_SCOPES,
      default: [],
      validate: {
        validator: (value: string[]) => value.length > 0,
        message: 'Debe especificar al menos un scope',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastUsedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

InstitutionalApiClientSchema.methods.verifyKey = async function (
  this: InstitutionalApiClientDocument,
  candidateKey: string
): Promise<boolean> {
  return bcrypt.compare(candidateKey, this.keyHash);
};

InstitutionalApiClientSchema.statics.hashKey = async function (key: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(key, saltRounds);
};

InstitutionalApiClientSchema.statics.generateKey = function (): { key: string; keyPrefix: string } {
  const key = `rcinst_${crypto.randomBytes(32).toString('hex')}`;
  const keyPrefix = key.slice(0, KEY_PREFIX_LENGTH);
  return { key, keyPrefix };
};

export default mongoose.model<InstitutionalApiClientDocument, InstitutionalApiClientModel>(
  'InstitutionalApiClient',
  InstitutionalApiClientSchema
);
