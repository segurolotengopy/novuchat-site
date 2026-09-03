import { describe, expect, it } from 'vitest';
import { construirAviso, type DatosLead } from '../../functions/src/lead';

/**
 * Riesgo S-14 del doc 04: el aviso de un lead sale hacia un tercero
 * (FormSubmit), y ese tercero **interpreta como instrucciones** los campos que
 * empiezan por guion bajo. Un `spread` del objeto recibido dejaría que quien
 * rellena el formulario agregue `_cc` y se lleve una copia de todos los leads,
 * o `_next` y redirija a quien lo envió a una página suya.
 *
 * Por eso el cuerpo se construye campo por campo, con nombres fijos. Estas
 * pruebas son la garantía de que sigue siendo así.
 */

const BASE: DatosLead = {
  nombre: 'Ana Quispe',
  negocio: 'Salón Aurora',
  correo: 'ana@ejemplo.com',
  whatsapp: '+59170000001',
  rubro: 'salud-belleza',
  ciudad: 'La Paz',
  clientes: '10 a 30',
  interes: 'Agenda de citas',
  plan: 'crecimiento',
  mensaje: 'Quiero ver cómo funciona.',
  origen: { pagina: '/demo', idioma: 'es', utm: {} },
  empresaWeb: '',
};

describe('construirAviso', () => {
  it('arma el aviso con nombres de campo fijos', () => {
    const aviso = construirAviso(BASE);
    expect(aviso['Nombre']).toBe('Ana Quispe');
    expect(aviso['Negocio']).toBe('Salón Aurora');
    expect(aviso['WhatsApp']).toBe('+59170000001');
  });

  it('NO deja pasar campos de instrucción de FormSubmit', () => {
    const hostil = {
      ...BASE,
      nombre: 'Ana',
      // Un atacante manda estos campos esperando que se vuelquen tal cual.
      _cc: 'atacante@ejemplo.com',
      _next: 'https://sitio-atacante.example',
      _replyto: 'atacante@ejemplo.com',
    } as unknown as DatosLead;

    const aviso = construirAviso(hostil);
    expect(aviso['_cc']).toBeUndefined();
    expect(aviso['_next']).toBeUndefined();
    expect(aviso['_replyto']).toBeUndefined();
  });

  it('solo conserva los tres campos de servicio que ponemos nosotros', () => {
    const aviso = construirAviso(BASE);
    const deServicio = Object.keys(aviso).filter((k) => k.startsWith('_'));
    expect(deServicio.sort()).toEqual(['_captcha', '_subject', '_template']);
  });

  it('neutraliza el marcado que venga en un campo', () => {
    const aviso = construirAviso({
      ...BASE,
      mensaje: '<a href="https://sitio-atacante.example">Haz clic acá</a>',
    });
    // El correo lo renderiza el tercero en HTML: si el enlace llegara vivo,
    // quien reciba el aviso vería un enlace escrito por un desconocido.
    expect(aviso['Mensaje']).not.toContain('<a');
    expect(aviso['Mensaje']).toContain('&lt;a');
  });

  it('impide inyectar un encabezado a través del asunto', () => {
    const aviso = construirAviso({ ...BASE, negocio: 'Salón\nBcc: otro@ejemplo.com' });
    expect(aviso['_subject']).not.toContain('\n');
    expect(aviso['_subject']).toContain('Bcc: otro@ejemplo.com');
  });

  it('recorta los campos largos', () => {
    const aviso = construirAviso({ ...BASE, mensaje: 'a'.repeat(5000) });
    expect(aviso['Mensaje']?.length).toBeLessThanOrEqual(2000);
  });

  it('el aviso se puede construir aunque no haya proveedor de correo', () => {
    // El correo es una notificación, no el dato: el lead ya está en Firestore
    // cuando se intenta avisar. Por eso el sistema despliega y funciona sin
    // proveedor configurado, dejando el lead con `avisado: false`.
    expect(() => construirAviso(BASE)).not.toThrow();
  });

  it('no incluye la trampa de robots en el aviso', () => {
    const aviso = construirAviso({ ...BASE, empresaWeb: 'soy-un-robot' });
    expect(JSON.stringify(aviso)).not.toContain('soy-un-robot');
  });
});
