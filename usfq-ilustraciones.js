(function () {
  "use strict";

  // El ID estable del catálogo identifica el recurso; no depende del texto
  // de la búsqueda, de la posición de la tarjeta ni del tamaño de página.
  const catalogo = window.IntercambiosUSFQ;
  const fotos = Object.create(null);
  if (catalogo) {
    for (const { id } of catalogo.alimentos) {
      fotos[id] = Object.freeze({ src: "media/usfq/" + id + ".webp?v=porcion-2" });
    }
  }
  window.FotosUSFQ = Object.freeze(fotos);
})();
