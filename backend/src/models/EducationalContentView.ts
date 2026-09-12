/**
 * Nombre de Objeto: EducationalContentView (modelo Mongoose)
 * Fecha de Creación: 2026-09-02
 * Propietario: Cesar Fabian Chavez Linares
 * Requerimiento: RF-011 - Módulo educativo
 * Descripción: Registra cada consulta de un usuario a un contenido educativo
 * (userId, contentId, fecha), usado para métricas de consumo del módulo.
 */
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface EducationalContentViewDocument extends Document {
  userId: string;
  contentId: mongoose.Types.ObjectId;
  consultedAt: Date;
}

const EducationalContentViewSchema = new Schema<EducationalContentViewDocument>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  contentId: {
    type: Schema.Types.ObjectId,
    ref: 'EducationalContent',
    required: true,
    index: true,
  },
  consultedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

EducationalContentViewSchema.index({ userId: 1, consultedAt: -1 });

export const EducationalContentViewModel: Model<EducationalContentViewDocument> =
  (mongoose.models.EducationalContentView as Model<EducationalContentViewDocument>) ??
  mongoose.model<EducationalContentViewDocument>('EducationalContentView', EducationalContentViewSchema);

export default EducationalContentViewModel;
