(function () {
  "use strict";
  const formato = new Intl.NumberFormat("es-EC", { maximumFractionDigits: 2 });
  const formatear = valor => formato.format(valor);
  const USFQ_TAMANO_PAGINA = 36;
  let cerrarFoto = function () {};

  const estadoGuiaUSFQ = {
    texto: "",
    grupo: "",
    subgrupoId: "",
    limite: USFQ_TAMANO_PAGINA
  };

  function escaparHtml(valor) {
    return String(valor === undefined || valor === null ? "" : valor)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalizarBusqueda(valor) {
    return String(valor === undefined || valor === null ? "" : valor)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("es")
      .trim();
  }

  function obtenerDatosUSFQ() {
    const datos = window.IntercambiosUSFQ;
    if (!datos || !Array.isArray(datos.subgrupos) || !Array.isArray(datos.alimentos)) return null;
    return datos;
  }

  function gruposUSFQ(datos) {
    return Array.from(new Set(datos.subgrupos.map(function (subgrupo) { return subgrupo.grupo; })));
  }

  function mapaSubgruposUSFQ(datos) {
    return datos.subgrupos.reduce(function (mapa, subgrupo) {
      mapa[subgrupo.id] = subgrupo;
      return mapa;
    }, Object.create(null));
  }

  function renderizarOpcionesSubgruposUSFQ(datos) {
    const selector = document.getElementById("usfq_subgrupo");
    const disponibles = datos.subgrupos.filter(function (subgrupo) {
      return !estadoGuiaUSFQ.grupo || subgrupo.grupo === estadoGuiaUSFQ.grupo;
    });
    if (!disponibles.some(function (subgrupo) { return subgrupo.id === estadoGuiaUSFQ.subgrupoId; })) {
      estadoGuiaUSFQ.subgrupoId = "";
    }
    selector.innerHTML = '<option value="">Todos los subgrupos</option>' + disponibles.map(function (subgrupo) {
      return `<option value="${escaparHtml(subgrupo.id)}">${escaparHtml(subgrupo.nombre)}</option>`;
    }).join("");
    selector.value = estadoGuiaUSFQ.subgrupoId;
  }

  function subgruposVisiblesUSFQ(datos) {
    if (estadoGuiaUSFQ.subgrupoId) {
      return datos.subgrupos.filter(function (subgrupo) { return subgrupo.id === estadoGuiaUSFQ.subgrupoId; });
    }
    if (estadoGuiaUSFQ.grupo) {
      return datos.subgrupos.filter(function (subgrupo) { return subgrupo.grupo === estadoGuiaUSFQ.grupo; });
    }
    return [];
  }

  function renderizarResumenUSFQ(datos) {
    const resumen = document.getElementById("usfq_resumen");
    const subgrupos = subgruposVisiblesUSFQ(datos);
    if (!subgrupos.length) {
      resumen.innerHTML = `<span class="usfq-summary-title">${gruposUSFQ(datos).length} grupos · ${datos.subgrupos.length} subgrupos</span>
        <span class="usfq-summary-chip">Selecciona un subgrupo para consultar su aporte por intercambio.</span>`;
      return;
    }
    resumen.innerHTML = '<span class="usfq-summary-title">Aporte de 1 intercambio:</span>' + subgrupos.map(function (subgrupo) {
      return `<span class="usfq-summary-chip"><strong>${escaparHtml(subgrupo.nombre)}</strong> · ${formatear(subgrupo.carbohidrato)} g CHO · ${formatear(subgrupo.proteina)} g P · ${formatear(subgrupo.grasa)} g G · ${formatear(subgrupo.energia)} kcal</span>`;
    }).join("");
  }

  function filtrarAlimentosUSFQ(datos) {
    const subgrupos = mapaSubgruposUSFQ(datos);
    const palabras = normalizarBusqueda(estadoGuiaUSFQ.texto).match(/[a-z0-9]+/g) || [];
    return datos.alimentos.filter(function (alimento) {
      const subgrupo = subgrupos[alimento.subgrupoId];
      if (!subgrupo) return false;
      if (estadoGuiaUSFQ.grupo && subgrupo.grupo !== estadoGuiaUSFQ.grupo) return false;
      if (estadoGuiaUSFQ.subgrupoId && subgrupo.id !== estadoGuiaUSFQ.subgrupoId) return false;
      if (!estadoGuiaUSFQ.texto.trim()) return true;
      const nombre = normalizarBusqueda(alimento.nombre).split(/[^a-z0-9]+/);
      return palabras.length > 0 && palabras.every(palabra => nombre.some(token => token.startsWith(palabra)));
    });
  }

  // Una sola vista flotante: no se descargan imágenes al dibujar o paginar las fichas.
  function prepararFotosUSFQ(resultados, alimentos) {
    const porId = new Map(alimentos.map(alimento => [alimento.id, alimento]));
    const vista = document.createElement("figure");
    vista.id = "usfq_foto";
    vista.className = "usfq-photo-preview";
    vista.hidden = true;
    vista.innerHTML = `<img decoding="async"><p hidden>No se pudo cargar la ilustración.</p>
      <figcaption id="usfq_foto_pie">
        <strong class="usfq-photo-name"></strong>
        <span class="usfq-photo-serving"></span>
        <span class="usfq-photo-diagram"></span>
        <small>Ilustración orientativa de una porción, no a escala.</small>
      </figcaption>`;
    const imagen = vista.querySelector("img");
    const pie = vista.querySelector("figcaption");
    const error = vista.querySelector("p");
    document.body.appendChild(vista);
    let activo = null;
    let desdePuntero = false;
    let pulsandoVista = false;
    let tipoApertura = "";

    cerrarFoto = function () {
      if (!activo) return;
      activo.textContent = "Ver imagen";
      activo.setAttribute("aria-label", "Ver imagen de " + activo.closest("article").querySelector(".usfq-exchange-food").textContent);
      activo.setAttribute("aria-expanded", "false");
      activo.removeAttribute("aria-describedby");
      activo = null;
      vista.hidden = true;
      pulsandoVista = false;
      imagen.removeAttribute("src");
    };

    function abrir(boton, origen) {
      if (!boton || boton === activo) return;
      const id = boton.dataset.usfqFoto;
      const dato = window.FotosUSFQ?.[id], alimento = porId.get(id);
      if (!dato?.src || !alimento) return;
      cerrarFoto();
      activo = boton;
      tipoApertura = origen;
      const nombre = alimento.nombre;
      const medida = window.PorcionIlustradaUSFQ?.de(alimento) || alimento.medida;
      const peso = Number.isFinite(alimento.gramos) ? formatear(alimento.gramos) + " g" : "peso no indicado";
      imagen.hidden = false;
      error.hidden = true;
      imagen.alt = `${nombre}: 1 intercambio, ${medida} (${peso})`;
      pie.querySelector(".usfq-photo-name").textContent = nombre;
      pie.querySelector(".usfq-photo-serving").textContent = `1 intercambio = ${medida} (${peso})`;
      const diagrama = pie.querySelector(".usfq-photo-diagram");
      diagrama.innerHTML = window.MedidaVisualUSFQ?.render(alimento) || "";
      diagrama.hidden = !diagrama.childElementCount;
      imagen.src = dato.src;
      vista.hidden = false;
      vista.scrollTop = 0;
      boton.textContent = "Ocultar";
      boton.setAttribute("aria-label", "Ocultar imagen de " + nombre);
      boton.setAttribute("aria-expanded", "true");
      boton.setAttribute("aria-describedby", pie.id);
      posicionar();
    }

    function posicionar() {
      if (!activo) return;
      // El teclado en pantalla y el zoom pueden reducir el área visible sin cambiar clientWidth/clientHeight.
      const vp = window.visualViewport;
      const izq = vp?.offsetLeft || 0, arriba = vp?.offsetTop || 0;
      const der = izq + (vp?.width || document.documentElement.clientWidth);
      const abajo = arriba + (vp?.height || document.documentElement.clientHeight);
      vista.style.maxWidth = Math.max(1, der - izq - 12) + "px";
      vista.style.maxHeight = Math.max(1, abajo - arriba - 12) + "px";
      const caja = activo.closest("article").getBoundingClientRect();
      const ancho = vista.offsetWidth, alto = vista.offsetHeight;
      const maxX = der - ancho - 6, maxY = abajo - alto - 6;
      let x = caja.left, y = caja.bottom;
      if (caja.right <= maxX || caja.left >= izq + ancho + 6) {
        x = caja.right <= maxX ? caja.right : caja.left - ancho;
        y = caja.top + (caja.height - alto) / 2;
      } else if (y > maxY && caja.top - arriba > abajo - caja.bottom) {
        y = caja.top - alto;
      }
      vista.style.left = Math.max(izq + 6, Math.min(x, maxX)) + "px";
      vista.style.top = Math.max(arriba + 6, Math.min(y, maxY)) + "px";
    }

    function mostrarError() {
      if (!activo || !imagen.complete || imagen.naturalWidth || !imagen.hasAttribute("src")) return;
      imagen.hidden = true;
      error.hidden = false;
      posicionar();
    }
    imagen.addEventListener("error", mostrarError);
    function botonDeFicha(elemento) {
      return elemento?.closest?.(".usfq-exchange-card")?.querySelector("[data-usfq-foto]");
    }
    resultados.addEventListener("pointerover", function (e) {
      if (e.pointerType !== "mouse") return;
      const boton = botonDeFicha(e.target);
      if (boton && boton !== botonDeFicha(e.relatedTarget)) abrir(boton, "hover");
    });
    function salir(e) {
      if (!activo || e.pointerType !== "mouse" || vista.contains(e.relatedTarget)) return;
      if (!vista.contains(e.target) && botonDeFicha(e.target) !== activo) return;
      if (botonDeFicha(e.relatedTarget) !== activo) cerrarFoto();
    }
    resultados.addEventListener("pointerout", salir);
    vista.addEventListener("pointerleave", salir);
    document.addEventListener("pointerdown", function (e) {
      desdePuntero = true;
      pulsandoVista = vista.contains(e.target);
      if (activo && !pulsandoVista && e.target.closest?.("[data-usfq-foto]") !== activo) cerrarFoto();
    });
    document.addEventListener("keydown", function (e) {
      desdePuntero = false;
      pulsandoVista = false;
      if (e.key === "Escape") cerrarFoto();
    });
    resultados.addEventListener("focusin", function (e) {
      if (!desdePuntero && e.target.matches("[data-usfq-foto]")) abrir(e.target, "teclado");
    });
    resultados.addEventListener("focusout", function (e) {
      if (e.target === activo && !vista.contains(e.relatedTarget) && !(pulsandoVista && !e.relatedTarget)) cerrarFoto();
    });
    vista.addEventListener("focusout", function (e) {
      if (e.relatedTarget !== activo && !vista.contains(e.relatedTarget) && !(pulsandoVista && !e.relatedTarget)) cerrarFoto();
    });
    resultados.addEventListener("click", function (e) {
      const boton = e.target.closest("[data-usfq-foto]");
      if (!boton) return;
      if (activo === boton) cerrarFoto(); else abrir(boton, desdePuntero ? "toque" : "teclado");
    });
    window.addEventListener("scroll", function (e) {
      // Tab puede desplazar automáticamente la tarjeta recién enfocada.
      if (!activo || (e.target instanceof Node && vista.contains(e.target))) return;
      const caja = activo.getBoundingClientRect();
      if (tipoApertura === "teclado" && caja.bottom >= 0 && caja.top <= window.innerHeight) posicionar();
      else cerrarFoto();
    }, { passive: true, capture: true });
    window.addEventListener("resize", posicionar);
    window.visualViewport?.addEventListener("resize", posicionar);
    window.visualViewport?.addEventListener("scroll", posicionar);
    window.addEventListener("blur", cerrarFoto);
  }

  function renderizarGuiaUSFQ() {
    const datos = obtenerDatosUSFQ();
    const resultados = document.getElementById("usfq_resultados");
    if (!datos || !resultados) return;
    cerrarFoto();
    const subgrupos = mapaSubgruposUSFQ(datos);
    const encontrados = filtrarAlimentosUSFQ(datos);
    const visibles = encontrados.slice(0, estadoGuiaUSFQ.limite);
    resultados.innerHTML = visibles.map(function (alimento) {
      const subgrupo = subgrupos[alimento.subgrupoId];
      const medida = alimento.medida.replace(/(^|[;:,]\s*)([¼½¾⅐-⅞]) (taza|vaso)\b/g, "$1$2 de $3");
      const peso = Number.isFinite(alimento.gramos) ? ` (${formatear(alimento.gramos)} g)` : "";
      const foto = window.FotosUSFQ?.[alimento.id];
      const botonFoto = foto?.src ? `<button type="button" class="usfq-photo-trigger" data-usfq-foto="${escaparHtml(alimento.id)}" aria-controls="usfq_foto" aria-expanded="false" aria-label="Ver imagen de ${escaparHtml(alimento.nombre)}">Ver imagen</button>` : "";
      return `<article class="usfq-exchange-card">
        <div class="usfq-food-heading"><h5 class="usfq-exchange-food">${escaparHtml(alimento.nombre)}</h5>${botonFoto}</div>
        <p class="usfq-exchange-portion">1 intercambio = <strong>${escaparHtml(medida)}${peso}</strong></p>
        <div class="usfq-exchange-meta">
          <span>${escaparHtml(subgrupo.grupo)}</span>
          ${subgrupo.nombre === subgrupo.grupo ? "" : `<span>${escaparHtml(subgrupo.nombre)}</span>`}
          <span>USFQ, pp. ${escaparHtml(alimento.pagina)}</span>
          ${peso ? "" : "<span>Peso no indicado</span>"}
        </div>
      </article>`;
    }).join("");
    document.getElementById("usfq_contador").textContent = encontrados.length
      ? `Mostrando ${visibles.length} de ${encontrados.length} alimentos`
      : "0 alimentos";
    document.getElementById("usfq_vacio").hidden = encontrados.length > 0;
    const mostrarMas = document.getElementById("usfq_mostrar_mas");
    mostrarMas.hidden = visibles.length >= encontrados.length;
    renderizarResumenUSFQ(datos);
  }

  function inicializarGuiaUSFQ() {
    const contenedor = document.getElementById("usfq_catalogo");
    if (!contenedor) return;
    const datos = obtenerDatosUSFQ();
    if (!datos) {
      ["usfq_busqueda", "usfq_grupo", "usfq_subgrupo"].forEach(function (id) {
        const campo = document.getElementById(id);
        if (campo) campo.disabled = true;
      });
      document.getElementById("usfq_contador").textContent = "No se pudo cargar la guía USFQ.";
      document.getElementById("usfq_vacio").hidden = true;
      return;
    }
    const selectorGrupo = document.getElementById("usfq_grupo");
    selectorGrupo.innerHTML = '<option value="">Todos los grupos</option>' + gruposUSFQ(datos).map(function (grupo) {
      return `<option value="${escaparHtml(grupo)}">${escaparHtml(grupo)}</option>`;
    }).join("");
    ["usfq_busqueda", "usfq_grupo", "usfq_subgrupo"].forEach(id => { document.getElementById(id).disabled = false; });
    estadoGuiaUSFQ.texto = document.getElementById("usfq_busqueda").value;
    prepararFotosUSFQ(document.getElementById("usfq_resultados"), datos.alimentos);
    renderizarOpcionesSubgruposUSFQ(datos);
    document.getElementById("usfq_busqueda").addEventListener("input", function (event) {
      estadoGuiaUSFQ.texto = event.target.value;
      estadoGuiaUSFQ.limite = USFQ_TAMANO_PAGINA;
      renderizarGuiaUSFQ();
    });
    document.getElementById("usfq_grupo").addEventListener("change", function (event) {
      const datos = obtenerDatosUSFQ();
      estadoGuiaUSFQ.grupo = event.target.value;
      estadoGuiaUSFQ.subgrupoId = "";
      estadoGuiaUSFQ.limite = USFQ_TAMANO_PAGINA;
      if (datos) renderizarOpcionesSubgruposUSFQ(datos);
      renderizarGuiaUSFQ();
    });
    document.getElementById("usfq_subgrupo").addEventListener("change", function (event) {
      estadoGuiaUSFQ.subgrupoId = event.target.value;
      estadoGuiaUSFQ.limite = USFQ_TAMANO_PAGINA;
      renderizarGuiaUSFQ();
    });
    document.getElementById("usfq_mostrar_mas").addEventListener("click", function () {
      estadoGuiaUSFQ.limite += USFQ_TAMANO_PAGINA;
      renderizarGuiaUSFQ();
    });
    renderizarGuiaUSFQ();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", inicializarGuiaUSFQ, { once: true });
  else inicializarGuiaUSFQ();
})();
