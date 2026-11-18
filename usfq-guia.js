(function () {
  "use strict";
  const formato = new Intl.NumberFormat("es-EC", { maximumFractionDigits: 2 });
  const formatear = valor => formato.format(valor);
  const USFQ_TAMANO_PAGINA = 36;

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

  function renderizarGuiaUSFQ() {
    const datos = obtenerDatosUSFQ();
    const resultados = document.getElementById("usfq_resultados");
    if (!datos || !resultados) return;
    const subgrupos = mapaSubgruposUSFQ(datos);
    const encontrados = filtrarAlimentosUSFQ(datos);
    const visibles = encontrados.slice(0, estadoGuiaUSFQ.limite);
    resultados.innerHTML = visibles.map(function (alimento) {
      const subgrupo = subgrupos[alimento.subgrupoId];
      const peso = Number.isFinite(alimento.gramos) ? `${formatear(alimento.gramos)} g` : "Peso no indicado";
      return `<article class="usfq-exchange-card">
        <div class="usfq-exchange-card-header">
          <h5 class="usfq-exchange-food">${escaparHtml(alimento.nombre)}</h5>
          <span class="usfq-exchange-badge">${peso}</span>
        </div>
        <p class="usfq-exchange-portion">${escaparHtml(alimento.medida)}</p>
        <div class="usfq-exchange-meta">
          <span>${escaparHtml(subgrupo.grupo)}</span>
          <span>${escaparHtml(subgrupo.nombre)}</span>
          <span>Tabla pp. ${escaparHtml(alimento.pagina)}</span>
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
