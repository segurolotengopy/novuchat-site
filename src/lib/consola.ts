/**
 * Enlace a la consola de NovuChat.
 *
 * Riesgo S-13 del doc 04: si `PUBLIC_URL_CONSOLA` apunta por error a otro
 * dominio, el sitio invita a sus propios clientes a entrar sus credenciales en
 * un lugar equivocado. Por eso la variable se valida **en build**, contra una
 * lista blanca, y el build falla si no coincide. Es una comprobación barata
 * contra un fallo caro.
 */
const LISTA_BLANCA = [
  'https://consola.novuchat.site',
  'https://novuchat-admin-prod.web.app',
] as const;

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
