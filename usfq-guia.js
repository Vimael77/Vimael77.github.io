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
  let fotosUSFQInicializado = false;
  function prepararFotosUSFQ(resultados, alimentos) {
    if (fotosUSFQInicializado) return;
    fotosUSFQInicializado = true;

    const porId = new Map(alimentos.map(alimento => [alimento.id, alimento]));
    let vista = document.getElementById("usfq_foto");
    if (!vista) {
      vista = document.createElement("figure");
      vista.id = "usfq_foto";
      vista.className = "usfq-photo-preview";
      vista.hidden = true;
      vista.innerHTML = `<img decoding="async"><p hidden>No se pudo cargar la ilustración.</p>
        <figcaption id="usfq_foto_pie">
          <strong class="usfq-photo-name"></strong>
          <span class="usfq-photo-serving"></span>
          <div class="usfq-photo-macros"></div>
          <span class="usfq-photo-diagram"></span>
          <small>Ilustración orientativa de una porción, no a escala.</small>
        </figcaption>`;
      document.body.appendChild(vista);
    }
    const imagen = vista.querySelector("img");
    const pie = vista.querySelector("figcaption");
    const error = vista.querySelector("p");
    let activo = null;
    let desdePuntero = false;
    let pulsandoVista = false;
    let tipoApertura = "";

    cerrarFoto = function () {
      if (activo) {
        activo.classList.remove("usfq-card-active");
        activo.removeAttribute("aria-expanded");
        activo.removeAttribute("aria-describedby");
        activo = null;
      }
      vista.hidden = true;
      pulsandoVista = false;
      imagen.removeAttribute("src");
    };

    function abrir(tarjeta, origen) {
      if (!tarjeta) return;
      if (tarjeta === activo) return;
      const id = tarjeta.dataset.usfqId;
      const dato = window.FotosUSFQ?.[id], alimento = porId.get(id);
      if (!dato?.src || !alimento) {
        cerrarFoto();
        return;
      }
      cerrarFoto();
      activo = tarjeta;
      activo.classList.add("usfq-card-active");
      activo.setAttribute("aria-expanded", "true");
      activo.setAttribute("aria-describedby", pie.id);
      tipoApertura = origen;
      const nombre = alimento.nombre;
      const medida = window.PorcionIlustradaUSFQ?.de(alimento) || alimento.medida;
      const peso = Number.isFinite(alimento.gramos) ? formatear(alimento.gramos) + " g" : "peso no indicado";
      imagen.hidden = false;
      error.hidden = true;
      imagen.alt = `${nombre}: 1 intercambio, ${medida} (${peso})`;
      pie.querySelector(".usfq-photo-name").textContent = nombre;
      pie.querySelector(".usfq-photo-serving").textContent = `1 intercambio = ${medida} (${peso})`;
      const macrosPie = pie.querySelector(".usfq-photo-macros");
      if (macrosPie) {
        const datos = obtenerDatosUSFQ();
        const mapa = datos ? mapaSubgruposUSFQ(datos) : {};
        const subgrupo = mapa[alimento.subgrupoId];
        if (subgrupo) {
          macrosPie.innerHTML = `
            <div class="usfq-card-macros">
              <span class="usfq-macro-badge usfq-macro-cho">Carbohidratos: <strong>${formatear(subgrupo.carbohidrato)} g</strong></span>
              <span class="usfq-macro-badge usfq-macro-prot">Proteínas: <strong>${formatear(subgrupo.proteina)} g</strong></span>
              <span class="usfq-macro-badge usfq-macro-grasa">Grasas: <strong>${formatear(subgrupo.grasa)} g</strong></span>
              <span class="usfq-macro-badge usfq-macro-kcal"><strong>${formatear(subgrupo.energia)} kcal</strong></span>
            </div>`;
          macrosPie.hidden = false;
        } else {
          macrosPie.hidden = true;
        }
      }
      const diagrama = pie.querySelector(".usfq-photo-diagram");
      diagrama.innerHTML = window.MedidaVisualUSFQ?.render(alimento) || "";
      diagrama.hidden = !diagrama.childElementCount;
      imagen.src = dato.src;
      vista.hidden = false;
      vista.scrollTop = 0;
      posicionar();
    }

    function posicionar() {
      if (!activo) return;
      const vp = window.visualViewport;
      const izq = vp?.offsetLeft || 0, arriba = vp?.offsetTop || 0;
      const der = izq + (vp?.width || document.documentElement.clientWidth);
      const abajo = arriba + (vp?.height || document.documentElement.clientHeight);
      vista.style.maxWidth = Math.max(1, der - izq - 16) + "px";
      vista.style.maxHeight = Math.max(1, abajo - arriba - 16) + "px";
      const caja = activo.getBoundingClientRect();
      const ancho = vista.offsetWidth || 280, alto = vista.offsetHeight || 260;
      const maxX = der - ancho - 8, maxY = abajo - alto - 8;

      let x = caja.right + 10;
      let y = caja.top;

      if (x > maxX) {
        x = caja.left - ancho - 10;
      }
      if (x < izq + 8) {
        x = Math.max(izq + 8, Math.min(caja.left, maxX));
        y = caja.bottom + 8;
        if (y + alto > maxY) {
          y = Math.max(arriba + 8, caja.top - alto - 8);
        }
      }
      if (y + alto > maxY) {
        y = Math.max(arriba + 8, maxY);
      }
      if (y < arriba + 8) {
        y = arriba + 8;
      }

      vista.style.left = Math.round(x) + "px";
      vista.style.top = Math.round(y) + "px";
    }

    function mostrarError() {
      if (!activo || !imagen.complete || imagen.naturalWidth || !imagen.hasAttribute("src")) return;
      imagen.hidden = true;
      error.hidden = false;
      posicionar();
    }
    imagen.addEventListener("error", mostrarError);

    // Detección directa sobre tarjetas
    resultados.addEventListener("pointerover", function (e) {
      const tarjeta = e.target.closest(".usfq-exchange-card");
      if (tarjeta && tarjeta !== activo) {
        abrir(tarjeta, "hover");
      }
    });

    resultados.addEventListener("pointerout", function (e) {
      if (!activo) return;
      const related = e.relatedTarget;
      if (!related || !activo.contains(related)) {
        cerrarFoto();
      }
    });

    // Verificación infalible a nivel de documento:
    // Al tener .usfq-photo-preview pointer-events: none, la vista flotante nunca roba el puntero.
    // Si el cursor no está dentro de la tarjeta activa, se cierra al instante.
    document.addEventListener("pointermove", function (e) {
      if (!activo) return;
      if (!activo.contains(e.target)) {
        cerrarFoto();
      }
    });

    document.addEventListener("mouseleave", function () {
      cerrarFoto();
    });

    document.addEventListener("pointerdown", function (e) {
      desdePuntero = true;
      pulsandoVista = vista.contains(e.target);
      if (activo && !pulsandoVista && !activo.contains(e.target)) {
        cerrarFoto();
      }
    });

    document.addEventListener("keydown", function (e) {
      desdePuntero = false;
      pulsandoVista = false;
      if (e.key === "Escape") cerrarFoto();
    });

    resultados.addEventListener("focusin", function (e) {
      const tarjeta = e.target.closest(".usfq-exchange-card");
      if (tarjeta) abrir(tarjeta, "teclado");
    });

    resultados.addEventListener("focusout", function (e) {
      if (!activo) return;
      const related = e.relatedTarget;
      if (!related || !activo.contains(related)) {
        cerrarFoto();
      }
    });

    resultados.addEventListener("click", function (e) {
      const tarjeta = e.target.closest(".usfq-exchange-card");
      if (!tarjeta) return;
      if (activo === tarjeta) {
        cerrarFoto();
      } else {
        abrir(tarjeta, desdePuntero ? "toque" : "click");
      }
    });

    window.addEventListener("scroll", function () {
      cerrarFoto();
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
      return `<article class="usfq-exchange-card" data-usfq-id="${escaparHtml(alimento.id)}" tabindex="0" role="button" aria-haspopup="dialog" aria-expanded="false" title="Pasa el mouse para ver la imagen de porción">
        <div class="usfq-food-heading"><h5 class="usfq-exchange-food">${escaparHtml(alimento.nombre)}</h5></div>
        <p class="usfq-exchange-portion">1 intercambio = <strong>${escaparHtml(medida)}${peso}</strong></p>
        <div class="usfq-card-macros" aria-label="Nutrientes por intercambio">
          <span class="usfq-macro-badge usfq-macro-cho">Carbohidratos: <strong>${formatear(subgrupo.carbohidrato)} g</strong></span>
          <span class="usfq-macro-badge usfq-macro-prot">Proteínas: <strong>${formatear(subgrupo.proteina)} g</strong></span>
          <span class="usfq-macro-badge usfq-macro-grasa">Grasas: <strong>${formatear(subgrupo.grasa)} g</strong></span>
          <span class="usfq-macro-badge usfq-macro-kcal"><strong>${formatear(subgrupo.energia)} kcal</strong></span>
        </div>
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
  window.inicializarGuiaUSFQ = inicializarGuiaUSFQ;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", inicializarGuiaUSFQ, { once: true });
  else inicializarGuiaUSFQ();
})();
