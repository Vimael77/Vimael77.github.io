// deno run --allow-read herramientas/receta-porciones.js
// La bitácora de generación usa los mismos alimentos y la misma opción que la vista previa.
globalThis.window = globalThis;
await import("../intercambios-usfq.js");
await import("../usfq-porcion-ilustrada.js");
const fracciones = {"⅛":1/8,"¼":1/4,"⅜":3/8,"⅓":1/3,"½":1/2,"⅝":5/8,"⅔":2/3,"¾":3/4,"⅞":7/8};
const datos = IntercambiosUSFQ.alimentos.map(a => {
  const medida = PorcionIlustradaUSFQ.de(a);
  const texto = medida.replace(/^[^:()]+:\s*/, "").trim();
  const cantidadStr = texto.match(/^(\d+)?([⅛¼⅜⅓½⅝⅔¾⅞])?/);
  const cantidad = Number(cantidadStr[1] || 0) + (fracciones[cantidadStr[2]] || 0);
  if (!cantidad) throw new Error("Cantidad no reconocida: " + a.id + ": " + medida);
  const unidad = texto.slice(cantidadStr[0].length).trim().match(/^(tazas?|vasos?|bowls?|cdtas?\.|cdas?\.)/i)?.[1];
  const tipo = unidad ? unidad.replace(/s?\.?$/, "") : cantidad > 1 ? "piezas" : "directa";
  return { id:a.id, nombre:a.nombre, medida, gramos:a.gramos, tipo, cantidad };
});
const json = JSON.stringify(datos);
if (Deno.args.length === 2 && Deno.args[0] === "--salida") {
  await Deno.writeTextFile(Deno.args[1], json, {createNew: true});
} else if (!Deno.args.length) {
  console.log(json);
} else {
  throw new Error("Uso: receta-porciones.js [--salida ARCHIVO_NUEVO.json]");
}
