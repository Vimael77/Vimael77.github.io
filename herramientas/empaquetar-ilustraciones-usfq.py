"""Divide una lámina original 4 × 4 en fichas WebP según el orden del catálogo.

python herramientas/empaquetar-ilustraciones-usfq.py --lote 0 --atlas C:/arte/lote-00.png
Requiere Pillow con WebP y Deno. No descarga archivos ni genera ilustraciones.
"""

import argparse
import io
import json
import re
import subprocess
from pathlib import Path

from PIL import Image, ImageOps, features


RAIZ = Path(__file__).resolve().parent.parent
LADO = 4
POR_LOTE = LADO * LADO


def leer_ids():
    # Ejecutar el propio catálogo conserva sus reglas para acentos, duplicados y grupos.
    script = (
        'globalThis.window = globalThis; await import("./intercambios-usfq.js"); '
        'console.log(JSON.stringify(window.IntercambiosUSFQ.alimentos.map(a => a.id)));'
    )
    ejecucion = subprocess.run(
        ["deno", "run", "--no-config", "-"], input=script, cwd=RAIZ,
        capture_output=True, encoding="utf-8", check=True,
    )
    ids = json.loads(ejecucion.stdout)
    if not isinstance(ids, list) or not ids or any(
        not isinstance(identificador, str) or not re.fullmatch(r"[a-z0-9_-]+", identificador)
        for identificador in ids
    ) or len(set(ids)) != len(ids):
        raise ValueError("El catálogo contiene identificadores no válidos o duplicados.")
    return ids


def empaquetar(atlas, lote, reemplazar, salida):
    if not atlas.is_absolute() or not atlas.is_file():
        raise ValueError("--atlas debe indicar la ruta absoluta a una lámina existente.")
    if not features.check("webp"):
        raise ValueError("Esta instalación de Pillow no puede escribir WebP.")
    ids = leer_ids()
    if lote < 0 or lote * POR_LOTE >= len(ids):
        raise ValueError(f"--lote admite enteros entre 0 y {(len(ids) - 1) // POR_LOTE}.")
    ids_lote = ids[lote * POR_LOTE:(lote + 1) * POR_LOTE]
    archivos = [salida / (i + ".webp") for i in ids_lote]
    if not reemplazar and any(a.exists() for a in archivos):
        raise ValueError("Ya hay archivos en este lote. Revísalos antes de usar --reemplazar.")
    with Image.open(atlas) as original:
        lamina = ImageOps.exif_transpose(original).convert("RGBA")
    ancho, alto = lamina.size
    if max(ancho, alto) > min(ancho, alto) * 1.02 or min(ancho, alto) < 512:
        raise ValueError(f"Se necesita una lámina aproximadamente cuadrada (tolerancia del 2 %) de al menos 512 px por lado (recibido: {ancho} × {alto}).")
    cortes_x = [round(i * ancho / LADO) for i in range(LADO + 1)]
    cortes_y = [round(i * alto / LADO) for i in range(LADO + 1)]
    datos = []
    for pos, identificador in enumerate(ids_lote):
        fila, columna = divmod(pos, LADO)
        celda = lamina.crop((cortes_x[columna], cortes_y[fila], cortes_x[columna + 1], cortes_y[fila + 1]))
        # Comprueba que exista contenido visible, incluidas láminas transparentes.
        visible = Image.alpha_composite(Image.new("RGBA", celda.size, "white"), celda)
        if all(maximo - minimo < 5 for minimo, maximo in visible.convert("RGB").getextrema()):
            raise ValueError(f"Celda {pos + 1} vacía ({identificador}); el lote no se guardó.")
        celda.thumbnail((320, 320), Image.Resampling.LANCZOS)
        if celda.getchannel("A").getextrema() == (255, 255):
            celda = celda.convert("RGB")
        flujo = io.BytesIO()
        celda.save(flujo, "WEBP", quality=85, method=6)
        datos.append(flujo.getvalue())
    # Examinar el lote completo antes de escribir; solo los IDs existentes del último lote.
    salida.mkdir(parents=True, exist_ok=True)
    for archivo, contenido in zip(archivos, datos):
        with archivo.open("wb" if reemplazar else "xb") as destino:
            destino.write(contenido)
    print(f"Lote {lote}: {len(archivos)} ilustraciones en {salida}.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--lote", type=int, required=True, help="Índice de lote, comenzando en 0.")
    parser.add_argument("--atlas", type=Path, required=True, help="Ruta absoluta a la lámina 4 × 4.")
    parser.add_argument("--salida", type=Path, required=True, help="Directorio de muestras para la composición de porciones.")
    parser.add_argument("--reemplazar", action="store_true", help="Permitir reemplazar archivos de este lote.")
    args = parser.parse_args()
    try:
        empaquetar(args.atlas, args.lote, args.reemplazar, args.salida)
    except subprocess.CalledProcessError as error:
        parser.exit(1, f"No se pudo leer el catálogo: {error.stderr or error}\n")
    except (OSError, ValueError) as error:
        parser.exit(1, f"{error}\n")
