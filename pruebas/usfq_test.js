// deno test --allow-read --allow-write --allow-run --allow-env=USFQ_BROWSER pruebas/usfq_test.js
// Opcional: USFQ_BROWSER puede indicar la ruta al ejecutable de Chrome/Chromium/Edge.
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import assert from "node:assert/strict";

// Se ejecuta en el navegador después del arranque normal de los scripts de index.html.
function probarGuia() {
  const campo = (id) => document.getElementById("usfq_" + id);
  const nombres = () => Array.from(campo("resultados").querySelectorAll(".usfq-exchange-food"), (n) => n.textContent.trim());
  const comprobar = (condicion, mensaje) => {
    if (!condicion) throw Error(mensaje);
  };
  const cambiar = (id, valor) => {
    const elemento = campo(id);
    elemento.value = valor;
    comprobar(!elemento.disabled && elemento.value === valor, "Control inactivo u opción inválida: " + id);
    elemento.dispatchEvent(new Event(id === "busqueda" ? "input" : "change", { bubbles: true }));
  };

  const total = globalThis.IntercambiosUSFQ.alimentos.length;
  const inicial = nombres().length;
  comprobar(inicial > 0 && inicial < total, "No hay una primera página de resultados");
  comprobar(campo("contador").textContent.includes(String(total)), "El contador no indica el tamaño del catálogo");
  comprobar(!campo("mostrar_mas").hidden, "No se puede avanzar de página");
  campo("mostrar_mas").click();
  comprobar(nombres().length > inicial, "Mostrar más no añade alimentos");

  cambiar("busqueda", "arro");
  comprobar(nombres().includes("Arrocillo, crudo") && nombres().includes("Arroz integral, grano largo, cocido"), "«arro» no encuentra arrocillo y arroz");
  comprobar(nombres().every((n) => /arro/i.test(n)), "«arro» devuelve alimentos ajenos");
  comprobar(campo("mostrar_mas").hidden, "El paginador sigue visible sin más coincidencias");
  cambiar("busqueda", "ARROZ  cocido");
  comprobar(nombres().includes("Fideo de arroz, cocido") && nombres().includes("Arroz integral, grano largo, cocido"), "No reconoce palabras separadas, mayúsculas o espacios");
  comprobar(nombres().every((n) => !/crudo/.test(n)), "Confunde «precocido, crudo» con «cocido»");
  cambiar("busqueda", "platano");
  comprobar(nombres().some((n) => /plátano/i.test(n)), "No reconoce búsquedas sin tilde");

  cambiar("grupo", "Frutas");
  cambiar("subgrupo", "fruta_deshidratada");
  cambiar("busqueda", "arro");
  comprobar(!nombres().length && !campo("vacio").hidden && /\b0\b/.test(campo("contador").textContent), "No indica que la búsqueda y los filtros no tienen coincidencias");
  cambiar("busqueda", "");
  const deshidratadas = globalThis.IntercambiosUSFQ.alimentos.filter((a) => a.subgrupoId === "fruta_deshidratada");
  comprobar(nombres().length === deshidratadas.length && deshidratadas.every((a) => nombres().includes(a.nombre)), "El subgrupo no coincide con el catálogo");
  comprobar(campo("vacio").hidden, "No retira el aviso al recuperar resultados");
  cambiar("grupo", "Vegetales");
  comprobar(campo("subgrupo").value === "" && !Array.from(campo("subgrupo").options).some((o) => o.value === "fruta_deshidratada"), "El subgrupo anterior sigue activo en otro grupo");
  cambiar("grupo", "");
  comprobar(nombres().length === inicial && !campo("mostrar_mas").hidden, "Limpiar los filtros no restaura la primera página");
}

function navegador() {
  const elegido = Deno.env.get("USFQ_BROWSER");
  if (elegido) return elegido;
  if (Deno.build.os === "windows") {
    const candidatos = [
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
      "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    ];
    for (const ruta of candidatos) {
      try { if (Deno.statSync(ruta).isFile) return ruta; } catch (e) { if (!(e instanceof Deno.errors.NotFound)) throw e; }
    }
  }
  return Deno.build.os === "darwin" ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" : "chromium";
}

Deno.test("Guía USFQ: arranque independiente del plan, búsqueda, filtros y paginación", async () => {
  const pagina = new URL("../index.html", import.meta.url);
  const html = await Deno.readTextFile(pagina);
  const guia = html.match(/<article\b[^>]*\bid="usfq_catalogo"[^>]*>[\s\S]*?<\/article>/i)?.[0];
  assert.ok(guia, "Falta la guía en la página");
  const scripts = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*><\/script>/gi)]
    .map((m) => m[1]).filter((s) => /^(?:\.\/)?(?:intercambios-usfq|usfq-guia)\.js(?:\?|$)/.test(s))
    .map((s) => '<script src="' + new URL(s, pagina).href + '"></script>').join("\n");
  const temp = await Deno.makeTempDir({ prefix: "prueba-usfq-" });
  try {
    const fixture = join(temp, "guia.html");
    await Deno.writeTextFile(fixture, `<!doctype html><meta charset="utf-8"><body>${guia}${scripts}
      <script>addEventListener("DOMContentLoaded", () => {
        const resultado = document.createElement("output");
        resultado.id = "prueba";
        try { (${probarGuia})(); resultado.textContent = "OK"; }
        catch (e) { resultado.textContent = e.message; }
        document.body.append(resultado);
      });</script>`);
    const { code, stdout, stderr } = await new Deno.Command(navegador(), {
      args: ["--headless", "--disable-gpu", "--disable-extensions", "--disable-background-networking", "--no-first-run",
        "--user-data-dir=" + join(temp, "perfil"), "--dump-dom", pathToFileURL(fixture).href],
      stdout: "piped", stderr: "piped",
    }).output();
    const decoder = new TextDecoder();
    assert.equal(code, 0, decoder.decode(stderr));
    assert.equal(decoder.decode(stdout).match(/<output id="prueba">([^<]*)<\/output>/)?.[1], "OK");
  } finally {
    await Deno.remove(temp, { recursive: true });
  }
});
