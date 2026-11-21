// deno test --allow-read --allow-write --allow-run --allow-env=USFQ_BROWSER pruebas/equivalentes_matrices_test.js
import assert from "node:assert/strict";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

// Transcripción independiente de Tabla 1 (archivo PDF p. 14; impresa p. 15).
// Columnas de la publicación, en su orden original: CHO, proteínas, grasa, kcal.
// La energía publicada está redondeada de forma independiente de los gramos.
const referencia = {
  cereal_alto_cho_baja_grasa: [30, 4, 1, 150], cereal_medio_cho_media_grasa: [20, 2, 6, 145],
  cereal_medio_cho_baja_grasa: [20, 3, 1, 105], fruta_media_cho: [20, 1, 0, 90],
  fruta_baja_cho: [10, 1, 0, 50], fruta_deshidratada: [20, 1, 0, 95],
  vegetal_bajo_cho: [5, 1, 0, 30], vegetal_libre: [3, 2, 0, 25],
  lacteo_entero: [11, 8, 8, 150], lacteo_semidescremado: [11, 8, 4, 110],
  lacteo_descremado: [12, 8, 1, 90], lacteo_descremado_alto_cho: [25, 6, 3, 150],
  queso: [1, 7, 7, 95], carne_alta_grasa: [1, 11, 15, 180],
  carne_media_grasa: [0, 11, 7, 110], carne_baja_grasa: [0, 11, 2, 65],
  embutido: [1, 7, 7, 100], leguminosa: [20, 9, 1, 120], grasa_alta: [1, 1, 12, 120],
  grasa_media: [2, 1, 7, 75], grasa_alta_bajo_cho: [8, 4, 10, 140],
  grasa_media_bajo_cho: [12, 2, 7, 125], azucar: [10, 0, 0, 40],
};

// Ejecutada después de la inicialización normal del plan en Chromium.
function probar(tabla, fase) {
  const porId = id => document.getElementById(id);
  const igual = (v, esperado, mensaje) => {
    if (JSON.stringify(v) !== JSON.stringify(esperado)) throw Error(mensaje + ": " + JSON.stringify(v));
  };
  const leer = celda => parseFloat(celda.textContent.trim().replace(",", "."));
  const fila = id => document.querySelector('[data-equivalent-row="' + id + '"]');
  const input = id => document.querySelector('[data-equivalent-input="' + id + '"]');
  const aportes = id => ["carbohidrato", "proteina", "grasa", "energia"]
    .map(key => leer(fila(id).querySelector('[data-aporte="' + key + '"]')));
  const cambiar = (id, n) => {
    input(id).value = n;
    input(id).dispatchEvent(new Event("input", { bubbles: true }));
  };
  const selector = porId("equiv_matriz");
  const seleccionar = valor => {
    selector.value = valor;
    selector.dispatchEvent(new Event("change", { bubbles: true }));
  };
  const cereal = "cereal_alto_cho_baja_grasa", fruta = "fruta_deshidratada", lacteo = "lacteo_descremado";
  if (fase === "recarga") {
    igual(selector.value, "usfq", "No restaura la última fuente");
    igual(Number(input(cereal).value), 2, "Perdió las raciones USFQ al recargar");
    seleccionar("clasica");
    igual(Number(input(lacteo).value), 7, "Perdió las raciones clásicas al recargar");
    return;
  }
  if (fase === "nueva") {
    igual(selector.value, "usfq", "Un plan nuevo no abre en Tabla 1");
    igual(Object.keys(tabla).length, document.querySelectorAll("[data-equivalent-row]").length, "Número de filas");
    for (const [id, valores] of Object.entries(tabla)) {
      igual(Number(input(id).value), 0, "Cantidad inicial de " + id);
      cambiar(id, 1);
      igual(aportes(id), valores, "Un intercambio no coincide con Tabla 1 para " + id);
      cambiar(id, 0);
    }
    return;
  }
  igual(selector.value, "clasica", "Cambió la fuente de un plan v1");
  igual(Number(input(lacteo).value), 7, "Plan anterior no recuperado");
  igual(aportes(lacteo), [84, 56, 14, 686], "Reinterpretó leche descremada clásica con valores USFQ");
  seleccionar("usfq");
  igual(Number(input(lacteo).value), 0, "El ID de lácteos colisiona entre fuentes");
  cambiar(cereal, 2); cambiar(fruta, 0.5);
  const pie = [...porId("equiv_grupos_foot").querySelectorAll("td")].map(leer);
  igual(pie, [2.5, 8.5, 2, 70, 347.5], "Totales del plan: no aplicar 4/9/4 a Tabla 1");
  if (!porId("equiv_adecuacion_resumen").textContent.replace(",", ".").includes("347.5"))
    throw Error("La adecuación no usa las kcal de la fuente");
  porId("equiv_distribuir").click();
  const porComida = [...document.querySelectorAll('[data-meal-total="energia"]')].map(leer);
  igual(porComida.reduce((s, n) => s + n, 0), 347.5, "Las kcal se pierden en la distribución");
  // Capturar los datos entregados a SheetJS, sin CDN ni descarga.
  let libro;
  window.XLSX = { utils: { book_new: () => ({}), aoa_to_sheet: filas => ({ filas }),
    book_append_sheet: (libro, hoja, nombre) => { libro[nombre] = hoja; } },
    writeFile: l => { libro = l; } };
  porId("equiv_exportar").click();
  igual(libro.Equivalentes.filas.find(r => r[0] === "TOTAL").at(-1), 347.5, "Energía exportada");
  const energia = libro["Distribución"].filas.find(r => r[0] === "Energía" && r[1] === "kcal");
  igual(energia.slice(2).reduce((s, n) => s + n, 0), 347.5, "Energía por comida exportada");
  seleccionar("clasica");
  igual(Number(input(lacteo).value), 7, "Cambiar de fuente borró el plan clásico");
  seleccionar("usfq");
  igual(Number(input(fruta).value), 0.5, "Cambiar de fuente borró el plan USFQ");
}

function navegador() {
  const elegido = Deno.env.get("USFQ_BROWSER");
  if (elegido) return elegido;
  if (Deno.build.os === "windows") {
    for (const p of ["C:/Program Files/Google/Chrome/Application/chrome.exe",
      "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"]) {
      try { if (Deno.statSync(p).isFile) return p; } catch (e) { if (!(e instanceof Deno.errors.NotFound)) throw e; }
    }
  }
  return Deno.build.os === "darwin" ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" : "chromium";
}

// Comprobar la acción desde los controles reales. Para no validar un cálculo
// contra sí mismo, sumar las raciones con la transcripción independiente.
function probarSugerencia(tabla) {
  const campo = id => document.getElementById("equiv_" + id);
  const boton = campo("sugerir"), mensaje = campo("mensaje");
  const comprobar = (condicion, texto) => { if (!condicion) throw Error(texto); };
  const valores = selector => [...document.querySelectorAll(selector)].map(el => el.valueAsNumber);
  const plan = () => ({
    raciones: valores("[data-equivalent-input]"),
    comidas: valores("[data-allocation-group]"),
  });
  const editar = (id, valor, evento = "input") => {
    campo(id).value = valor;
    campo(id).dispatchEvent(new Event(evento, { bubbles: true }));
  };
  const sugerir = (kcal, proteina, grasa) => {
    comprobar(!boton.disabled, "El botón de sugerencia USFQ está deshabilitado");
    boton.click();
    comprobar(campo("mensaje_en_tabla").contains(mensaje) && mensaje.textContent.trim() &&
      mensaje.classList.contains("equivalentes-message--success"),
      "La sugerencia no se aplicó: " + mensaje.textContent);
    const totales = [0, 0, 0, 0];
    for (const [id, aporte] of Object.entries(tabla)) {
      const n = document.querySelector('[data-equivalent-input="' + id + '"]').valueAsNumber;
      comprobar(n >= 0 && Number.isInteger(n * 4), "Cantidad sugerida inválida: " + id + "=" + n);
      const comidas = valores('[data-allocation-group="' + id + '"]');
      comprobar(comidas.length === Number(campo("num_comidas").value) && comidas.reduce((a,b) => a+b, 0) === n,
        "La distribución no conserva las raciones sugeridas de " + id);
      aporte.forEach((x, i) => totales[i] += n * x);
    }
    const objetivos = [kcal * (100 - proteina - grasa) / 400, kcal * proteina / 400, kcal * grasa / 900, kcal];
    objetivos.forEach((objetivo, i) => comprobar(Math.abs(totales[i] - objetivo) <= objetivo * 0.1,
      "Fuera de adecuación para " + kcal + " kcal: " + totales + "; objetivo: " + objetivos));
    return JSON.stringify(plan());
  };
  const inicial = sugerir(1900, 21, 28);
  editar("energia", 2300);
  editar("proteina_pct", 25);
  editar("grasa_pct", 30);
  editar("num_comidas", 5, "change");
  const segundo = sugerir(2300, 25, 30);
  comprobar(segundo !== inicial, "No respondió al cambio de objetivos");
  editar("grasa_pct", 95);
  boton.click();
  comprobar(mensaje.classList.contains("equivalentes-message--error") && JSON.stringify(plan()) === segundo,
    "Un objetivo inválido no da aviso o modifica la sugerencia vigente");
  // No hay intercambios USFQ de grasa pura ni de proteína pura. Tampoco
  // debe confundirse un porcentaje sin completar con un cero explícito.
  for (const [p,g] of [[0,100],[100,0],["",30],[25,""]]) {
    editar("proteina_pct", p);
    editar("grasa_pct", g);
    boton.click();
    comprobar(JSON.stringify(plan()) === segundo && mensaje.textContent.trim() &&
      mensaje.classList.contains("equivalentes-message--error"),
      "Se marcó como válido o se perdió el plan con P/G=" + p + "/" + g);
  }
  editar("proteina_pct", 25);
  editar("grasa_pct", 30);
  editar("matriz", "clasica", "change");
  const cereal = document.querySelector('[data-equivalent-input="cereal_sin_grasa"]');
  comprobar(!boton.disabled && cereal, "No se puede sugerir con la matriz clásica");
  cereal.value = 0;
  cereal.dispatchEvent(new Event("input", { bubbles:true }));
  boton.click();
  comprobar(document.querySelector('[data-equivalent-input="cereal_sin_grasa"]').valueAsNumber > 0 &&
    document.querySelector('[data-equivalent-input="queso_semidescremado"]').valueAsNumber === 1,
    "Se alteró la propuesta de la matriz clásica");
  editar("matriz", "usfq", "change");
  comprobar(JSON.stringify(plan()) === segundo, "La sugerencia clásica sobrescribió el plan USFQ");
}

Deno.test("Tabla 1 USFQ: aportes, sugerencia por objetivos, distribución, exportación y preservación de planes", async () => {
  const pagina = new URL("../index.html", import.meta.url);
  const html = await Deno.readTextFile(pagina);
  const panel = html.match(/<div\b[^>]*\bid="equivalentes"[^>]*>[\s\S]*?<\/section>/)?.[0];
  assert.ok(panel, "No se encontró el panel de equivalentes");
  const scripts = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map(m => m[1])
    .filter(s => /^(intercambios-usfq|equivalentes)\.js(\?|$)/.test(s))
    .map(s => '<script src="' + new URL(s, pagina).href + '"></script>').join("\n");
  const temp = await Deno.makeTempDir({ prefix: "equiv-matrices-" });
  try {
    const archivo = join(temp, "plan.html");
    await Deno.writeTextFile(archivo, `<!doctype html><meta charset="utf-8"><body>${panel}</div><output id="prueba"></output>
      <script>const fase = location.hash.slice(1);
        if(fase === "legacy") {
          localStorage.clear();
          localStorage.setItem("muyAlimentado:sistemaEquivalentes:v1", JSON.stringify({
            objetivos:{energia:1900,pesoIdeal:64,proteinaPct:21,grasaPct:28},
            equivalentes:{lacteo_descremado:7}, comidas:[{},{},{},{}], distribucion:{}
          }));
        }</script>${scripts}
      <script>addEventListener("DOMContentLoaded", () => {
        try {
          (${probar})(${JSON.stringify(referencia)}, fase);
          if (fase === "nueva") (${probarSugerencia})(${JSON.stringify(referencia)});
          document.querySelector("output").textContent = "OK";
        }
        catch(e) { document.querySelector("output").textContent = e.message; }
      });</script>`);
    for (const fase of ["nueva", "legacy", "recarga"]) {
      const { stdout, stderr, code } = await new Deno.Command(navegador(), {
        args: ["--headless", "--disable-gpu", "--disable-extensions", "--disable-background-networking", "--no-first-run",
          "--user-data-dir=" + join(temp, "perfil"), "--virtual-time-budget=1200", "--dump-dom",
          pathToFileURL(archivo).href + "#" + fase], stdout: "piped", stderr: "piped",
      }).output();
      const dec = new TextDecoder();
      assert.equal(code, 0, dec.decode(stderr));
      assert.equal(dec.decode(stdout).match(/<output id="prueba">([^<]*)<\/output>/)?.[1], "OK", fase);
    }
  } finally {
    await Deno.remove(temp, { recursive: true });
  }
});
