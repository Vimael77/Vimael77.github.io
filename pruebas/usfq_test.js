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
  const nombreArroz = "Arroz blanco, grano largo, cocido";
  const ficha = Array.from(campo("resultados").querySelectorAll(".usfq-exchange-card"))
    .find((tarjeta) => tarjeta.querySelector(".usfq-exchange-food")?.textContent.trim() === nombreArroz);
  comprobar(ficha, "Falta la ficha de referencia del arroz blanco cocido");
  const acciones = "a[href], button, input, select, [tabindex], [role=button], [role=link]";
  comprobar(!ficha.matches(acciones) && !ficha.querySelector(acciones), "La ficha informativa se presenta como una acción");
  const porcion = ficha.querySelector(".usfq-exchange-portion")?.textContent.replace(/\s+/g, " ").trim();
  comprobar(/1 intercambio\s*=\s*¾ (?:de )?taza\s*\(110 g\)/i.test(porcion), "La porción no reúne el intercambio, la medida y el peso del arroz");
  const referencia = ficha.querySelector(".usfq-exchange-meta")?.textContent || "";
  comprobar(referencia.includes("Altos en carbohidratos y bajos en grasas") && referencia.includes("20–26"), "Falta el subgrupo o las páginas de la ficha de arroz");
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

// Una imagen de prueba embebida permite comprobar la interacción sin red.
function probarVistaFotos() {
  const porId = (id) => document.getElementById("usfq_" + id);
  const comprobar = (valor, mensaje) => { if (!valor) throw Error(mensaje); };
  const fotos = ".usfq-photo-trigger";
  const resultados = porId("resultados"), vista = porId("foto");
  const imagen = vista.querySelector("img");
  const alimento = window.IntercambiosUSFQ.alimentos[0];
  comprobar(!resultados.querySelector(fotos), "Se pueden pedir fotos sin una referencia");
  const src = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>');
  window.FotosUSFQ = { [alimento.id]: { src } };
  porId("busqueda").dispatchEvent(new Event("input", { bubbles: true }));
  const botones = resultados.querySelectorAll(fotos);
  comprobar(botones.length === 1 && !resultados.querySelector("img") && !imagen.hasAttribute("src") && vista.hidden,
    "El catálogo cargó imágenes de antemano o sin referencia");
  const boton = botones[0], tarjeta = boton.closest("article");
  const puntero = (el, evento, tipo, relacionado = null) => el.dispatchEvent(
    new PointerEvent(evento, { bubbles: true, pointerType: tipo, relatedTarget: relacionado }));
  puntero(tarjeta, "pointerover", "mouse");
  comprobar(!vista.hidden && boton.getAttribute("aria-expanded") === "true", "Hover no abre la vista");
  comprobar(imagen.getAttribute("src") === src && imagen.alt.includes(alimento.nombre) && vista.textContent.includes("orientativa"),
    "Falta la ilustración correcta, su nombre o su contexto");
  puntero(tarjeta, "pointerout", "mouse", vista);
  comprobar(!vista.hidden, "No se puede mover el mouse a la propia foto");
  puntero(vista, "pointerleave", "mouse", document.body);
  comprobar(vista.hidden && !imagen.hasAttribute("src"), "La foto sigue al quitar el mouse");
  boton.focus({ preventScroll: true });
  comprobar(!vista.hidden, "No se puede consultar con teclado");
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  comprobar(vista.hidden && boton.getAttribute("aria-expanded") === "false", "Escape no cierra la foto");
  puntero(boton, "pointerover", "touch");
  comprobar(vista.hidden, "El desplazamiento táctil abre una foto");
  puntero(boton, "pointerdown", "touch");
  boton.click();
  comprobar(!vista.hidden, "Un toque no abre la foto");
  puntero(document.body, "pointerdown", "touch");
  comprobar(vista.hidden, "Un toque fuera no cierra la foto");
  boton.click();
  porId("busqueda").value = "arroz";
  porId("busqueda").dispatchEvent(new Event("input", { bubbles: true }));
  comprobar(vista.hidden && !resultados.querySelector(fotos), "Cambiar la búsqueda conserva una foto ajena");
}

function probarPorciones() {
  const guia = window.IntercambiosUSFQ, campo = document.getElementById("usfq_busqueda");
  const vista = document.getElementById("usfq_foto");
  const src = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>');
  function abrir(nombre) {
    const alimento = guia.alimentos.find(a => a.nombre === nombre);
    window.FotosUSFQ = { [alimento.id]: { src } };
    campo.value = alimento.nombre;
    campo.dispatchEvent(new Event("input", { bubbles: true }));
    const boton = document.querySelector("[data-usfq-foto]");
    boton.click();
    const texto = vista.querySelector(".usfq-photo-serving").textContent;
    const medida = window.PorcionIlustradaUSFQ.de(alimento);
    if (vista.hidden || !texto.includes("1 intercambio") || !texto.includes(medida) ||
      !vista.querySelector("img").alt.includes(medida)) throw Error("La vista no describe la porción seleccionada de " + nombre);
    return { texto, dibujo: vista.querySelector(".usfq-photo-diagram").innerHTML };
  }
  const cocido = abrir("Arroz blanco, grano largo, cocido");
  const crudo = abrir("Arroz blanco, grano largo, crudo");
  if (!/¾ (?:de )?taza/.test(cocido.texto) || !cocido.texto.includes("110 g") ||
      !/¼ (?:de )?taza/.test(crudo.texto) || !crudo.texto.includes("45 g") ||
      !cocido.dibujo.includes("<svg") || !crudo.dibujo.includes("<svg") || cocido.dibujo === crudo.dibujo)
    throw Error("El dibujo de la taza o el peso no distingue el arroz cocido del crudo");
  const sinPeso = abrir("Cerdo, pata, cruda o cocida");
  if (!sinPeso.texto.includes("2 trozos") || !sinPeso.texto.includes("2.9 cm") ||
      !sinPeso.texto.includes("peso no indicado") || /\b(?:0|null) g\b/.test(sinPeso.texto))
    throw Error("Se perdió la medida descrita o se inventó un peso");
}

// En un marco estrecho se comprueban las dimensiones reales, no sólo los atributos del DOM.
async function probarImagenMovil(src) {
  const id = "cereal_alto_cho_baja_grasa-arroz-blanco-grano-largo-cocido";
  const campo = document.getElementById("usfq_busqueda");
  const vista = document.getElementById("usfq_foto");
  const imagen = vista.querySelector("img");
  const comprobar = (ok, mensaje) => { if (!ok) throw Error(mensaje); };
  window.FotosUSFQ = { [id]: { src } };
  campo.value = "arroz blanco grano largo cocido";
  campo.dispatchEvent(new Event("input", { bubbles: true }));
  const boton = document.querySelector("[data-usfq-foto]");
  boton.scrollIntoView({ block: "center" });
  boton.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
  boton.focus();
  await imagen.decode();
  comprobar(imagen.naturalWidth > 10 && imagen.naturalHeight > 10 && !vista.hidden, "No se cargó el WebP real al enfocar con teclado");
  const caja = vista.getBoundingClientRect(), raiz = document.documentElement;
  comprobar(raiz.clientWidth <= 390 && getComputedStyle(vista).position === "fixed", "No se probó el estilo móvil");
  comprobar(caja.left >= 0 && caja.right <= raiz.clientWidth + 1 && caja.top >= 0 && caja.bottom <= raiz.clientHeight + 1,
    "La vista de imagen sale de la pantalla móvil");
  // Al tocar la ilustración el navegador puede quitar el foco al botón antes de iniciar el scroll.
  vista.style.maxHeight = "94px";
  imagen.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerType: "touch" }));
  boton.blur();
  vista.scrollTop = 30;
  vista.dispatchEvent(new Event("scroll"));
  comprobar(!vista.hidden && vista.scrollTop > 0, "No permite leer el detalle desplazando la vista de poca altura");
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  boton.focus({ preventScroll: true });
  campo.focus({ preventScroll: true });
  comprobar(vista.hidden, "La vista del teclado sigue abierta al mover el foco");
  // Una imagen dañada debe dejar la guía utilizable, sin encoger o inmovilizar el panel.
  window.FotosUSFQ[id].src = "data:image/webp;base64,AA==";
  const alFallar = new Promise(resolve => imagen.addEventListener("error", resolve, { once: true }));
  boton.click();
  await alFallar;
  comprobar(!vista.hidden && !vista.querySelector("p").hidden && imagen.hidden, "Falta la alternativa de carga fallida");
  boton.click();
  comprobar(vista.hidden, "Una imagen dañada dejó la vista abierta");
}

Deno.test("Guía USFQ: búsqueda, filtros, paginación y fotografías bajo demanda", async () => {
  const pagina = new URL("../index.html", import.meta.url);
  const html = await Deno.readTextFile(pagina);
  const guia = html.match(/<article\b[^>]*\bid="usfq_catalogo"[^>]*>[\s\S]*?<\/article>/i)?.[0];
  assert.ok(guia, "Falta la guía en la página");
  assert.doesNotMatch(guia, /class="equivalentes-step-number"/, "La consulta no debe parecer un paso obligatorio");
  assert.deepEqual([...html.matchAll(/<span\b[^>]*class="equivalentes-step-number"[^>]*>\s*(\d+)\s*<\/span>/g)]
    .map((m) => m[1]), ["1", "2", "3"], "Los tres pasos del plan deben estar numerados en orden");
  const scripts = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*><\/script>/gi)]
    .map((m) => m[1]).filter((s) => /^(?:\.\/)?(?:intercambios-usfq|usfq-porcion-ilustrada|usfq-medida-visual|usfq-guia)\.js(?:\?|$)/.test(s))
    .map((s) => '<script src="' + new URL(s, pagina).href + '"></script>').join("\n");
  const temp = await Deno.makeTempDir({ prefix: "prueba-usfq-" });
  try {
    const fixture = join(temp, "guia.html");
    const movil = join(temp, "movil.html");
    const ejemplo = new URL("media/usfq/cereal_alto_cho_baja_grasa-arroz-blanco-grano-largo-cocido.webp?v=porcion-2", pagina);
    assert.ok((await Deno.stat(ejemplo)).isFile, "Falta el WebP de ejemplo");
    await Deno.writeTextFile(fixture, `<!doctype html><meta charset="utf-8">
      <link rel="stylesheet" href="${new URL("usfq.css", pagina).href}"><body>${guia}${scripts}
      <script>addEventListener("DOMContentLoaded", async () => {
        try {
          (${probarGuia})(); (${probarVistaFotos})(); (${probarPorciones})(); await (${probarImagenMovil})(${JSON.stringify(ejemplo.href)});
          parent.postMessage("OK", "*");
        } catch (e) { parent.postMessage(String(e.message), "*"); }
      });</script>`);
    await Deno.writeTextFile(movil, `<!doctype html><meta charset="utf-8"><output id="prueba"></output>
      <script>addEventListener("message", e => { if (e.source === frames[0]) document.querySelector("output").textContent = e.data; });</script>
      <iframe width="375" height="650" src="${pathToFileURL(fixture).href}"></iframe>`);
    const { code, stdout, stderr } = await new Deno.Command(navegador(), {
      args: ["--headless", "--disable-gpu", "--disable-extensions", "--disable-background-networking", "--no-first-run",
        "--user-data-dir=" + join(temp, "perfil"), "--virtual-time-budget=3000", "--dump-dom", pathToFileURL(movil).href],
      stdout: "piped", stderr: "piped",
    }).output();
    const decoder = new TextDecoder();
    assert.equal(code, 0, decoder.decode(stderr));
    assert.equal(decoder.decode(stdout).match(/<output id="prueba">([^<]*)<\/output>/)?.[1], "OK");
  } finally {
    await Deno.remove(temp, { recursive: true });
  }
});
