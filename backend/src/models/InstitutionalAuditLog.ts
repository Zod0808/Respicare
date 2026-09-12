/**
 * Institutional Audit Log Model (Sprint 13)
 *
 * Dedicated audit trail for traffic coming from external institutional clients
 * (MINSA/DIRESA, SINADEF), kept separate from the regular application logs so
 * institutional access can be reviewed independently.
 */

import mongoose, { Document, Model, Schema } from 'mongoose';

export interface InstitutionalAuditLogDocument extends Document {
  clientId?: string;
  clientName?: string;
  method: string;
  path: string;
  statusCode: number;
  success: boolean;
  ip?: string;
  errorMessage?: string;
  createdAt: Date;
}

const InstitutionalAuditLogSchema = new Schema<InstitutionalAuditLogDocument, Model<InstitutionalAuditLogDocument>>(
  {
    clientId: { type: String, index: true },
    clientName: { type: String },
    method: { type: String, required: true },
    path: { type: String, required: true },
    statusCode: { type: Number, required: true },
    success: { type: Boolean, required: true, index: true },
    ip: { type: String },
    errorMessage: { type: String },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

InstitutionalAuditLogSchema.index({ createdAt: -1 });

export default mongoose.model<InstitutionalAuditLogDocument>(
  'InstitutionalAuditLog',
  InstitutionalAuditLogSchema
);
