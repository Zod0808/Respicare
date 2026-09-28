/**
 * SMS Webhook Routes
 * Rutas para recibir webhooks de proveedores SMS
 */

import { Router } from 'express';
import {
  handleTwilioWebhook,
  handleAWSSNSWebhook,
  handleMessageBirdWebhook,
  verifyTwilioWebhook,
} from '../controllers/smsWebhookController';
import { validateRequest } from '../middleware/validation';
import {
  twilioWebhookSchema,
  awsSnsWebhookSchema,
  messageBirdWebhookSchema,
} from '../validators/smsWebhookValidators';

const router = Router();

// allowUnknown: true porque el proveedor controla la forma del payload, no nosotros
const webhookValidationOptions = { allowUnknown: true, stripUnknown: false };

// Middleware para parsear body como texto/xml para Twilio
router.use('/twilio', (req, res, next) => {
  if (req.is('application/x-www-form-urlencoded')) {
    // Body parser ya procesó esto, pero podemos verificar autenticación
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (authToken && !verifyTwilioWebhook(req, authToken)) {
      res.status(403).json({
        success: false,
        message: 'Webhook no autenticado',
      });
      return;
    }
  }
  next();
});

// Webhook de Twilio
router.post(
  '/twilio',
  validateRequest(twilioWebhookSchema, webhookValidationOptions),
  handleTwilioWebhook,
);

// Webhook de AWS SNS
router.post(
  '/aws-sns',
  validateRequest(awsSnsWebhookSchema, webhookValidationOptions),
  handleAWSSNSWebhook,
);

// Webhook de MessageBird
router.post(
  '/messagebird',
  validateRequest(messageBirdWebhookSchema, webhookValidationOptions),
  handleMessageBirdWebhook,
);

export default router;

