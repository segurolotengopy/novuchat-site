import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { createHash } from 'node:crypto';

/**
 * Límite de tasa con ventana deslizante, en Firestore.
 *
 * Cubre el riesgo S-1 del doc 04: alguien en bucle contra el asistente consume
 * el presupuesto de inteligencia artificial en una tarde. También el S-4: relleno
 * de formularios.
 *
 * POR QUÉ FIRESTORE Y NO MEMORIA. Cloud Functions escala a varias instancias y
 * cada una tendría su propio contador; con veinte instancias, un límite de 20
 * mensajes se convierte en 400. El contador tiene que ser compartido.
 *
 * POR QUÉ SE GUARDAN MARCAS DE TIEMPO Y NO UN NÚMERO. Un contador con reinicio
 * por hora deja pasar una ráfaga al cruzar el borde: 20 a las 10:59 y 20 más a
 * las 11:00. Guardando las marcas se mide una ventana deslizante de verdad.
 */

/** Identificador estable y **no reversible** de quien llama. */
export function identificar(
  tokenAppCheck: string | undefined,
  ip: string | undefined,
  sal: string,
): string {
  // La IP nunca se guarda en claro (riesgo S-11). El hash lleva sal para que
  // no se pueda revertir por fuerza bruta: el espacio de IPv4 se recorre entero
  // en minutos si el hash va sin sal.
  const base = tokenAppCheck ?? ip ?? 'anonimo';
  return createHash('sha256').update(`${sal}:${base}`).digest('hex').slice(0, 32);
}

export interface Ventana {
  /** Cuántas peticiones se permiten. */
  maximo: number;
  /** En cuántos segundos. */
  segundos: number;
}

export interface ResultadoLimite {
  permitido: boolean;
  /** Cuántos segundos faltan para que se libere un cupo. */
  esperaSegundos: number;
  /** Cuál de las ventanas se agotó, para poder registrarlo. */
  ventanaAgotada?: string;
}

/**
 * Consume un cupo para `clave` si todas las ventanas lo permiten.
 *
 * Se ejecuta dentro de una transacción: sin ella, dos peticiones simultáneas
 * leen el mismo estado y las dos pasan, que es exactamente el caso que un
 * atacante provoca a propósito.
 */
export async function consumirCupo(
  coleccion: string,
  clave: string,
  ventanas: Record<string, Ventana>,
  ahora = Date.now(),
): Promise<ResultadoLimite> {
  const db = getFirestore();
  const ref = db.collection(coleccion).doc(clave);

  return db.runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    const marcas: number[] = (doc.data()?.['marcas'] as number[] | undefined) ?? [];

    // Solo interesa la ventana más larga: lo anterior ya no cuenta para nada.
    const ventanaMasLarga = Math.max(...Object.values(ventanas).map((v) => v.segundos));
    const vigentes = marcas.filter((m) => ahora - m < ventanaMasLarga * 1000);

    for (const [nombre, ventana] of Object.entries(ventanas)) {
      const desde = ahora - ventana.segundos * 1000;
      const enVentana = vigentes.filter((m) => m >= desde);

      if (enVentana.length >= ventana.maximo) {
        const masAntigua = Math.min(...enVentana);
        const espera = Math.ceil((masAntigua + ventana.segundos * 1000 - ahora) / 1000);
        return {
          permitido: false,
          esperaSegundos: Math.max(espera, 1),
          ventanaAgotada: nombre,
        };
      }
    }

    tx.set(
      ref,
      {
        marcas: [...vigentes, ahora],
        actualizado: FieldValue.serverTimestamp(),
        // Firestore borra el documento solo cuando pasa esta fecha, si la
        // política de TTL está configurada sobre el campo `expira`.
        expira: Timestamp.fromMillis(ahora + ventanaMasLarga * 1000 * 2),
      },
      { merge: true },
    );

    return { permitido: true, esperaSegundos: 0 };
  });
}

/** Ventanas del asistente (doc 03 §5.1 punto 2). */
export const VENTANAS_ASISTENTE: Record<string, Ventana> = {
  corta: { maximo: 20, segundos: 10 * 60 },
  diaria: { maximo: 100, segundos: 24 * 60 * 60 },
};

/** Ventanas del formulario (doc 04, riesgo S-4). */
export const VENTANAS_LEAD: Record<string, Ventana> = {
  horaria: { maximo: 5, segundos: 60 * 60 },
  diaria: { maximo: 20, segundos: 24 * 60 * 60 },
};
