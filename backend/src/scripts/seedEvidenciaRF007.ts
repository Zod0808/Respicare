/**
 * Script temporal (no forma parte del seed oficial) usado únicamente para
 * generar evidencias reales de pruebas del RF-007 (Panel del médico).
 * Crea un AIAnalysis pendiente de revisión para el paciente de evidencia QA.
 */
import mongoose from 'mongoose';
import AIAnalysis from '../models/AIAnalysis';
import MedicalHistory from '../models/MedicalHistory';
import WearableData from '../models/WearableData';
import User from '../models/User';
import { config } from '../config/config';

const run = async () => {
  await mongoose.connect(config.database.mongodb);

  const patient = await User.findOne({ email: 'paciente.evidencia@respicare.com' });
  const doctor = await User.findOne({ email: 'doctor.evidencia@respicare.com' });
  if (!patient || !doctor) {
    throw new Error('Paciente/doctor de evidencia no encontrados. Registrar primero.');
  }

  const analysis = await AIAnalysis.create({
    patientId: patient._id.toString(),
    symptoms: [
      { name: 'tos persistente', severity: 'moderate', duration: '5 días', description: 'Tos seca intermitente, peor en las noches' },
      { name: 'dificultad para respirar', severity: 'severe', duration: '2 días', description: 'Disnea al realizar esfuerzo leve' },
      { name: 'fiebre', severity: 'moderate', duration: '3 días', description: '38.4°C intermitente' },
    ],
    possibleDiagnoses: [
      { condition: 'Neumonía adquirida en la comunidad', probability: 78, recommendations: ['Radiografía de tórax', 'Evaluación presencial urgente', 'Iniciar antibioticoterapia empírica si se confirma'] },
      { condition: 'Bronquitis aguda', probability: 15, recommendations: ['Reposo e hidratación', 'Control en 48h si no mejora'] },
    ],
    urgency: 'high',
    confidence: 78,
    timestamp: new Date(),
  });
  console.log('AIAnalysis creado:', analysis._id.toString());

  const history = await MedicalHistory.create({
    patientId: patient._id.toString(),
    doctorId: doctor._id.toString(),
    patientName: patient.name,
    age: 34,
    diagnosis: 'Sospecha de neumonía adquirida en la comunidad',
    symptoms: [
      { name: 'tos persistente', severity: 'moderate', duration: '5 días' },
      { name: 'dificultad para respirar', severity: 'severe', duration: '2 días' },
      { name: 'fiebre', severity: 'moderate', duration: '3 días' },
    ],
    description: 'Paciente reporta síntomas respiratorios con predicción de IA de alta urgencia, pendiente de revisión médica.',
    date: new Date(),
  });
  console.log('MedicalHistory creado:', history._id.toString());

  const now = Date.now();
  const spo2Readings = [96, 95, 94, 93, 92, 91, 90];
  for (let i = 0; i < spo2Readings.length; i++) {
    const daysAgo = spo2Readings.length - 1 - i;
    await WearableData.create({
      patientId: patient._id.toString(),
      oxygenSaturation: spo2Readings[i],
      heartRate: 78 + i,
      respiratoryRate: 16 + i,
      timestamp: new Date(now - daysAgo * 24 * 60 * 60 * 1000),
      source: 'manual',
    });
  }
  console.log('WearableData (7 días SpO2) creado');

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
