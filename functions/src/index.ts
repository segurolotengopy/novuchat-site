import { initializeApp } from 'firebase-admin/app';

/**
 * Punto de entrada de las Cloud Functions del sitio.
 *
 * El SDK Admin se inicializa una sola vez, aquí: es lo que permite que las
 * Functions escriban en Firestore mientras `firestore.rules` niega todo acceso
 * desde el navegador (riesgo S-5 del doc 04).
 */
initializeApp();

export { lead } from './lead.js';
export { asistente } from './asistente.js';
