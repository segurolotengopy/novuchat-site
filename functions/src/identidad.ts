/**
 * Identidad de ejecución de las Functions.
 *
 * POR QUÉ EXISTE. Por defecto, las Functions gen2 corren con la cuenta de
 * cómputo del proyecto (`<numero>-compute@developer.gserviceaccount.com`), que
 * lleva `roles/editor`: permiso de escritura sobre casi todo el proyecto.
 *
 * Eso desentona con el resto del diseño. Las reglas de Firestore niegan **todo**
 * al cliente precisamente para que solo estas dos funciones escriban; dejar
 * luego esa identidad con permiso de editor general anula buena parte del
 * argumento. Si una de las dos llegara a ejecutarse con entrada controlada por
 * un tercero, el alcance del daño sería el proyecto entero en vez de tres
 * colecciones.
 *
 * Esta cuenta tiene lo justo y nada más:
 *
 *   roles/datastore.user               leer y escribir Firestore
 *   roles/aiplatform.user              llamar a Vertex AI (el asistente)
 *   roles/logging.logWriter            escribir registros
 *   roles/monitoring.metricWriter      métricas de Cloud Run
 *   roles/secretmanager.secretAccessor SOLO sobre SAL_HASH y FORMSUBMIT_ALIAS,
 *                                      concedido por secreto, no en el proyecto
 *
 * Lo que NO puede hacer, y antes sí: desplegar, tocar IAM, leer otros secretos,
 * borrar la base de datos, modificar reglas ni cambiar la configuración de
 * hosting.
 */
export const CUENTA_EJECUCION = 'novuchat-functions@novuchat-site.iam.gserviceaccount.com';
