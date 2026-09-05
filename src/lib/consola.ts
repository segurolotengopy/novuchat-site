/**
 * Enlace a la consola de NovuChat.
 *
 * Riesgo S-13 del doc 04: si `PUBLIC_URL_CONSOLA` apunta por error a otro
 * dominio, el sitio invita a sus propios clientes a entrar sus credenciales en
 * un lugar equivocado. Por eso la variable se valida **en build**, contra una
 * lista blanca, y el build falla si no coincide. Es una comprobación barata
 * contra un fallo caro.
 */
// Se quitó `novuchat-admin-prod.web.app` (2026-09-05). Era el dominio por
// defecto del proyecto de la consola y devuelve 404: la consola vive en su
// dominio propio. Mientras estuvo aquí, la variable apuntaba a él y el botón
// «Ingresar» llevó a una página muerta en producción —la validación comprueba
// que la URL esté PERMITIDA, no que exista—. Dejarlo en la lista solo servía
// para que un error de configuración pudiera repetir el fallo en silencio.
// Si algún día se publica algo ahí, se vuelve a añadir.
//
// Que la URL responda lo comprueba `pnpm enlaces` contra el sitio publicado,
// que es donde se puede saber de verdad.
const LISTA_BLANCA = ['https://consola.novuchat.site'] as const;

function resolver(): string {
  const valor = import.meta.env['PUBLIC_URL_CONSOLA'];

  if (!valor) {
    throw new Error(
      'Falta PUBLIC_URL_CONSOLA. Copie .env.example a .env y complete el valor.',
    );
  }

  if (!LISTA_BLANCA.includes(valor as (typeof LISTA_BLANCA)[number])) {
    throw new Error(
      `PUBLIC_URL_CONSOLA="${valor}" no está en la lista blanca. ` +
        `Valores permitidos: ${LISTA_BLANCA.join(', ')}. Ver doc 04, riesgo S-13.`,
    );
  }

  return valor;
}

export const urlConsola = resolver();
