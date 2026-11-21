# Vimael77.github.io

Este es un programa para nutricionistas.

### Equivalentes por grupo

En el paso 2, el selector **Tabla de referencia del plan** permite trabajar con la Tabla 1 de la USFQ (página 14 del PDF; 15 impresa) o con la matriz original. Los planes nuevos comienzan en la USFQ con las raciones en cero; los guardados con la matriz original se abren como estaban. Las cantidades y su distribución se guardan por separado.

En la USFQ cada fila muestra los aportes de un intercambio incluso antes de introducir raciones. La energía del plan, de cada comida y de la exportación usa las kcal publicadas, no una conversión de los gramos de los macronutrientes.

**Sugerir equivalentes** calcula una propuesta del programa, no una recomendación del libro. En modo USFQ parte de una mezcla de cereales, frutas, vegetales, lácteos, leguminosas, carnes y grasas, ajusta los intercambios en cuartos y compara cuatro objetivos: kcal de la tabla y gramos de proteínas, grasas y carbohidratos. Si los cuatro quedan dentro del margen de adecuación del plan (±10 %), reemplaza las raciones y las reparte entre las comidas configuradas. Si no encuentra ese ajuste, conserva el plan. Los 23 subgrupos siguen disponibles para edición manual.

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
