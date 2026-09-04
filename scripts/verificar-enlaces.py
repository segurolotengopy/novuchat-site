#!/usr/bin/env python3
"""
=============================================================================
ENLACES ROTOS EN EL SITIO PUBLICADO
=============================================================================
Recorre las URL del sitemap, extrae todos los `<a href>` y comprueba que
respondan. Se ejecuta contra PRODUCCIÓN, no contra un build local, porque los
enlaces que se rompen son casi siempre los que apuntan fuera del repositorio y
esos no existen en `dist/`.

Lo destapó en su primera ejecución (2026-09-04): el botón «Ingresar» de la
cabecera y el «Sign in» de /consola llevaban a `novuchat-admin-prod.web.app`,
que devuelve 404 porque la consola todavía no está desplegada. Dieciocho
páginas, diecisiete enlaces internos y cuatro externos, y el único roto era
justo el de la llamada a la acción para clientes existentes.

Los códigos 403 y 405 se aceptan en enlaces externos: hay sitios que rechazan
las peticiones sin navegador, y tratarlos como rotos llenaría el informe de
falsos positivos hasta que nadie lo mirara.

Uso:  pnpm enlaces
Sale con 1 si algo no responde.
"""

import re
import sys
import urllib.error
import urllib.request
from html.parser import HTMLParser

BASE = "https://novuchat.site"
TIEMPO_LIMITE = 20

# 403 y 405 no son enlaces rotos: hay sitios que rechazan las peticiones sin
# navegador. Tratarlos como fallo llenaría el informe de falsos positivos hasta
# que nadie lo mirara, que es como muere un control.
ACEPTADOS_EXTERNOS = (200, 301, 302, 403, 405)


def pedir(url: str) -> tuple[int, str]:
    """Devuelve (código, html). Código 0 si ni siquiera se pudo conectar."""
    peticion = urllib.request.Request(
        url, headers={"User-Agent": "verificacion-novuchat"}
    )
    try:
        with urllib.request.urlopen(peticion, timeout=TIEMPO_LIMITE) as respuesta:
            return respuesta.status, respuesta.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as error:
        return error.code, ""
    except Exception as error:  # DNS, TLS, tiempo agotado
        return 0, str(error)


class Enlaces(HTMLParser):
    """Recoge los href de los <a> de una página."""

    def __init__(self) -> None:
        super().__init__()
        self.hrefs: set[str] = set()

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag != "a":
            return
        for clave, valor in attrs:
            if clave == "href" and valor:
                self.hrefs.add(valor)


def main() -> int:
    codigo, xml = pedir(f"{BASE}/sitemap-0.xml")
    rutas = (
        sorted(set(re.findall(r"<loc>([^<]+)</loc>", xml)))
        if codigo == 200
        else [f"{BASE}/"]
    )
    print(f"sitemap: {codigo} · {len(rutas)} URL")

    internos: set[str] = set()
    externos: set[str] = set()
    rotos: list[tuple[int, str, str]] = []

    for url in rutas:
        estado, html = pedir(url)
        if estado != 200:
            rotos.append((estado, "página del sitemap", url))
            continue
        analizador = Enlaces()
        analizador.feed(html)
        for href in analizador.hrefs:
            if href.startswith("/"):
                internos.add(BASE + href)
            elif href.startswith("http") and not href.startswith(BASE):
                externos.add(href)

    print(f"enlaces internos únicos: {len(internos)} · externos: {len(externos)}")

    for url in sorted(internos):
        estado, _ = pedir(url)
        if estado != 200:
            rotos.append((estado, "enlace interno", url))

    for url in sorted(externos):
        estado, _ = pedir(url)
        if estado not in ACEPTADOS_EXTERNOS:
            rotos.append((estado, "enlace externo", url))

    if not rotos:
        print("\nNingún enlace roto.")
        return 0

    print(f"\nROTOS ({len(rotos)}):")
    for estado, tipo, url in rotos:
        print(f"  [{estado}] {tipo}: {url}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
