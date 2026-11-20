# Vimael77.github.io

Este es un programa para nutricionistas.

### Ilustraciones de la guía de intercambios

La vista previa representa **un intercambio**. Cuando la guía ofrece varias medidas equivalentes, se dibuja una sola y la ficha conserva todas. El nivel de los recipientes, las cucharadas y el número de piezas se componen a partir de la medida elegida en `usfq-porcion-ilustrada.js`; los alimentos se ilustran con recursos originales. El tamaño en pantalla no es una escala física ni una medición del peso. Los WebP están en `media/usfq/<id-del-alimento>.webp` y no se consulta ningún servicio externo al abrirlos.

Para revisar la cobertura y la interacción en Chrome:

```
deno test --allow-read --allow-write --allow-run --allow-env=USFQ_BROWSER pruebas/
```

Para preparar nuevas ilustraciones:

1. Genera las láminas de 4 × 4 a partir de las indicaciones de `herramientas/ilustraciones-prompts.json`: texturas para recipientes y cucharas, una pieza para los recuentos y un corte ya porcionado para las fracciones aisladas. El orden del catálogo solo se usa para preparar las láminas.
2. Divide cada lámina en una carpeta de trabajo **distinta del destino público**: `python herramientas/empaquetar-ilustraciones-usfq.py --lote 0 --atlas "RUTA_ABSOLUTA_A_LA_LAMINA" --salida muestras`.
3. Exporta las medidas del catálogo: `deno run --allow-read --allow-write herramientas/receta-porciones.js --salida reglas.json`.
4. Compón los WebP con las medidas, revisa el resultado y ejecuta las pruebas: `deno run --allow-read --allow-write --allow-run --allow-env=USFQ_BROWSER herramientas/componer-porciones.js reglas.json muestras media/usfq`.
