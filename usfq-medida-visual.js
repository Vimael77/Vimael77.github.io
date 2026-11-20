(function () {
  "use strict";

  // Esquema de la MISMA alternativa de medida que se usó para preparar la
  // ilustración. Nunca deduce cantidades de los gramos ni suma alternativas.
  const fracciones = { "⅛": 1/8, "¼": 1/4, "⅓": 1/3, "⅜": 3/8, "½": 1/2,
    "⅝": 5/8, "⅔": 2/3, "¾": 3/4, "⅞": 7/8 };
  const cantidad = /^(?:(\d+)\s+)?(\d+)\/(\d+)\s+|^(\d+(?:[.,]\d+)?)?\s*([⅛¼⅓⅜½⅝⅔¾⅞])\s+|^(\d+(?:[.,]\d+)?)\s+/;
  const formas = [
    [/^(?:tazas?)\b/i, "taza"],
    [/^(?:vasos?)\b/i, "vaso"],
    [/^(?:bowl|taz[oó]n)(?:es|s)?\b/i, "bowl"],
    [/^(?:cda\.?s?\.?|cucharadas?)\s*(?=\s|$)/i, "cuchara"],
    [/^(?:cdta\.?s?\.?|cucharaditas?)\s*(?=\s|$)/i, "cucharita"],
    [/^(?:unidades|unidad|trozos?|pedazos?|rodajas?|medias rodajas?|mitades|gajos?|láminas?|filetes?|bolas?|hojas?|costillas?|presas?|barras?|mazorcas?|piernas?|brazos?|puñados?|galletas?|ciruelas?|mandarinas?|chuletas?)\b/i, "pieza"]
  ];
  const trazo = 'fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"';
  const contornos = {
    taza: '<path d="M4 5h16v16H4z M20 7h1.5a3.5 3.5 0 0 1 0 7H20"/>',
    vaso: '<path d="M5 3h14v18H5z"/>',
    bowl: '<path d="M2 10h22c-1.5 7-5.2 11-11 11S3.5 17 2 10Z"/>',
    cuchara: '<ellipse cx="8.5" cy="12" rx="6.5" ry="4.5"/><path d="M15 12h10"/>',
    cucharita: '<ellipse cx="8.5" cy="12" rx="5" ry="3.5"/><path d="M13.5 12h9"/>',
    pieza: '<circle cx="12" cy="12" r="8.5"/>'
  };
  function simbolo(tipo, parte, x) {
    const forma = contornos[tipo];
    let relleno;
    if (tipo === "pieza") {
      const a = 2 * Math.PI * parte - Math.PI / 2;
      relleno = parte === 1 ? forma :
        '<path d="M12 12V3.5A8.5 8.5 0 ' + (parte > .5 ? 1 : 0) + ' 1 ' +
        (12 + 8.5 * Math.cos(a)).toFixed(3) + ' ' + (12 + 8.5 * Math.sin(a)).toFixed(3) + 'Z"/>';
    } else if (tipo === "cuchara" || tipo === "cucharita") {
      const chica = tipo === "cucharita";
      relleno = '<svg overflow="hidden" width="' + ((chica ? 3.5 : 2) + (chica ? 10 : 13) * parte) + '" height="24">' +
        '<ellipse cx="8.5" cy="12" rx="' + (chica ? 5 : 6.5) + '" ry="' + (chica ? 3.5 : 4.5) + '"/></svg>';
    } else {
      const alto = tipo === "taza" ? 16 : tipo === "vaso" ? 18 : 11;
      const tope = 21 - alto * parte;
      const interior = tipo === "bowl" ? '<path d="M2 10h22c-1.5 7-5.2 11-11 11S3.5 17 2 10Z"/>' :
        '<rect x="' + (tipo === "taza" ? 4 : 5) + '" y="' + (21 - alto) + '" width="' + (tipo === "taza" ? 16 : 14) + '" height="' + alto + '"/>';
      // Un SVG anidado recorta el contenido sin IDs de clipPath compartidos.
      relleno = '<svg y="' + tope + '" width="26" height="' + (21 - tope) + '" overflow="hidden">' +
        '<g transform="translate(0 -' + tope + ')">' + interior + '</g></svg>';
    }
    return '<g transform="translate(' + x + ' 0)"><g fill="currentColor" opacity=".6">' +
      relleno + '</g><g ' + trazo + '>' + forma + '</g></g>';
  }

  function render(alimento) {
    const etiqueta = alimento && window.PorcionIlustradaUSFQ?.de(alimento);
    if (typeof etiqueta !== "string" || !etiqueta) return "";
    // El prefijo puede identificar un tamaño o preparación. Se conserva en
    // la etiqueta visible; no se combinan dos condiciones o cantidades.
    const medida = etiqueta.trim().replace(/^[^:;()\d]{1,40}:\s*/, "");
    if (/[;]/.test(medida) || /\s+o\s+\d/.test(medida)) return "";
    const n = medida.match(cantidad);
    if (!n) return "";
    const valor = n[3] ? Number(n[1] || 0) + Number(n[2]) / Number(n[3]) :
      (Number((n[4] || n[6] || "0").replace(",", ".")) + (fracciones[n[5]] || 0));
    if (!Number.isFinite(valor) || valor <= 0 || valor > 100) return "";
    const unidad = medida.slice(n[0].length).replace(/^de\s+(?:una?\s+)?/i, "");
    const tipo = formas.find(([patron]) => patron.test(unidad))?.[1];
    if (!tipo) return "";
    const resumir = valor > 5;
    const iconos = resumir ? 1 : Math.ceil(valor);
    let interior = "";
    for (let i = 0; i < iconos; ++i) interior += simbolo(tipo, resumir ? 1 : Math.min(1, valor - i), i * 27);
    const ancho = iconos * 27;
    const texto = etiqueta.replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[c]);
    return '<span class="usfq-medida-visual"><svg aria-hidden="true" focusable="false" width="' + ancho + '" height="24" viewBox="0 0 ' + ancho + ' 24">' +
      interior + '</svg>' + (resumir ? '<span aria-hidden="true">×</span>' : '') + '<span>' + texto + '</span></span>';
  }
  window.MedidaVisualUSFQ = Object.freeze({ render });
})();
