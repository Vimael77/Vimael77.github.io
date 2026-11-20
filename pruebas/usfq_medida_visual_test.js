// deno test --allow-read pruebas/usfq_medida_visual_test.js
import assert from "node:assert/strict";
import { runInNewContext } from "node:vm";

const raiz = new URL("../", import.meta.url);
async function cargar(archivos, window = {}) {
  for (const archivo of archivos) {
    runInNewContext(await Deno.readTextFile(new URL(archivo, raiz)), { window });
  }
  return window;
}

Deno.test("La referencia gráfica usa la misma alternativa elegida para cada uno de los 413 alimentos", async () => {
  const app = await cargar(["intercambios-usfq.js", "usfq-porcion-ilustrada.js", "usfq-medida-visual.js"]);
  for (const alimento of app.IntercambiosUSFQ.alimentos) {
    const figura = app.MedidaVisualUSFQ.render(alimento);
    assert.ok(figura.includes("<svg"), alimento.id);
    assert.ok(figura.includes(app.PorcionIlustradaUSFQ.de(alimento)), alimento.id);
  }
  const buscar = (nombre) => app.IntercambiosUSFQ.alimentos.find(a => a.nombre === nombre);
  const figura = nombre => app.MedidaVisualUSFQ.render(buscar(nombre));
  // Una taza recta de altura 16: 12 unidades de relleno vs. 4.
  assert.match(figura("Arroz blanco, grano largo, cocido"), /<svg y="9" width="26" height="12"/);
  assert.match(figura("Arroz blanco, grano largo, crudo"), /<svg y="17" width="26" height="4"/);
  assert.match(figura("Canguil con sal"), /Cocido: 4 tazas/);
});

Deno.test("No suma alternativas ni inventa cantidades; admite medidas mixtas y limita el número de símbolos", async () => {
  const app = await cargar(["usfq-medida-visual.js"], { PorcionIlustradaUSFQ: { de: a => a.medida } });
  const dibujar = medida => app.MedidaVisualUSFQ.render({ medida });
  assert.equal(dibujar("al gusto"), "");
  assert.equal(dibujar("¼ taza; 2 unidades"), "");
  assert.equal(dibujar("0 tazas"), "");
  assert.equal(dibujar("2 trozos o 1 filete"), "");
  assert.equal(dibujar("20–22 unidades"), "");
  assert.equal((dibujar("1½ tazas").match(/<g transform="translate\(\d+ 0\)">/g) || []).length, 2);
  assert.match(dibujar("1½ tazas"), /height="8"/);
  assert.match(dibujar("½ unidad mediana"), /A8.5 8.5/);
  assert.match(dibujar("30 unidades"), /×<\/span><span>30 unidades/);
  assert.doesNotMatch(dibujar("1 unidad <script>"), /<script>/);
  assert.equal(app.MedidaVisualUSFQ.render(null), "");
});
