// deno test --allow-read pruebas/usfq_ilustraciones_test.js
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { runInNewContext } from "node:vm";

const raiz = new URL("../", import.meta.url);
const leer = (archivo) => Deno.readTextFile(new URL(archivo, raiz));
const scripts = ["intercambios-usfq.js", "usfq-ilustraciones.js", "usfq-porcion-ilustrada.js", "usfq-medida-visual.js", "usfq-guia.js"];

Deno.test("Los scripts del catálogo, las ilustraciones y la guía se cargan en ese orden", async () => {
  const html = await leer("index.html");
  const nombres = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/gi)]
    .map((m) => m[1].split("?")[0].replace(/^\.\//, ""))
    .filter((src) => scripts.includes(src));
  assert.deepEqual(nombres, scripts);
  for (const src of scripts) assert.ok((await Deno.stat(new URL(src, raiz))).isFile);
});

// Ignora metadatos (p. ej., EXIF) para no contar la misma ilustración dos veces.
function huellaImagenWebp(bytes) {
  const texto = (pos, longitud) => String.fromCharCode(...bytes.subarray(pos, pos + longitud));
  const vista = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  assert.equal(texto(0, 4), "RIFF");
  assert.equal(texto(8, 4), "WEBP");
  assert.equal(vista.getUint32(4, true) + 8, bytes.length);
  const hash = createHash("sha256");
  let imagen = false;
  for (let p = 12; p < bytes.length; ) {
    const tipo = texto(p, 4);
    const n = vista.getUint32(p + 4, true);
    const fin = p + 8 + n;
    assert.ok(fin <= bytes.length, "Trama incompleta");
    if (tipo === "VP8 " || tipo === "VP8L" || tipo === "ALPH") {
      hash.update(bytes.subarray(p, fin));
      if (tipo !== "ALPH") imagen = true;
    }
    p = fin + (n % 2);
  }
  assert.ok(imagen, "No contiene una imagen WebP fija");
  return hash.digest("hex");
}

Deno.test("Cada alimento tiene su ilustración WebP local, legible y propia", async () => {
  const window = {};
  for (const archivo of scripts.slice(0, 2)) runInNewContext(await leer(archivo), { window });
  const ids = Array.from(window.IntercambiosUSFQ.alimentos, ({ id }) => id);
  assert.equal(ids.length, 413);
  assert.deepEqual(Object.keys(window.FotosUSFQ).sort(), [...ids].sort());
  const huellas = new Map();
  const errores = [];
  for (const id of ids) {
    try {
      const { src } = window.FotosUSFQ[id];
      assert.equal(src, "media/usfq/" + id + ".webp?v=porcion-2");
      const bytes = await Deno.readFile(new URL(src, raiz));
      const huella = huellaImagenWebp(bytes);
      assert.ok(!huellas.has(huella), "Ilustración idéntica a " + huellas.get(huella));
      huellas.set(huella, id);
      const imagen = await createImageBitmap(new Blob([bytes], { type: "image/webp" }));
      try {
        assert.ok(imagen.width > 1 && imagen.height > 1, "Dimensiones inválidas");
      } finally {
        imagen.close();
      }
    } catch (error) {
      errores.push(id + ": " + error.message);
    }
  }
  assert.equal(errores.length, 0, errores.length + " recursos con errores:\n" + errores.slice(0, 8).join("\n"));
});
